import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'; // Updated import path
import { useTheme } from '../../hooks/useTheme';
import Button from './Button';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="p-2 rounded-full text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </Button>
  );
};

export default ThemeToggle;