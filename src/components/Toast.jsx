import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
    };

    const icons = {
        success: <CheckCircle size={24} />,
        error: <XCircle size={24} />,
        warning: <AlertCircle size={24} />,
        info: <AlertCircle size={24} />
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${styles[type]} animate-slide-in`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="font-semibold text-sm">{message}</p>
            <button
                onClick={onClose}
                className="ml-4 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );

    return { showToast, ToastContainer };
};

export default Toast;
