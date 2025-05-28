
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MainSidebar } from './MainSidebar';

interface LayoutProps {
  withSidebar?: boolean;
}

export const Layout = ({ withSidebar = false }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar toggleSidebar={withSidebar ? toggleSidebar : undefined} />
      
      <div className="flex flex-1 pt-[60px]">
        {withSidebar && (
          <MainSidebar 
            isCollapsed={sidebarCollapsed} 
            toggleCollapse={toggleSidebar} 
          />
        )}
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            withSidebar ? (sidebarCollapsed ? "ml-16" : "ml-64") : ""
          }`}
        >
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
