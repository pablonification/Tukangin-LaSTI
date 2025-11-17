import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

// Simple grey rounded square placeholder icons
const PlaceholderIcon = () => (
  <div className="w-5 h-5 bg-gray-300 rounded-md"></div>
);

const PlaceholderIconActive = () => (
  <div className="w-5 h-5 bg-white rounded-md"></div>
);

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
  { href: '/admin/orders', label: 'Orders', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
  { href: '/admin/users', label: 'Users', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
  { href: '/admin/tukang', label: 'Tukang', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
  { href: '/admin/accounts', label: 'Accounts', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
  { href: '/admin/complaints', label: 'Complaints', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
  { href: '/admin/reports', label: 'Reports', icon: <PlaceholderIcon />, activeIcon: <PlaceholderIconActive /> },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex -mb-6">
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#D4D4D4] transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-center h-16 px-6 border-b border-[#D4D4D4]">
          <div className="text-h1b text-[#0082C9]">Tukangin</div>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-colors
                    ${isActive
                      ? 'bg-[#0082C9] text-white'
                      : 'text-[#141414] hover:bg-[#F5F9FC]'
                    }
                  `}
                >
                  <div className="mr-3">
                    {isActive ? item.activeIcon : item.icon}
                  </div>
                  <span className="text-b1m">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#D4D4D4]">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#E0F1FE] rounded-full flex items-center justify-center">
              <span className="text-b2b text-[#0082C9]">A</span>
            </div>
            <div className="ml-3">
              <div className="text-b2m text-[#141414]">Admin User</div>
              <div className="text-b3 text-[#9E9E9E]">admin@tukangin.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-sm border border-[#D4D4D4]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};