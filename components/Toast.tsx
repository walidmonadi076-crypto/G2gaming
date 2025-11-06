
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}
export interface ToastProps extends ToastData {
  onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  const baseClasses = 'flex items-center w-full max-w-xs p-4 text-white rounded-lg shadow-lg animate-fade-in-right';
  const typeClasses = {
    success: 'bg-gradient-to-r from-green-500 to-green-700',
    error: 'bg-gradient-to-r from-red-500 to-red-700',
  };

  const Icon = () => {
    const iconWrapperClasses = "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg";
    if (type === 'success') {
      return (
        <div className={`${iconWrapperClasses} text-green-200 bg-green-800/50`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
          <span className="sr-only">Check icon</span>
        </div>
      );
    }
    return (
      <div className={`${iconWrapperClasses} text-red-200 bg-red-800/50`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        <span className="sr-only">Error icon</span>
      </div>
    );
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <Icon />
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white/10 text-white/70 hover:text-white hover:bg-white/20 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 transition-colors"
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export default Toast;
