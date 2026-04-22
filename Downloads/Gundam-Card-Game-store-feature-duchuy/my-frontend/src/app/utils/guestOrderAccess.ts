const GUEST_ORDER_EMAIL_KEY = 'guestOrderEmail';
const GUEST_ORDER_PHONE_KEY = 'guestOrderPhone';
const GUEST_ORDER_NAME_KEY = 'guestOrderName';
const GUEST_ORDER_ACCESS_TOKEN_KEY = 'guestOrderAccessToken';
const GUEST_PENDING_ORDER_CODE_KEY = 'guestPendingOrderCode';

type GuestOrderAccessPayload = {
  email: string;
  phone: string;
  accessToken?: string;
  name?: string;
};

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const setGuestLookupContact = (email: string, phone: string, name = '') => {
  if (!canUseStorage()) return;
  localStorage.setItem(GUEST_ORDER_EMAIL_KEY, email.trim());
  localStorage.setItem(GUEST_ORDER_PHONE_KEY, phone.trim());

  if (name.trim()) {
    localStorage.setItem(GUEST_ORDER_NAME_KEY, name.trim());
  }
};

export const persistGuestOrderAccess = ({ email, phone, accessToken, name = '' }: GuestOrderAccessPayload) => {
  if (!canUseStorage()) return;
  setGuestLookupContact(email, phone, name);
  if (accessToken) {
    localStorage.setItem(GUEST_ORDER_ACCESS_TOKEN_KEY, accessToken);
  }
};

export const clearGuestOrderVerification = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(GUEST_ORDER_ACCESS_TOKEN_KEY);
};

export const clearGuestOrderAccess = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(GUEST_ORDER_EMAIL_KEY);
  localStorage.removeItem(GUEST_ORDER_PHONE_KEY);
  localStorage.removeItem(GUEST_ORDER_NAME_KEY);
  localStorage.removeItem(GUEST_ORDER_ACCESS_TOKEN_KEY);
  localStorage.removeItem(GUEST_PENDING_ORDER_CODE_KEY);
};

export const getStoredGuestOrderAccess = () => {
  if (!canUseStorage()) {
    return { email: '', phone: '', name: '', accessToken: '' };
  }

  return {
    email: localStorage.getItem(GUEST_ORDER_EMAIL_KEY) || '',
    phone: localStorage.getItem(GUEST_ORDER_PHONE_KEY) || '',
    name: localStorage.getItem(GUEST_ORDER_NAME_KEY) || '',
    accessToken: localStorage.getItem(GUEST_ORDER_ACCESS_TOKEN_KEY) || '',
  };
};

export const buildGuestOrderHeaders = (headers: Record<string, string> = {}) => {
  const { accessToken } = getStoredGuestOrderAccess();
  if (!accessToken) {
    return headers;
  }

  return {
    ...headers,
    'X-Guest-Access-Token': accessToken,
  };
};

export const setPendingGuestOrderCode = (orderCode: string) => {
  if (!canUseStorage()) return;
  localStorage.setItem(GUEST_PENDING_ORDER_CODE_KEY, orderCode.trim().toUpperCase());
};

export const getPendingGuestOrderCode = () => {
  if (!canUseStorage()) return '';
  return localStorage.getItem(GUEST_PENDING_ORDER_CODE_KEY) || '';
};

export const clearPendingGuestOrderCode = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(GUEST_PENDING_ORDER_CODE_KEY);
};