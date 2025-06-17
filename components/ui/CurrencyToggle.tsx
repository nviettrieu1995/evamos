
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Currency } from '../../types';
import Button from './Button';

const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency, t } = useLocalization();

  const toggleCurrency = () => {
    const newCurrency: Currency = currency === 'VND' ? 'RUB' : 'VND';
    setCurrency(newCurrency);
  };

  return (
    <Button 
      onClick={toggleCurrency}
      variant="ghost"
      className="p-2 text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
    >
      {currency === 'VND' ? t('rub') : t('vnd')}
    </Button>
  );
};

export default CurrencyToggle;
