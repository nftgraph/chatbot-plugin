import { PluginID, PluginKey } from '@/types/plugin';
import { IconFileUpload, IconKey } from '@tabler/icons-react';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarButton } from '../Sidebar/SidebarButton';
import { FileUploadArea } from '../Sidebar/FileUploadArea';
import { useToast } from '@/hooks/use-toast';
import { file_upload_config } from '@/config/fileuploadconfig';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { urlPattern } from '@/utils/app/helpers';
import { WebUpload } from './WebsiteUrlUpload';

interface Props {
  pluginKeys: PluginKey[];
  apiKey: string;
  //  onPluginKeyChange: (pluginKey: PluginKey) => void;
  //  onClearPluginKey: (pluginKey: PluginKey) => void;
}

export const UploadPdf: FC<Props> = ({
  pluginKeys,
  apiKey,
  //onPluginKeyChange,
  //onClearPluginKey,
}) => {
  const { t } = useTranslation('sidebar');
  const { toast } = useToast();

  const [isChanging, setIsChanging] = useState(false);
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [isUploadingUrl, setIsUploadingUrl] = useState(false);

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

  //handle file upload
  async function handleFileUpload() {

    setIsUploading(true);

    toast({
      title: 'Uploading files',
      description: 'Please wait while we upload your files',
      variant: 'default',
    });

    const formData = new FormData();
    // ToDo: クライアント側では使えないパラメータを置き換える

    const pluginKey = pluginKeys.find(
      (p) => p.pluginId === PluginID.INCONTEXT_LEARNING,
    );

    if (pluginKey) {
      const pineconeApiKey = pluginKey.requiredKeys.find((k) => k.key === 'PINECONE_API_KEY')?.value;
      const pineconeEnvironment = pluginKey.requiredKeys.find((k) => k.key === 'PINECONE_ENVIRONMENT')?.value;
      const pineconeIndex = pluginKey.requiredKeys.find((k) => k.key === 'PINECONE_INDEX_NAME')?.value;

      console.log('pineconeApiKey', pineconeApiKey);
      console.log('pineconeEnvironment', pineconeEnvironment);
      console.log('pineconeIndex', pineconeIndex);
      console.log('apiKey', apiKey);

      formData.append('openai-api-key', apiKey);
      formData.append('pinecone-api-key', pineconeApiKey);
      formData.append('pinecone-environment', pineconeEnvironment);
      formData.append('pinecone-index', pineconeIndex);
      Array.from(files || []).forEach((file) => {
        formData.append('files', file);
      });
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setIsUploading(false);
      } else {
        toast({
          title: 'Your files have been uploaded successfully',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Something went wrong, please try again',
        description: error.message || '',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
    setIsUploading(false);
  }

  //handle web url submission
  async function handleUrlUpload() {
    const credentials = pluginKeys.find((p) => p.pluginId === PluginID.INCONTEXT_LEARNING)

    if (url.length === 0) {
      toast({
        title: 'Error',
        description: 'URL is required',
        variant: 'destructive',
      });
      return;
    }

    if (!urlPattern.test(url)) {
      toast({
        title: 'Error',
        description: 'Invalid URL',
        variant: 'destructive',
      });
      return;
    }
    const urlInput = url.trim();

    setIsUploadingUrl(true);
    setUrl(urlInput);

    try {
      const response = await fetch('/api/ingest-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput,
          credentials: credentials,
          apiKey: apiKey,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setIsUploadingUrl(false);
      } else {
        toast({
          title: 'Your website url has been uploaded successfully',
        });
      }
      setIsUploadingUrl(false);
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Something went wrong, please try again',
        description: error.message || '',
        variant: 'destructive',
      });
      setIsUploadingUrl(false);
    }
    setUrl('');
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleNameSpaceDeletion = async () => {
    const credentials = pluginKeys.find((p) => p.pluginId === PluginID.INCONTEXT_LEARNING)
    console.log('credentials', credentials?.requiredKeys)

    setLoading(true);

    try {
      const response = await fetch('/api/delete-namespace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          credentials: credentials,
        }),
      });

      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        toast({
          title: 'Something went wrong',
          description: data.error,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Your namespace has been deleted',
        variant: 'default',
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  };


  return (
    <>
      <SidebarButton
        text={t('Upload PDF')}
        icon={<IconFileUpload size={18} />}
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
                className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-hidden rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[1000px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                role="dialog"
              >
                <div className="mb-10 text-4xl">Upload PDF</div>

                <div className="mt-6 rounded border p-4">

                  <FileUploadArea
                    setFiles={setFiles}
                    isUploading={isUploading}
                    handleFileUpload={handleFileUpload}
                    files={files}
                    maxFileSizeMB={file_upload_config.max_file_size_mb}
                    maxNumFiles={file_upload_config.max_num_files_upload}
                  />


                  <WebUpload
                    handleUrlUpload={handleUrlUpload}
                    isUploadingUrl={isUploadingUrl}
                    handleUrlChange={handleUrlChange}
                    url={url}
                  />

                  <h2 className="mt-10 scroll-m-20 pb-2 text-lg font-semibold tracking-tight transition-colors first:mt-0">
                    Delete Namespace
                  </h2>

                  <Button type="button" onClick={handleNameSpaceDeletion}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
