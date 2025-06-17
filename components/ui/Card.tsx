
import React, { ReactNode } from 'react';
import { classNames } from '../../utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode; // e.g. buttons or links
}

const Card: React.FC<CardProps> = ({ children, className, title, actions }) => {
  return (
    <div
      className={classNames(
        "bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden",
        className
      )}
    >
      {(title || actions) && (
        <div className="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          {title && <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{title}</h3>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
