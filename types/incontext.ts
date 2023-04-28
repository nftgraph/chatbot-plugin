import { ChatBody, Message } from './chat';

export interface IncontextBody extends ChatBody {
  pineconeApiKey: string;
  pineconeEnvironment: string;
  pineconeIndex: string;
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
