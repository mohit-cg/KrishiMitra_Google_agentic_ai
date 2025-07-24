
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';
import bn from '@/locales/bn.json';
import bho from '@/locales/bho.json';
import { SplashScreen } from '@/components/splash-screen';

const translations = { en, hi, kn, bn, bho };

type Language = 'en' | 'hi' | 'kn' | 'bn' | 'bho';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile, loading: authLoading } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      const preferredLanguage = userProfile?.language as Language | undefined;
      if (preferredLanguage && ['en', 'hi', 'kn', 'bn', 'bho'].includes(preferredLanguage)) {
        setLanguage(preferredLanguage);
      } else {
        setLanguage('en');
      }
      setIsLoading(false);
    }
  }, [userProfile, authLoading]);

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    const langFile = translations[language] || translations.en;
    
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
        if (acc && typeof acc === 'object' && acc[currentKey]) {
            return acc[currentKey];
        }
        return undefined;
    }, langFile as any);

    if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }
    
    if (typeof result === 'string') {
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{{${placeholder}}}`, 'g');
            result = result.replace(regex, String(replacements[placeholder]));
        });
    }

    return result;
  }, [language]);


  const value = {
    language,
    setLanguage,
    t
  };

  if (isLoading || authLoading) {
    return <SplashScreen />;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

    