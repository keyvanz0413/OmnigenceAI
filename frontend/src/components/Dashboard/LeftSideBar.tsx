import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'antd';
import { useLayoutStore } from '@/store/useLayoutStore';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isExpanded: boolean;
}

const NavItem = ({ to, icon: Icon, label, isExpanded }: NavItemProps) => (
  <Tooltip title={!isExpanded ? label : ''} placement="right" mouseEnterDelay={0.5}>
    <NavLink
      to={to}
      className={({ isActive }) => `
        group relative flex items-center w-full transition-all duration-300 px-4 py-3
        ${isExpanded ? 'justify-start space-x-4' : 'justify-center'}
        ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeSideBar"
              className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50' : 'group-hover:bg-slate-100'}`}>
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </div>

          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {isExpanded && isActive && <ChevronRight size={14} className="ml-auto opacity-40" />}
        </>
      )}
    </NavLink>
  </Tooltip>
);

export const LeftSideBar: React.FC = () => {
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();

  return (
    <motion.aside
      animate={{ width: isSidebarExpanded ? 200 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-[rgb(244,245,246)] border-r border-slate-200 flex flex-col items-center py-8 z-50 shadow-sm"
    >
      <div className="mb-10 w-full px-4 flex justify-center">
        <button onClick={toggleSidebar} className="flex items-center justify-center hover:text-blue-600 transition-all duration-300">
          {isSidebarExpanded ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        </button>
      </div>

      <nav className="flex-1 w-full space-y-1">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isExpanded={isSidebarExpanded} />
      </nav>
    </motion.aside>
  );
};

export default LeftSideBar;
