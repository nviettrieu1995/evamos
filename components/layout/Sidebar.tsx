
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { NavItem, UserRole } from '../../types';
import { NAVIGATION_ITEMS, APP_NAME } from '../../constants';
import Icon from '../ui/Icon';
import { ChevronDownIcon, ChevronUpIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Changed path and icons
import { classNames } from '../../utils/helpers';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, toggleMobileOpen }) => {
  const { currentUser } = useAuth();
  const { t } = useLocalization();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  if (!currentUser) return null;

  const userRole = currentUser.role;

  const toggleSubmenu = (path: string) => {
    setOpenSubmenus(prev => ({ ...prev, [path]: !prev[path] }));
  };
  
  const renderNavItems = (items: NavItem[], level: number = 0) => {
    return items.filter(item => item.roles.includes(userRole)).map((item) => {
      const isActive = location.pathname === item.path || (item.children && item.children.some(child => location.pathname.startsWith(child.path)));
      const hasChildren = item.children && item.children.length > 0;
      const isSubmenuOpen = openSubmenus[item.path] || false;

      return (
        <li key={item.path} className="mb-1">
          <NavLink
            to={hasChildren ? '#' : item.path}
            onClick={hasChildren ? (e) => { e.preventDefault(); toggleSubmenu(item.path); } : undefined}
            className={({ isActive: navLinkIsActive }) => classNames(
              "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out text-sm",
              (isActive && !hasChildren) || (hasChildren && isSubmenuOpen)
                ? "bg-primary/20 text-primary dark:bg-primary/30 dark:text-white font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
              level > 0 ? "pl-6" : ""
            )}
          >
            <div className="flex items-center">
              <Icon icon={item.icon} className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{t(item.labelKey)}</span>
            </div>
            {hasChildren && (
              isSubmenuOpen ? <ChevronUpIcon className="h-4 w-4"/> : <ChevronDownIcon className="h-4 w-4"/>
            )}
          </NavLink>
          {hasChildren && isSubmenuOpen && (
            <ul className="mt-1 pl-4 border-l border-gray-200 dark:border-gray-600 ml-2.5">
              {renderNavItems(item.children!, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };


  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <NavLink to="/" className="text-2xl font-bold text-primary dark:text-primary-light">
          {APP_NAME}
        </NavLink>
        <button onClick={toggleMobileOpen} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-grow p-4 overflow-y-auto">
        <ul>{renderNavItems(NAVIGATION_ITEMS)}</ul>
      </nav>
      {/* Optional Footer area in sidebar */}
      {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">© 2024 Evamos</p>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={classNames(
          "fixed inset-0 z-40 flex lg:hidden transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="fixed inset-0 bg-black/30" onClick={toggleMobileOpen} aria-hidden="true"></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 bg-white dark:bg-gray-800">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;