import { toast } from 'sonner';

/**
 * Toast notification utility functions
 * Provides consistent toast notifications across the application
 */

export const showToast = {
  /**
   * Show success message
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show error message
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show warning message
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show info message
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show loading state
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Show promise (loading -> success/error)
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  /**
   * Dismiss toast
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Show error toast from API error
 */
export const showErrorToast = (error: any, defaultMessage: string = 'An error occurred') => {
  const message = getErrorMessage(error) || defaultMessage;
  showToast.error(message);
};

