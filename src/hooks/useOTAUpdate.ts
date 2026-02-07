import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';

export const useOTAUpdate = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (__DEV__) return;

    const checkUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setIsUpdateAvailable(true);
          setIsDownloading(true);
          await Updates.fetchUpdateAsync();
          setIsDownloading(false);
          setIsDownloaded(true);
        }
      } catch (e) {
        setError(e as Error);
        setIsDownloading(false);
      }
    };

    checkUpdate();
  }, []);

  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      setError(e as Error);
    }
  };

  return {
    isUpdateAvailable,
    isDownloading,
    isDownloaded,
    error,
    reloadApp,
  };
};
