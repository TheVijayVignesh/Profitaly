import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  BrainCircuit, 
  LineChart, 
  Trophy, 
  Users, 
  BookOpen, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ to, icon, label, isCollapsed }: SidebarLinkProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive 
          ? "bg-sidebar-accent text-sidebar-primary" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
      `}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

interface MainSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const MainSidebar = ({ isCollapsed, toggleCollapse }: MainSidebarProps) => {
  return (
    <aside 
      className={`
        fixed top-[60px] left-0 bottom-0 z-30
        bg-sidebar-DEFAULT border-r border-sidebar-border
        transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="flex flex-col h-full px-2 py-4">
        <div className="flex-1 flex flex-col gap-1">
          <SidebarLink 
            to="/dashboard" 
            icon={<BarChart3 size={20} />} 
            label="Dashboard" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/stocks" 
            icon={<LineChart size={20} />} 
            label="Stock Analysis" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/smart-advisor" 
            icon={<BrainCircuit size={20} />} 
            label="Smart Advisor" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/trial-room" 
            icon={<LineChart size={20} />} 
            label="Trial Rooms" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/fantasy-grounds" 
            icon={<Trophy size={20} />} 
            label="Fantasy Grounds" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/connect" 
            icon={<Users size={20} />} 
            label="Connect" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/learn" 
            icon={<BookOpen size={20} />} 
            label="Learn Hub" 
            isCollapsed={isCollapsed} 
          />
        </div>

        <div className="border-t border-sidebar-border pt-2 mt-2">
          <SidebarLink 
            to="/profile" 
            icon={<User size={20} />} 
            label="Profile" 
            isCollapsed={isCollapsed} 
          />
          <SidebarLink 
            to="/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            isCollapsed={isCollapsed} 
          />
          
          <button 
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center mt-4 text-sidebar-foreground p-2 rounded hover:bg-sidebar-accent/30"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
