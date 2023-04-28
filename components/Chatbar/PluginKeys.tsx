import { PluginID, PluginKey } from '@/types/plugin';
import { IconKey } from '@tabler/icons-react';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarButton } from '../Sidebar/SidebarButton';

interface Props {
  pluginKeys: PluginKey[];
  onPluginKeyChange: (pluginKey: PluginKey) => void;
  onClearPluginKey: (pluginKey: PluginKey) => void;
}

export const PluginKeys: FC<Props> = ({
  pluginKeys,
  onPluginKeyChange,
  onClearPluginKey,
}) => {
  const { t } = useTranslation('sidebar');

  const [isChanging, setIsChanging] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsChanging(false);
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      setIsChanging(false);
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  function handleToggle1() {
    setIsOpen1((prevState) => !prevState);
  }

  function handleToggle2() {
    setIsOpen2((prevState) => !prevState);
  }

  function handleToggle3() {
    setIsOpen3((prevState) => !prevState);
  }

  return (
    <>
      <SidebarButton
        text={t('Plugin Keys')}
        icon={<IconKey size={18} />}
        onClick={() => setIsChanging(true)}
      />

      {isChanging && (
        <div
          className="z-100 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onKeyDown={handleEnter}
        >
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              />

              <div
                ref={modalRef}
                className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-hidden rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[900px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                role="dialog"
              >
                <div className="mb-10 text-4xl">Plugin Keys</div>

                <div className="mt-6 rounded border p-4">
                  <div className="text-xl font-bold cursor-pointer flex items-center" onClick={handleToggle1}>
                    Google Search Plugin
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`h-6 w-6 ${isOpen1 ? 'transform rotate-180' : ''}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12.586L6.707 9.293a1 1 0 00-1.414 1.414l4.242 4.243a1 1 0 001.415 0l4.242-4.243a1 1 0 10-1.414-1.414L10 12.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {isOpen1 && (
                    <div>
                      <div className="mt-4 italic">
                        Please enter your Google API Key and Google CSE ID to enable
                        the Google Search Plugin.
                      </div>

                      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                        Google API Key
                      </div>
                      <input
                        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                        type="password"
                        value={
                          pluginKeys
                            .find((p) => p.pluginId === PluginID.GOOGLE_SEARCH)
                            ?.requiredKeys.find((k) => k.key === 'GOOGLE_API_KEY')
                            ?.value
                        }
                        onChange={(e) => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.GOOGLE_SEARCH,
                          );

                          if (pluginKey) {
                            const requiredKey = pluginKey.requiredKeys.find(
                              (k) => k.key === 'GOOGLE_API_KEY',
                            );

                            if (requiredKey) {
                              const updatedPluginKey = {
                                ...pluginKey,
                                requiredKeys: pluginKey.requiredKeys.map((k) => {
                                  if (k.key === 'GOOGLE_API_KEY') {
                                    return {
                                      ...k,
                                      value: e.target.value,
                                    };
                                  }

                                  return k;
                                }),
                              };

                              onPluginKeyChange(updatedPluginKey);
                            }
                          } else {
                            const newPluginKey: PluginKey = {
                              pluginId: PluginID.GOOGLE_SEARCH,
                              requiredKeys: [
                                {
                                  key: 'GOOGLE_API_KEY',
                                  value: e.target.value,
                                },
                                {
                                  key: 'GOOGLE_CSE_ID',
                                  value: '',
                                },
                              ],
                            };

                            onPluginKeyChange(newPluginKey);
                          }
                        }}
                      />

                      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                        Google CSE ID
                      </div>
                      <input
                        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                        type="password"
                        value={
                          pluginKeys
                            .find((p) => p.pluginId === PluginID.GOOGLE_SEARCH)
                            ?.requiredKeys.find((k) => k.key === 'GOOGLE_CSE_ID')
                            ?.value
                        }
                        onChange={(e) => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.GOOGLE_SEARCH,
                          );

                          if (pluginKey) {
                            const requiredKey = pluginKey.requiredKeys.find(
                              (k) => k.key === 'GOOGLE_CSE_ID',
                            );

                            if (requiredKey) {
                              const updatedPluginKey = {
                                ...pluginKey,
                                requiredKeys: pluginKey.requiredKeys.map((k) => {
                                  if (k.key === 'GOOGLE_CSE_ID') {
                                    return {
                                      ...k,
                                      value: e.target.value,
                                    };
                                  }

                                  return k;
                                }),
                              };

                              onPluginKeyChange(updatedPluginKey);
                            }
                          } else {
                            const newPluginKey: PluginKey = {
                              pluginId: PluginID.GOOGLE_SEARCH,
                              requiredKeys: [
                                {
                                  key: 'GOOGLE_API_KEY',
                                  value: '',
                                },
                                {
                                  key: 'GOOGLE_CSE_ID',
                                  value: e.target.value,
                                },
                              ],
                            };

                            onPluginKeyChange(newPluginKey);
                          }
                        }}
                      />

                      <button
                        className="mt-6 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
                        onClick={() => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.GOOGLE_SEARCH,
                          );

                          if (pluginKey) {
                            onClearPluginKey(pluginKey);
                          }
                        }}
                      >
                        Clear Google Search Plugin Keys
                      </button>
                    </div>
                  )}

                </div>

                <div className="mt-6 rounded border p-4">
                  <div className="text-xl font-bold cursor-pointer flex items-center" onClick={handleToggle2}>
                    Pinecone Vector DB
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`h-6 w-6 ${isOpen2 ? 'transform rotate-180' : ''}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12.586L6.707 9.293a1 1 0 00-1.414 1.414l4.242 4.243a1 1 0 001.415 0l4.242-4.243a1 1 0 10-1.414-1.414L10 12.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isOpen2 && (
                    <div>
                      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                        Pinecone API Key
                      </div>
                      <input
                        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                        type="password"
                        value={
                          pluginKeys
                            .find((p) => p.pluginId === PluginID.INCONTEXT_LEARNING)
                            ?.requiredKeys.find((k) => k.key === 'PINECONE_API_KEY')
                            ?.value
                        }
                        onChange={(e) => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.INCONTEXT_LEARNING,
                          );

                          if (pluginKey) {
                            const requiredKey = pluginKey.requiredKeys.find(
                              (k) => k.key === 'PINECONE_API_KEY',
                            );

                            if (requiredKey) {
                              const updatedPluginKey = {
                                ...pluginKey,
                                requiredKeys: pluginKey.requiredKeys.map((k) => {
                                  if (k.key === 'PINECONE_API_KEY') {
                                    return {
                                      ...k,
                                      value: e.target.value,
                                    };
                                  }

                                  return k;
                                }),
                              };

                              onPluginKeyChange(updatedPluginKey);
                            }
                          } else {
                            const newPluginKey: PluginKey = {
                              pluginId: PluginID.INCONTEXT_LEARNING,
                              requiredKeys: [
                                {
                                  key: 'PINECONE_API_KEY',
                                  value: e.target.value,
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
                            };

                            onPluginKeyChange(newPluginKey);
                          }
                        }}
                      />
                      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                        Pinecone Environment
                      </div>
                      <input
                        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                        type="password"
                        value={
                          pluginKeys
                            .find((p) => p.pluginId === PluginID.INCONTEXT_LEARNING)
                            ?.requiredKeys.find((k) => k.key === 'PINECONE_ENVIRONMENT')
                            ?.value
                        }
                        onChange={(e) => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.INCONTEXT_LEARNING,
                          );

                          if (pluginKey) {
                            const requiredKey = pluginKey.requiredKeys.find(
                              (k) => k.key === 'PINECONE_ENVIRONMENT',
                            );

                            if (requiredKey) {
                              const updatedPluginKey = {
                                ...pluginKey,
                                requiredKeys: pluginKey.requiredKeys.map((k) => {
                                  if (k.key === 'PINECONE_ENVIRONMENT') {
                                    return {
                                      ...k,
                                      value: e.target.value,
                                    };
                                  }

                                  return k;
                                }),
                              };

                              onPluginKeyChange(updatedPluginKey);
                            }
                          } else {
                            const newPluginKey: PluginKey = {
                              pluginId: PluginID.INCONTEXT_LEARNING,
                              requiredKeys: [
                                {
                                  key: 'PINECONE_API_KEY',
                                  value: '',
                                },
                                {
                                  key: 'PINECONE_ENVIRONMENT',
                                  value: e.target.value,
                                },
                                {
                                  key: 'PINECONE_INDEX_NAME',
                                  value: '',
                                },
                              ],
                            };

                            onPluginKeyChange(newPluginKey);
                          }
                        }}
                      />
                      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                        Pinecone index name
                      </div>
                      <input
                        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                        type="password"
                        value={
                          pluginKeys
                            .find((p) => p.pluginId === PluginID.INCONTEXT_LEARNING)
                            ?.requiredKeys.find((k) => k.key === 'PINECONE_INDEX_NAME')
                            ?.value
                        }
                        onChange={(e) => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.INCONTEXT_LEARNING,
                          );

                          if (pluginKey) {
                            const requiredKey = pluginKey.requiredKeys.find(
                              (k) => k.key === 'PINECONE_INDEX_NAME',
                            );

                            if (requiredKey) {
                              const updatedPluginKey = {
                                ...pluginKey,
                                requiredKeys: pluginKey.requiredKeys.map((k) => {
                                  if (k.key === 'PINECONE_INDEX_NAME') {
                                    return {
                                      ...k,
                                      value: e.target.value,
                                    };
                                  }

                                  return k;
                                }),
                              };

                              onPluginKeyChange(updatedPluginKey);
                            }
                          } else {
                            const newPluginKey: PluginKey = {
                              pluginId: PluginID.INCONTEXT_LEARNING,
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
                                  value: e.target.value,
                                },
                              ],
                            };

                            onPluginKeyChange(newPluginKey);
                          }
                        }}
                      />

                      <button
                        className="mt-6 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
                        onClick={() => {
                          const pluginKey = pluginKeys.find(
                            (p) => p.pluginId === PluginID.INCONTEXT_LEARNING,
                          );

                          if (pluginKey) {
                            onClearPluginKey(pluginKey);
                          }
                        }}
                      >
                        Clear In-Context Learning Plugin Keys
                      </button>

                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
                  onClick={() => setIsChanging(false)}
                >
                  {t('Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
