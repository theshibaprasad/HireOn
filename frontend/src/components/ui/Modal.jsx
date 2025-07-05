import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ open, onClose, children }) => {
    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-4 relative">
                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    &times;
                </button>
                {/* Modal Content */}
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
