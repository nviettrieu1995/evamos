
import React from 'react';
import { APP_NAME } from '../../constants';
import { useLocalization } from '../../hooks/useLocalization';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. {t('allRightsReserved') || 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};

// Add 'allRightsReserved' to your locales.ts if you use this
// vi: { allRightsReserved: 'Đã đăng ký bản quyền.' }
// ru: { allRightsReserved: 'Все права защищены.' }

export default Footer;
