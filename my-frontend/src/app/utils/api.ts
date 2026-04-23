const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getConfiguredApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredBaseUrl) {
    return '/api';
  }

  return trimTrailingSlash(configuredBaseUrl);
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getConfiguredApiBaseUrl()}${normalizedPath}`;
};