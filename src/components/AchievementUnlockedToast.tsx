import React, { useState, useEffect } from 'react';
import type { Badge } from '../types.ts';

export const AchievementUnlockedToast = ({ badge, onDismiss }: { badge: Badge, onDismiss: () => void }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const enterTimer = setTimeout(() => setIsVisible(true), 100);
        const hideTimer = setTimeout(() => setIsVisible(false), 2100);
        const dismissTimer = setTimeout(onDismiss, 2600); 

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(hideTimer);
            clearTimeout(dismissTimer);
        };
    }, [badge, onDismiss]);

    return (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-purple-400 rounded-xl shadow-2xl shadow-purple-500/30 p-4 z-50 flex items-center gap-4 transition-all duration-500 ease-in-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
          role="alert"
          aria-live="assertive"
        >
            <div className="text-amber-300 animate-slow-glow">{badge.icon}</div>
            <div>
                <h4 className="font-bold text-white">¡Logro Desbloqueado!</h4>
                <p className="text-purple-200 text-sm">{badge.name}</p>
            </div>
        </div>
    );
};
