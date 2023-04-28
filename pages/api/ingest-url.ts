import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createPineconeIndex } from '@/utils/server/pinecone-client';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { extractTextFromWebsiteUrl } from '@/utils/server/extractTextFromWebsiteUrl';

interface RequiredKeys {
  key: string;
  value: string;
}

interface Credentials {
  requiredKeys: RequiredKeys[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { credentials, url, apiKey } :{ credentials: Credentials, url:string, apiKey:string } = req.body;

  console.log('url', url, 'credentials', credentials, 'apikey', apiKey);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const rawDocs = await extractTextFromWebsiteUrl(url);

    //change chunk size and overlap to get different results
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 20,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    //console.log('docs', docs)

    // /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey ? apiKey : process.env.OPENAI_API_KEY,
    });

    console.log('credentials', credentials.requiredKeys);
    const pineconeApiKey = credentials.requiredKeys.find(
      (k) => k.key === 'PINECONE_API_KEY',
    )?.value;
    const pineconeEnvironment = credentials.requiredKeys.find(
      (k) => k.key === 'PINECONE_ENVIRONMENT',
    )?.value;
    const pineconeIndexName = credentials.requiredKeys.find(
      (k) => k.key === 'PINECONE_INDEX_NAME',
    )?.value;

    const index = await createPineconeIndex({
      pineconeApiKey: pineconeApiKey ? pineconeApiKey : process.env.PINECONE_API_KEY,
      pineconeEnvironment: pineconeEnvironment ? pineconeEnvironment : process.env.PINECONE_ENVIRONMENT,
      pineconeIndexName: pineconeIndexName ? pineconeIndexName : process.env.PINECONE_INDEX_NAME,
    });

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
    console.log('done')
    res.status(200).json({ rawDocs });
  } catch (e: any) {
    console.log('error')
    res.status(500).json({ error: e.message || 'Unknown error.' });
  } finally {
    res.end();
  }
}
