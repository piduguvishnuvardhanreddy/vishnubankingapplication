import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from '../components/ui/Toast';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, message, duration = 5000) => {
        const id = Date.now().toString();
        setNotifications((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    const showSuccess = useCallback((message) => addNotification('success', message), [addNotification]);
    const showError = useCallback((message) => addNotification('error', message), [addNotification]);
    const showInfo = useCallback((message) => addNotification('info', message), [addNotification]);

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <Toast
                            key={notification.id}
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            duration={notification.duration}
                            onClose={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
