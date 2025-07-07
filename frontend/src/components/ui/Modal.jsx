import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ open, onClose, children }) => {
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg shadow-lg w-96 p-4 relative border border-gray-700">
                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    onClick={onClose}
                >
                    ×
                </button>
                {/* Modal Content */}
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
