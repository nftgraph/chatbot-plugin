import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/server/makechain';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';
import { createPineconeIndex } from '@/utils/server/pinecone-client';
import { IncontextBody, IncontextSource } from '@/types/incontext';
import { OpenAIError } from '@/utils/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { messages, key, model, pineconeApiKey, pineconeEnvironment, pineconeIndex } = req.body as IncontextBody;

  /*
  console.log(
    "pineconeApiKey:", pineconeApiKey,
    "pineconeEnvironment:", pineconeEnvironment,
    "pineconeIndex:", pineconeIndex);
  */
    console.log('key', key)
  //const { question, history, credentials } = req.body;
  const question = messages[messages.length - 1].content;
  //console.log(question)

  const history = messages.map(message => message.content);
  //console.log('history', history)

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: pineconeApiKey ? pineconeApiKey : process.env.PINECONE_API_KEY,
      pineconeEnvironment: pineconeEnvironment ? pineconeEnvironment : process.env.PINECONE_ENVIRONMENT,
      pineconeIndexName: pineconeIndex ? pineconeIndex : process.env.PINECONE_INDEX_NAME,
    });

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: key ? key : process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    );

    //create chain
    const chain = makeChain(vectorStore, key ? key : process.env.OPENAI_API_KEY);
    //Ask a question
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
