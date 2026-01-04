import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  BookOpen,
  Briefcase,
  Star,
  MessageSquare,
  FileText,
  Settings,
  BarChart,
  Globe,
  Mail,
  Shield
} from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ to, icon: Icon, label, end }: { to: string, icon: any, label: string, end?: boolean }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
        isActive
          ? "bg-[#D6B25E] text-black"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
};

const SubMenuItem = ({ to, label }: { to: string, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "block pl-11 py-2 text-sm transition-colors",
        isActive
          ? "text-[#D6B25E]"
          : "text-gray-500 hover:text-gray-300"
      )}
    >
      {label}
    </NavLink>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith('/admin/settings');

  return (
    <div className="w-64 flex flex-col h-full bg-[#070708] border-r border-white/10">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="text-xl font-bold text-[#D6B25E] tracking-tight">CAM <span className="text-white">Admin</span></span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" end />
        <SidebarItem to="/users" icon={Users} label="Users" />
        <SidebarItem to="/services" icon={Wrench} label="Services" />
        <SidebarItem to="/resources" icon={BookOpen} label="Resources" />
        <SidebarItem to="/projects" icon={Briefcase} label="Projects" />
        <SidebarItem to="/reviews" icon={Star} label="Customer Reviews" />
        <SidebarItem to="/inquiries" icon={MessageSquare} label="Inquiries" />
        <SidebarItem to="/quotations" icon={FileText} label="Customer Quotations" />

        <div className="pt-4">
            <div className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                isSettingsActive ? "text-white" : "text-gray-400"
            )}>
                <Settings size={18} />
                <span>Settings</span>
            </div>
            <div className="space-y-1 mt-1">
                <SubMenuItem to="/settings/permissions" label="Permissions" />
                <SubMenuItem to="/settings/analytics" label="Analytics" />
                <SubMenuItem to="/settings/site" label="Site Settings" />
                <SubMenuItem to="/settings/email" label="Email Settings" />
            </div>
        </div>
      </div>
    </div>
  );
}
