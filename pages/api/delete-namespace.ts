import type { NextApiRequest, NextApiResponse } from 'next';
import { PINECONE_NAME_SPACE } from '@/config/pinecone';
import { createPineconeIndex } from '@/utils/server/pinecone-client';

interface DeleteRequest {
  ids?: Array<string>;
  deleteAll?: boolean;
  namespace?: string;
  filter?: object;
}

interface DeleteOperationRequest {
  deleteRequest: DeleteRequest;
}

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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { credentials }: { credentials: Credentials } = req.body;

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

  try {
    if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
      throw new Error(
        'One or more required configuration properties are missing.',
      );
    }
    
    const index = await createPineconeIndex({
      pineconeApiKey: pineconeApiKey,
      pineconeEnvironment: pineconeEnvironment,
      pineconeIndexName: pineconeIndexName,
    });

    await index._deleteRaw({
      deleteRequest: {
        deleteAll: true,
        namespace: PINECONE_NAME_SPACE,
      },
    });
    res.status(200).json({ message: 'delete successful' });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
