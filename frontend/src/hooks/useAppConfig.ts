import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/utils';

export interface AppConfig {
  adminEmail: string;
  adminPhone: string;
  whatsappNumber: string;
  razorpayKeyId: string;
  siteUrl: string;
}

const defaultConfig: AppConfig = {
  adminEmail: 'kanusuraj15@gmail.com',
  adminPhone: '9666635009',
  whatsappNumber: '919666635009',
  razorpayKeyId: 'rzp_test_51xxxxxxxxxxxx',
  siteUrl: typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://virattom.com',
};

let cachedConfig: AppConfig | null = null;
let fetchPromise: Promise<AppConfig> | null = null;

export async function fetchAppConfig(): Promise<AppConfig> {
  if (cachedConfig) return cachedConfig;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(apiUrl('/api/config'))
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.success) {
        cachedConfig = {
          adminEmail: data.adminEmail || defaultConfig.adminEmail,
          adminPhone: data.adminPhone || defaultConfig.adminPhone,
          whatsappNumber: data.whatsappNumber || defaultConfig.whatsappNumber,
          razorpayKeyId: data.razorpayKeyId || defaultConfig.razorpayKeyId,
          siteUrl: data.siteUrl || defaultConfig.siteUrl,
        };
      } else {
        cachedConfig = defaultConfig;
      }
      return cachedConfig;
    })
    .catch(() => {
      cachedConfig = defaultConfig;
      return cachedConfig;
    });

  return fetchPromise;
}

export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(cachedConfig || defaultConfig);

  useEffect(() => {
    let isMounted = true;
    fetchAppConfig().then((cfg) => {
      if (isMounted) setConfig(cfg);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return config;
}
