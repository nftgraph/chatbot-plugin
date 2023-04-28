import { KeyValuePair } from './data';

export interface Plugin {
  id: PluginID;
  name: PluginName;
  requiredKeys: KeyValuePair[];
}

export interface PluginKey {
  pluginId: PluginID;
  requiredKeys: KeyValuePair[];
}

export enum PluginID {
  GOOGLE_SEARCH = 'google-search',
  INCONTEXT_LEARNING = 'incontext-learning', // 新しいプラグインID
}

export enum PluginName {
  GOOGLE_SEARCH = 'Google Search',
  INCONTEXT_LEARNING = 'In-Context Learning', // 新しいプラグイン名
}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.GOOGLE_SEARCH]: {
    id: PluginID.GOOGLE_SEARCH,
    name: PluginName.GOOGLE_SEARCH,
    requiredKeys: [
      {
        key: 'GOOGLE_API_KEY',
        value: '',
      },
      {
        key: 'GOOGLE_CSE_ID',
        value: '',
      },
    ],
  },

  [PluginID.INCONTEXT_LEARNING]: {
    // 新しいプラグイン
    id: PluginID.INCONTEXT_LEARNING,
    name: PluginName.INCONTEXT_LEARNING,
    requiredKeys: [
      {
        key: 'PINECONE_API_KEY',
        value: '',
      },
      {
        key: 'PINECONE_ENVIRONMENT',
        value: '',
      },
      {
        key: 'PINECONE_INDEX_NAME',
        value: '',
      },
    ],
  },
};

export const PluginList = Object.values(Plugins);
