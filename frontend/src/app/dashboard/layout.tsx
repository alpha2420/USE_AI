'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Book, MessageSquare, PlayCircle, Settings, LogOut, Menu, Sparkles, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import clsx from 'clsx';

// ── Light Theme Tokens ────────────────────────────────────────────────────────
const L = {
  bg:           '#f4f8f6',
  sidebar:      '#ffffff',
  sidebarHover: '#f0faf7',
  sidebarActive:'#e6f7f2',
  border:       '#e2ede9',
  borderBright: '#c8ddd7',
  textPrimary:  '#0d1f18',
  textSec:      '#4a7a6a',
  textMuted:    '#9ab8af',
  em:           '#00a87e',
  emDim:        '#00a87e18',
  emGlow:       '#00a87e35',
  red:          '#e53e3e',
  amber:        '#d97706',
  blue:         '#2563eb',
  surface:      '#ffffff',
  surface2:     '#f8fdfb',
  topbar:       '#ffffffD0',
} as const;

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

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen" style={{ background: L.bg }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: L.border, borderTopColor: L.em }} />
    </div>
  );

  const status = whatsappStatus?.status;

  const getStatusBadge = () => {
    if (status === 'connected') return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: L.emDim, border: `1px solid ${L.emGlow}`, color: L.em }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: L.em }} />
        WhatsApp Connected
      </span>
    );
    if (status === 'connecting') return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: '#d9770610', border: '1px solid #d9770625', color: L.amber }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: L.amber }} />
        Connecting…
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: '#e53e3e10', border: '1px solid #e53e3e25', color: L.red }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: L.red }} />
        WhatsApp Disconnected
      </span>
    );
  };

  const navSections = [
    {
      label: 'Main',
      links: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: Book },
        { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
      ],
    },
    {
      label: 'Tools',
      links: [
        { name: 'Test Chat', href: '/dashboard/test-chat', icon: PlayCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: L.bg, color: L.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar — always on md+, slide-in on mobile */}
      <aside
        className={clsx('z-30 flex-col shrink-0 transition-transform duration-300', sidebarOpen ? 'flex fixed inset-y-0' : 'hidden md:flex')}
        style={{ width: 220, minWidth: 220, height: '100vh', background: L.sidebar, borderRight: `1px solid ${L.border}`, overflow: 'hidden' }}
      >
        {/* Subtle green tint at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
          style={{ background: `radial-gradient(ellipse at center bottom, ${L.emDim} 0%, transparent 70%)` }} />

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-7" style={{ borderBottom: `1px solid ${L.border}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: L.em }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif", color: L.textPrimary }}>
            use<span style={{ color: L.em }}>AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: L.textMuted }}>
                {section.label}
              </div>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all relative"
                    style={{
                      background: isActive ? L.sidebarActive : 'transparent',
                      color: isActive ? L.em : L.textSec,
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = L.sidebarHover; } }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-[60%] rounded-r" style={{ background: L.em }} />
                    )}
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: `1px solid ${L.border}` }}>
          <div className="flex items-center gap-2.5 p-3 rounded-lg cursor-pointer transition-colors"
            style={{ background: L.surface2 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#edf7f3'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = L.surface2}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${L.em}, #009e78)`, fontFamily: "'Syne', sans-serif" }}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: L.textPrimary }}>{user?.fullName || 'User'}</div>
              <div className="text-[11px]" style={{ color: L.textMuted }}>Admin</div>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="p-1 rounded transition-colors"
              style={{ background: 'none', border: 'none', color: L.textMuted, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = L.red}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = L.textMuted}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 h-[62px]"
          style={{ background: L.topbar, borderBottom: `1px solid ${L.border}`, backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg md:hidden transition-colors"
              style={{ color: L.textSec, border: 'none', background: 'none', cursor: 'pointer' }}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[15px] font-bold" style={{ fontFamily: "'Syne', sans-serif", color: L.textPrimary }}>Dashboard</div>
              <div className="text-[11px]" style={{ color: L.textMuted }}>useAI / Overview</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-all"
              style={{ background: L.surface, border: `1px solid ${L.borderBright}`, color: L.textSec, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = L.em; (e.currentTarget as HTMLElement).style.color = L.em; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = L.borderBright; (e.currentTarget as HTMLElement).style.color = L.textSec; }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 max-w-[1100px]">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 md:hidden" style={{ background: 'rgba(13,31,24,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
