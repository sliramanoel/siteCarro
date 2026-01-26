import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'AutoLeilão',
    logo_url: '',
    primary_color: '#DC2626',
    address: '',
    phone: '',
    email: '',
    facebook_url: '',
    instagram_url: '',
    whatsapp_message: 'Olá! Tenho interesse no {brand} {model} {year}.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      // Apply primary color to CSS
      document.documentElement.style.setProperty('--primary-color', response.data.primary_color);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
