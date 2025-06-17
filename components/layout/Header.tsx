
import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import CurrencyToggle from '../ui/CurrencyToggle';
import { UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, Bars3Icon } from '@heroicons/react/24/outline'; // Changed path and icons
import { classNames } from '../../utils/helpers';
import { APP_NAME } from '../../constants';


interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useLocalization();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
         {/* <div className="lg:hidden text-xl font-bold text-primary dark:text-primary-light">
          {APP_NAME}
        </div>  */}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <LanguageSwitcher />
        <CurrencyToggle />
        <ThemeToggle />
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="User menu"
            aria-haspopup="true"
          >
            <UserCircleIcon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
             <span className="hidden sm:inline ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{currentUser.name || currentUser.username}</span>
          </button>
          
          {isUserMenuOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none">
              <NavLink
                to="/profile" // Placeholder for profile page
                className={({ isActive }) => classNames(
                    "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                    isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                )}
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                {t('settings')}
              </NavLink>
              <button
                onClick={() => { logout(); setIsUserMenuOpen(false); }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;