'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Book, MessageSquare, PlayCircle, Settings, LogOut, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: whatsappStatus } = useQuery({
    queryKey: ['whatsappStatus'],
    queryFn: () => api.get('/whatsapp/status').then(res => res.data),
    refetchInterval: 5000,
  });

  if (!isLoaded) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const getStatusBadge = () => {
    const status = whatsappStatus?.status;
    if (status === 'connected') return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Connected</span>;
    if (status === 'connecting') return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Connecting</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Disconnected</span>;
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: Book },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Test Chat', href: '/dashboard/test-chat', icon: PlayCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={clsx("fixed inset-y-0 z-20 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0", {
        "-translate-x-full": !sidebarOpen,
        "translate-x-0": sidebarOpen,
      })}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-800 tracking-tight">use<span className="text-orange-500">AI</span></span>
        </div>
        <div className="flex flex-col flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link key={link.name} href={link.href} className={twMerge(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100"
              )}>
                <Icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => signOut({ redirectUrl: '/' })} className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 z-10 w-full shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 -ml-1 text-gray-500 rounded-md md:hidden hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="hidden md:flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-500">WhatsApp:</span>
              {getStatusBadge()}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 py-8 overflow-y-auto md:px-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-10 bg-gray-900 bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
