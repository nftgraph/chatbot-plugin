import { pinecone } from '@/utils/server/pinecone-local-client';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import fs from 'fs/promises';

export const run = async () => {
  try {
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME as string);

    const embedder = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const query = await embedder.embedQuery('Test'); //You can change this query and it will re-arrange the results based on score

    const queryRequest = {
      // id: if you know an id you can query it
      vector: query,
      topK: 10000, //adjust how many results you want
      includeMetadata: true,
      namespace: `${process.env.PINECONE_NAME_SPACE as string}`,
    };

    const queryResponse = await index.query({ queryRequest });

    const matches = queryResponse?.matches;
    if (matches) {
      // Access the `matches` property safely here
      const docs = matches.map((el, index) => {
        const bank = {
          documentCount: index,
          id: el.id,
          score: el.score,
          metadata: el.metadata,
        };

        return bank;
      });

      await fs.writeFile('documents.json', JSON.stringify(docs, null, 2));
    } else {
      // Handle the case where `matches` is undefined
    }
  } catch (err) {
    console.log(err);
  }
};

(async () => {
  await run();
  console.log('return vectors complete');
})();
