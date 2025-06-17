
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Language } from '../../types';
import Button from './Button'; // Assuming you have a Button component

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLocalization();

  const toggleLanguage = () => {
    const newLang: Language = language === 'vi' ? 'ru' : 'vi';
    setLanguage(newLang);
  };

  return (
    <Button 
        onClick={toggleLanguage} 
        variant="ghost"
        className="p-2 text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
    >
      {language === 'vi' ? 'РУС' : 'VIE'}
    </Button>
  );
};

export default LanguageSwitcher;
