const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getConfiguredApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredBaseUrl) {
    return '/api';
  }

  return trimTrailingSlash(configuredBaseUrl);
};

const getApiOrigin = () => {
  const apiBaseUrl = getConfiguredApiBaseUrl();

  if (!apiBaseUrl.startsWith('/')) {
    return apiBaseUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const resolveMediaUrl = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  const uploadsSegmentIndex = trimmedValue.indexOf('/uploads/');
  if (uploadsSegmentIndex >= 0) {
    const normalizedPath = trimmedValue
      .slice(uploadsSegmentIndex)
      .split('?')[0]
      .split('#')[0]
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/');
    return `${getApiOrigin()}${normalizedPath}`;
  }

  return trimmedValue;
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getConfiguredApiBaseUrl()}${normalizedPath}`;
};