<<<<<<< HEAD
import { inbounds as defaultInbounds, type Inbound } from '../data/inbounds';
=======
import type { Inbound } from '../data/inbounds';
>>>>>>> main

const INBOUND_STORAGE_KEY = 'admin_inbounds_v1';

const readStoredInbounds = (): Inbound[] => {
  try {
    const raw = localStorage.getItem(INBOUND_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Inbound[];
  } catch {
    return [];
  }
};

const writeStoredInbounds = (items: Inbound[]) => {
  localStorage.setItem(INBOUND_STORAGE_KEY, JSON.stringify(items));
};

export const getInboundList = (): Inbound[] => {
  const stored = readStoredInbounds();
  if (stored.length > 0) {
    return stored;
  }

<<<<<<< HEAD
  writeStoredInbounds(defaultInbounds);
  return defaultInbounds;
=======
  return [];
>>>>>>> main
};

export const addInbound = (inbound: Inbound): Inbound[] => {
  const current = getInboundList();
  const next = [inbound, ...current];
  writeStoredInbounds(next);
  return next;
};

export const getInboundById = (id?: string): Inbound | undefined => {
  if (!id) {
    return undefined;
  }

  return getInboundList().find((item) => item.id === id);
};
