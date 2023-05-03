import { ChatBody, Message } from './chat';
import { OpenAIModelID } from '@/types/openai';


export interface IncontextBody extends ChatBody {
  pineconeApiKey: string;
  pineconeEnvironment: string;
  pineconeIndex: string;
  defaultModelId: OpenAIModelID;
}

export interface IncontextResponse {
  message: Message;
}

export interface IncontextSource {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  image: string;
  text: string;
}
