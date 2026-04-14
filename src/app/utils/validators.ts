export const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/u;
export const addressRegex = /^[0-9A-Za-zÀ-ỹ\s]+$/u;
export const phoneRegex = /^[0-9]{9,11}$/;

export const cleanNameInput = (value: string) => {
  return value.replace(/[^A-Za-zÀ-ỹ\s]/gu, '');
};

export const cleanAddressInput = (value: string) => {
  return value.replace(/[^0-9A-Za-zÀ-ỹ\s]/gu, '');
};

export const cleanPhoneInput = (value: string) => {
  return value.replace(/[^0-9]/g, '');
};

export const isValidName = (value: string) => {
  return nameRegex.test(value.trim());
};

export const isValidAddress = (value: string) => {
  return addressRegex.test(value.trim());
};

export const isValidPhone = (value: string) => {
  return phoneRegex.test(value.trim());
};