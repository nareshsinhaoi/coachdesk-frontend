import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

export interface ToastOptions {
  description?: string;
  duration?: number;
}

export const useToast = () => ({
  toast: {
    success: (title: string, opts?: ToastOptions) => sonnerToast.success(title, opts),
    error: (title: string, opts?: ToastOptions) => sonnerToast.error(title, opts),
    info: (title: string, opts?: ToastOptions) => sonnerToast(title, opts),
    warning: (title: string, opts?: ToastOptions) => sonnerToast.warning(title, opts),
  },
});

export const Toaster = SonnerToaster;
export { sonnerToast as toast };