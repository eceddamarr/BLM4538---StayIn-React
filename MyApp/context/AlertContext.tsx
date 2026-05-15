import React, { createContext, useContext, useState, useCallback } from 'react';

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

interface AlertContextType {
  showAlert: (config: Omit<AlertConfig, 'visible'>) => void;
  alertState: AlertConfig;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'Tamam', style: 'default' }],
  });

  const showAlert = useCallback((config: Omit<AlertConfig, 'visible'>) => {
    setAlertState((prev) => ({
      ...prev,
      ...config,
      visible: true,
    }));
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, alertState, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
