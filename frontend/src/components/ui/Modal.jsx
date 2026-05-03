import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = ''
}) => {
  const { isDark } = useTheme();

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity ${
          isDark ? 'bg-black/70' : 'bg-black/50'
        }`}
      />

      {/* Modal Content */}
      <div
        className={`relative ${sizes[size]} w-full ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-2xl transform transition-all ${className}`}
        role="document"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {title && (
              <h2
                id="modal-title"
                className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal subcomponents
export const ModalHeader = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const ModalTitle = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} ${className}`}>
      {children}
    </h2>
  );
};

export const ModalBody = ({ children, className = '' }) => {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
};

export const ModalFooter = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <div className={`mt-6 pt-4 border-t flex items-center justify-end gap-3 ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    } ${className}`}>
      {children}
    </div>
  );
};

export default Modal;