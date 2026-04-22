import { toast } from 'sonner';

type ToastId = string | number;

const MAX_VISIBLE_TOASTS = 3;
const toastQueue: ToastId[] = [];
let toastSequence = 0;

const nextToastId = () => `limited-toast-${Date.now()}-${toastSequence++}`;

const makeRoomForNewToast = () => {
  if (toastQueue.length < MAX_VISIBLE_TOASTS) {
    return;
  }

  const oldestToastId = toastQueue.shift();
  if (oldestToastId !== undefined) {
    toast.dismiss(oldestToastId);
  }
};

const pushToast = (id: ToastId) => {
  toastQueue.push(id);
};

export const limitedToast = {
  success: (message: string) => {
    makeRoomForNewToast();
    const id = nextToastId();
    pushToast(id);
    toast.success(message, { id });
  },

  error: (message: string) => {
    makeRoomForNewToast();
    const id = nextToastId();
    pushToast(id);
    toast.error(message, { id });
  },

  info: (message: string) => {
    makeRoomForNewToast();
    const id = nextToastId();
    pushToast(id);
    toast.info(message, { id });
  },

  message: (message: string) => {
    makeRoomForNewToast();
    const id = nextToastId();
    pushToast(id);
    toast(message, { id });
  },
};
