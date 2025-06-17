
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';

const NotFoundPage: React.FC = () => {
  const { t } = useLocalization();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-2">
        {t('pageNotFoundTitle') || 'Page Not Found'}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        {t('pageNotFoundMessage') || "Oops! The page you're looking for doesn't seem to exist. It might have been moved, deleted, or you might have mistyped the URL."}
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors duration-150"
      >
        {t('goHome') || 'Go to Homepage'}
      </Link>
    </div>
  );
};

// Add to locales.ts:
// vi: { pageNotFoundTitle: 'Không tìm thấy trang', pageNotFoundMessage: 'Rất tiếc! Trang bạn đang tìm kiếm dường như không tồn tại. Nó có thể đã bị di chuyển, xóa hoặc bạn có thể đã gõ sai URL.', goHome: 'Về trang chủ' }
// ru: { pageNotFoundTitle: 'Страница не найдена', pageNotFoundMessage: 'Ой! Страница, которую вы ищете, похоже, не существует. Возможно, она была перемещена, удалена, или вы неправильно ввели URL.', goHome: 'На главную' }

export default NotFoundPage;
