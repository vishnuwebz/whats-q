import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarToggleProps {
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ className = '' }) => {
  const { isSidebarCollapsed, toggleSidebarCollapse, toggleMobileSidebar } = useQiyamStore();

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {/* Mobile Hamburger Menu button */}
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="md:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer border border-slate-200/80 shadow-2xs bg-white"
        title="Open Navigation Menu"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Desktop Sidebar Collapse / Expand toggle button */}
      <button
        type="button"
        onClick={toggleSidebarCollapse}
        className="hidden md:flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200/80 shadow-2xs bg-white cursor-pointer shrink-0 group"
        title={isSidebarCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? (
          <PanelLeftOpen className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
        ) : (
          <PanelLeftClose className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};
