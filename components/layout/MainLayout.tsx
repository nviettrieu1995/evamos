
import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
// import Footer from './Footer'; // Optional Footer

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileOpen={toggleMobileSidebar} />
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header toggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default MainLayout;
