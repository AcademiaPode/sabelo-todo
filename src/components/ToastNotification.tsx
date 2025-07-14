import React, { useState, useEffect } from 'react';

export const ToastNotification = ({ message, type = 'success', onDismiss }: { message: string; type?: 'success' | 'error'; onDismiss: () => void }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 2700);

        const unmountTimer = setTimeout(() => {
            onDismiss();
        }, 3000);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(unmountTimer);
        };
    }, [message, onDismiss]);

    const typeClasses = {
      success: 'bg-green-500/90 backdrop-blur-sm border border-green-400',
      error: 'bg-red-500/90 backdrop-blur-sm border border-red-400'
    };

    return (
        <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 text-white font-bold py-3 px-6 rounded-lg shadow-xl z-50 transition-opacity duration-300 ease-in-out ${typeClasses[type]} ${
                isFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            👉 {message}
        </div>
    );
};
