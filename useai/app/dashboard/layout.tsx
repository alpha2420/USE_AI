'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { isAuthenticated } from '@/lib/auth';
import { dashboardAPI, whatsappAPI, authAPI } from '@/lib/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const user = useAuthStore((state) => state.user);
    const clearAuthStore = useAuthStore((state) => state.clearAuth);

    const [isChecking, setIsChecking] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const [stats, setStats] = useState({ activeConversations: 0, unansweredCount: 0 });
    const [whatsappStatus, setWhatsappStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');

    // Auth Protection Shield
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        } else {
            setIsChecking(false);
            fetchLiveMetrics();
        }
    }, [router]);

    // Telemetry Setup
    const fetchLiveMetrics = async () => {
        try {
            const [statsRes, waRes] = await Promise.all([
                dashboardAPI.getStats().catch(() => ({ data: { activeConversations: 0, unansweredCount: 0 } })),
                whatsappAPI.getStatus().catch(() => ({ data: { status: 'disconnected' } }))
            ]);

            const st = (statsRes as any)?.data || statsRes || { activeConversations: 0, unansweredCount: 0 };
            setStats({
                activeConversations: st.activeConversations || 0,
                unansweredCount: st.unansweredCount || 0
            });

            const ws = (waRes as any)?.data?.status || (waRes as any)?.status || 'disconnected';
            setWhatsappStatus(ws);
        } catch (err) {
            setWhatsappStatus('disconnected');
        }
    };

    const handleLogout = () => {
        authAPI.logout(); // Removes localStorage
        clearAuthStore(); // Clears Zustand sync
        toast.success('Logged out successfully');
        router.push('/');
    };

    if (isChecking) {
        return (
            <div className="dash-loading-screen">
                <svg className="dash-spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Knowledge Base', path: '/dashboard/knowledge', icon: '🧠' },
        { name: 'Conversations', path: '/dashboard/conversations', icon: '💬', badge: stats.activeConversations },
        { name: 'Unanswered', path: '/dashboard/knowledge#unanswered', icon: '❓', badge: stats.unansweredCount, highlight: true },
        { name: 'Campaigns', path: '/dashboard/campaigns', icon: '📣' },
        { name: 'Billing', path: '/dashboard/billing', icon: '💳' },
        { name: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    // Helper for computing initials fallback
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return parts[0][0].toUpperCase();
    };

    return (
        <div className="dash-layout">
            {/* Mobile Header Toggle */}
            <div className="mobile-header">
                <div className="auth-logo" style={{ color: '#0D1117' }} onClick={() => router.push('/dashboard')}>
                    use<span>AI</span>
                </div>
                <button className="mobile-toggle-btn" onClick={() => setIsMobileOpen(true)}>☰</button>
            </div>

            {/* Sidebar Shell */}
            <aside className={`dash-sidebar ${isMobileOpen ? 'open' : ''}`}>
                <div className="sidebar-scrollable">
                    <div className="sidebar-header">
                        <div className="auth-logo" onClick={() => router.push('/dashboard')}>
                            use<span>AI</span>
                        </div>
                        {isMobileOpen && (
                            <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}>✕</button>
                        )}
                    </div>

                    <div className="org-section">
                        <div className="org-name">{user?.name || 'My Organization'}</div>
                        <div className="plan-badge">PRO</div>
                    </div>

                    <nav className="dash-nav">
                        {navItems.map((item) => {
                            // Active matching: exact for root Dashboard, startsWith for others
                            const isActive = item.path === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname.startsWith(item.path.split('#')[0]);

                            return (
                                <Link
                                    href={item.path}
                                    key={item.name}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.name}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <div className={`nav-badge ${item.highlight ? 'highlight' : ''}`}>{item.badge}</div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="wa-status-container">
                        {whatsappStatus === 'loading' ? (
                            <div className="wa-status loading">● Connecting...</div>
                        ) : whatsappStatus === 'connected' ? (
                            <div className="wa-status live">● WhatsApp Live</div>
                        ) : (
                            <div className="wa-status disconnected">● Disconnected</div>
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">{getInitials(user?.name)}</div>
                        <div className="user-details">
                            <div className="user-name">{user?.name || 'Admin User'}</div>
                            <div className="user-role">Administrator</div>
                        </div>
                        <button className="btn-logout" onClick={handleLogout} title="Logout">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Sandbox */}
            <main className="dash-main">
                {children}
            </main>

            {/* Mobile Overlay Background */}
            {isMobileOpen && (
                <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)}></div>
            )}

            <style jsx global>{`
        /* Dashboard Layout Scope */
        body { background: #f9fafb; margin: 0; padding: 0; }
        
        .dash-layout {
          display: flex;
          min-height: 100vh;
        }
        
        /* Spinner */
        .dash-loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          background: #f9fafb;
          color: var(--or);
        }
        .dash-spinner {
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        
        /* Mobile Navbar Hook */
        .mobile-header {
          display: none;
          height: 64px;
          background: white;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 40;
        }
        
        .mobile-toggle-btn {
          background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text); padding: 4px;
        }
        
        .dash-sidebar {
          width: 280px;
          background: #0D1117;
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 50;
          transition: transform 0.3s ease;
        }
        
        .sidebar-scrollable {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header {
          height: 72px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        
        .mobile-close-btn { display: none; background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
        
        .org-section {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .org-name {
          font-family: var(--fb);
          font-size: 15px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .plan-badge {
          background: linear-gradient(135deg, var(--or), var(--or2));
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }
        
        .dash-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 16px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        
        .nav-item.active {
          background: rgba(255,69,0,0.15);
          color: white;
          border-left: 3px solid var(--or);
        }
        
        .nav-icon { font-size: 16px; }
        .nav-label { flex: 1; }
        
        .nav-badge {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .nav-badge.highlight {
          background: var(--or);
          color: white;
        }
        
        .wa-status-container {
          padding: 24px;
          margin-top: auto;
        }
        
        .wa-status {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255,255,255,0.05);
        }
        
        .wa-status.live { color: #34d399; }
        .wa-status.disconnected { color: #f87171; }
        .wa-status.loading { color: #9ca3af; }
        
        .sidebar-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38BDF8, #8B5CF6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
        }
        
        .user-details {
          flex: 1;
          overflow: hidden;
        }
        
        .user-name {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .user-role {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
        }
        
        .btn-logout {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        
        .btn-logout:hover { color: #f87171; }
        
        .dash-main {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
        }
        
        .mobile-overlay { display: none; }
        
        /* Mobile Scaling Configuration */
        @media (max-width: 1024px) {
          .mobile-header { display: flex; }
          .dash-main { margin-left: 0; padding-top: 64px; }
          .dash-sidebar { transform: translateX(-100%); width: 300px; }
          .dash-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
          .mobile-close-btn { display: block; }
          
          .mobile-overlay {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 45;
          }
        }
      `}</style>
        </div>
    );
}
