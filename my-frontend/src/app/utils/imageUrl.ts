import { buildApiUrl } from './api';

export const IMAGE_FALLBACK_SRC = '/fallback.png';

export const normalizeProductImageUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  if (/^data:image\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  const uploadsSegmentIndex = trimmedValue.indexOf('/uploads/');
  if (uploadsSegmentIndex >= 0) {
    const normalized = trimmedValue
      .slice(uploadsSegmentIndex)
      .split('?')[0]
      .split('#')[0]
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/');

    return normalized.startsWith('/uploads/') ? normalized : '';
  }

  return '';
};

export const resolveProductImageUrl = (value: unknown) => {
  const normalized = normalizeProductImageUrl(value);

  if (!normalized) {
    return '';
  }

  if (/^https?:\/\//i.test(normalized) || /^data:image\//i.test(normalized)) {
    return normalized;
  }

  return buildApiUrl(normalized);
};

export const withImageFallback = (event: { currentTarget: HTMLImageElement }) => {
  const image = event.currentTarget;
  if (!image.src.endsWith(IMAGE_FALLBACK_SRC)) {
    image.src = IMAGE_FALLBACK_SRC;
  }
};
