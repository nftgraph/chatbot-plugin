import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

/*
const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;
*/
const CONDENSE_PROMPT = `次のような会話とフォローアップの質問がある場合、フォローアップの質問を独立した質問となるように言い換えなさい。回答は日本語で行って下さい。

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// change to your own 'system' prompt
/*
const QA_PROMPT = `You are an AI assistant providing helpful advice. Use the following pieces of context to answer the question at the end.
If you don't know the answer based on the context below, just say "Hmm, I'm not sure." DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
Please be sure to answer in Japanese.

{context}

Question: {question}
Helpful answer in markdown:`;
*/
const QA_PROMPT = `あなたは、役立つアドバイスを提供するAIアシスタントです。以下のコンテキストを利用して、最後にある質問に答えてください。
もし、以下のコンテキストから答えがわからない場合は、"うーん、どうでしょう"と言ってください。答えを作ろうとしないでください。
質問がコンテキストと関係ない場合は、コンテキストに関係する質問にしか答えられないように調整されていることを丁寧に答えてください。

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: PineconeStore, openaiApiKey: string) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo',
    //modelName: 'gpt-4',
    openAIApiKey: openaiApiKey, //change this to gpt-4 if you have access to the api
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(5),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );

  return chain;
};
