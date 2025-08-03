// contexts/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, Plus, Edit3, Trash2, X } from 'lucide-react';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  // Convenience methods
  success: (title: string, description?: string, options?: Partial<Toast>) => void;
  error: (title: string, description?: string, options?: Partial<Toast>) => void;
  warning: (title: string, description?: string, options?: Partial<Toast>) => void;
  info: (title: string, description?: string, options?: Partial<Toast>) => void;
  // App-specific methods
  expenseAdded: () => void;
  expenseUpdated: () => void;
  expenseDeleted: () => void;
  expenseError: (action: 'menambah' | 'mengubah' | 'menghapus') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({ 
  children, 
  position = 'top-center',
  maxToasts = 3 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000, // Default duration
      ...toast,
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit number of toasts for mobile
      return updatedToasts.slice(0, maxToasts);
    });

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'success',
      title,
      description,
      duration: 3000,
      icon: <CheckCircle className="w-5 h-5" />,
      ...options,
    });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'error',
      title,
      description,
      duration: 5000, // Longer for errors
      icon: <XCircle className="w-5 h-5" />,
      ...options,
    });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'warning',
      title,
      description,
      duration: 4000,
      icon: <AlertTriangle className="w-5 h-5" />,
      ...options,
    });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'info',
      title,
      description,
      duration: 4000,
      icon: <Info className="w-5 h-5" />,
      ...options,
    });
  }, [addToast]);

  // App-specific methods
  const expenseAdded = useCallback(() => {
    addToast({
      type: 'success',
      title: 'Pengeluaran Ditambahkan! 🎉',
      description: 'Data berhasil disimpan',
      duration: 3000,
      icon: <Plus className="w-5 h-5" />,
    });
  }, [addToast]);

  const expenseUpdated = useCallback(() => {
    addToast({
      type: 'success',
      title: 'Pengeluaran Diperbarui! ✨',
      description: 'Perubahan berhasil disimpan',
      duration: 3000,
      icon: <Edit3 className="w-5 h-5" />,
    });
  }, [addToast]);

  const expenseDeleted = useCallback(() => {
    addToast({
      type: 'success',
      title: 'Pengeluaran Dihapus! 🗑️',
      description: 'Data berhasil dihapus',
      duration: 3000,
      icon: <Trash2 className="w-5 h-5" />,
    });
  }, [addToast]);

  const expenseError = useCallback((action: 'menambah' | 'mengubah' | 'menghapus') => {
    addToast({
      type: 'error',
      title: `Gagal ${action} pengeluaran 😞`,
      description: 'Silakan coba lagi',
      duration: 5000,
      icon: <XCircle className="w-5 h-5" />,
    });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info,
    expenseAdded,
    expenseUpdated,
    expenseDeleted,
    expenseError,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position={position} toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component
interface ToastContainerProps {
  position: ToastPosition;
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ position, toasts, onRemove }: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div className={`fixed z-50 pointer-events-none ${getPositionClasses()}`}>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

// Individual Toast Component
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getToastStyles = () => {
    const baseStyles = "pointer-events-auto relative flex w-full max-w-sm transform transition-all duration-300 ease-in-out";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-800`;
      case 'info':
        return `${baseStyles} bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 text-violet-800`;
      default:
        return `${baseStyles} bg-white border border-gray-200 text-gray-800`;
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'info': return 'text-violet-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div 
      className={`${getToastStyles()} rounded-xl shadow-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300`}
      style={{
        animation: 'slideInFromTop 0.3s ease-out',
      }}
    >
      <div className="flex items-start gap-3 flex-1">
        {/* Icon */}
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {toast.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">
            {toast.title}
          </div>
          {toast.description && (
            <div className="text-xs opacity-90 mt-1 leading-relaxed">
              {toast.description}
            </div>
          )}
          
          {/* Action Button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-20"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// CSS for animations (add to your global CSS)
export const toastAnimationCSS = `
@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutToTop {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem !important;
    right: 1rem !important;
    transform: none !important;
    max-width: calc(100vw - 2rem) !important;
  }
}
`;

/* 
USAGE EXAMPLES:

1. Setup in your app/layout.tsx:
```tsx
import { ToastProvider } from '@/contexts/ToastContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider position="top-center" maxToasts={3}>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

2. Use in your components:
```tsx
import { useToast } from '@/contexts/ToastContext';

function TransactionList() {
  const toast = useToast();
  
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/expenses/${selectedId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.expenseDeleted();
        router.refresh();
      } else {
        toast.expenseError('menghapus');
      }
    } catch (error) {
      toast.expenseError('menghapus');
    }
  };
  
  return (
    // Your component JSX
  );
}
```

3. Custom toasts:
```tsx
// Simple success
toast.success('Data saved!');

// With description
toast.error('Failed to save', 'Please check your internet connection');

// With custom action
toast.warning('Session expiring', 'Your session will expire in 5 minutes', {
  action: {
    label: 'Extend Session',
    onClick: () => extendSession()
  },
  duration: 0 // Never auto-close
});
```
*/