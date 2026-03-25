'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const L = {
  bg:          '#f4f8f6',
  surface:     '#ffffff',
  surface2:    '#f0f9f5',
  surface3:    '#e8f5ef',
  border:      '#e2ede9',
  borderBright:'#c8ddd7',
  textPrimary: '#0d1f18',
  textSec:     '#4a7a6a',
  textMuted:   '#9ab8af',
  em:          '#00a87e',
  emDim:       '#00a87e18',
  emGlow:      '#00a87e35',
  red:         '#e53e3e',
  amber:       '#d97706',
  blue:        '#2563eb',
} as const;

export default function DashboardPage() {
  const { user } = useUser();
  const [showQR, setShowQR] = useState(false);

  const whatsappMutation = useMutation({
    mutationFn: () => api.post('/whatsapp/connect'),
    onSuccess: () => setShowQR(true),
  });

  const { data: whatsappStatus } = useQuery({
    queryKey: ['whatsappStatus'],
    queryFn: () => api.get('/whatsapp/status').then(res => res.data),
    refetchInterval: 5000,
  });

  const status = whatsappStatus?.status || 'unknown';

  const stats = [
    { label: 'Conversations', value: '1,284', trend: '+12%',  sub: 'Total sessions handled',  icon: '💬', up: true  },
    { label: 'AI Accuracy',   value: '98.2%',  trend: '+0.4%', sub: 'Response precision rate', icon: '🎯', up: true,  highlight: true },
    { label: 'Avg Response',  value: '1.4s',   trend: '−200ms',sub: 'Average reply latency',   icon: '⏱', up: false },
    { label: 'Hours Saved',   value: '42.5h',  trend: '+5.2h', sub: 'Team productivity gain',  icon: '⚡', up: true  },
  ];

  const quickActions = [
    { name: 'View Transcripts', desc: 'Browse conversation history',     icon: '📄', href: '/dashboard/conversations', color: L.blue,  bg: '#2563eb12' },
    { name: 'Test Sandbox',     desc: 'Try responses before going live', icon: '🧪', href: '/dashboard/test-chat',     color: L.amber, bg: '#d9770612' },
    { name: 'System Settings',  desc: 'Configure your workspace',        icon: '⚙',  href: '/dashboard/settings',      color: L.em,    bg: L.emDim    },
    { name: 'Knowledge Base',   desc: 'Manage AI training documents',    icon: '🗃',  href: '/dashboard/knowledge',     color: L.red,   bg: '#e53e3e12' },
  ];

  return (
    <div style={{ color: L.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Greeting */}
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <h1 className="text-[34px] font-extrabold leading-tight mb-1" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-1px' }}>
          Welcome back, <span style={{ color: L.em }}>{user?.firstName || 'Chief'}!</span>
        </h1>
        <p className="text-sm" style={{ color: L.textSec }}>Here's a quick overview of your useAI system status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-5 relative overflow-hidden cursor-default transition-all duration-200"
            style={{
              background: s.highlight ? 'linear-gradient(135deg, #ffffff 0%, #edfaf5 100%)' : L.surface,
              border: `1px solid ${s.highlight ? L.emGlow : L.border}`,
              boxShadow: s.highlight ? `0 0 0 1px ${L.emDim}` : '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,168,126,0.10)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = s.highlight ? `0 0 0 1px ${L.emDim}` : '0 1px 3px rgba(0,0,0,0.04)'; }}
          >
            {s.highlight && (
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${L.em}, transparent)` }} />
            )}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.8px]" style={{ color: L.textMuted }}>
                <span className="text-sm">{s.icon}</span>{s.label}
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: s.up ? L.em : L.amber, background: s.up ? L.emDim : '#d9770612' }}>
                {s.trend}
              </span>
            </div>
            <div className="text-[30px] font-bold leading-none mb-1" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-1.5px', color: L.textPrimary }}>
              {s.value}
            </div>
            <div className="text-[11px]" style={{ color: L.textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* WhatsApp Node */}
      <div className="mb-5 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">📡</span>
          <span className="text-[13px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>WhatsApp Node</span>
        </div>

        <div className="rounded-2xl p-7 relative overflow-hidden"
          style={{ background: L.surface, border: `1px solid ${L.border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="pointer-events-none absolute top-0 right-0 w-48 h-48"
            style={{ background: `radial-gradient(circle, ${L.emDim} 0%, transparent 70%)` }} />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: L.emDim, border: `1px solid ${L.emGlow}` }}>⬡</div>
              <div>
                <div className="text-[17px] font-bold" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}>WhatsApp Node</div>
                <div className="text-xs mt-0.5" style={{ color: L.textMuted }}>Powered by useAI Baileys Gateway</div>
              </div>
            </div>
            {status === 'connected' ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: L.emDim, border: `1px solid ${L.emGlow}`, color: L.em }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: L.em }} /> ACTIVE
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#e53e3e0e', border: '1px solid #e53e3e25', color: L.red }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: L.red }} /> INACTIVE
              </div>
            )}
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs font-medium mb-2" style={{ color: L.textMuted }}>
              <span>System Readiness</span>
              <span style={{ color: L.em, fontWeight: 700 }}>100% Loaded</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: L.surface3 }}>
              <div className="h-full rounded-full w-full relative overflow-hidden"
                style={{ background: `linear-gradient(90deg, ${L.em}, #00c896)` }}>
                <div className="absolute inset-y-0 right-0 w-12"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5))', animation: 'shimmer 2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>

          {(status === 'disconnected' || status === 'unknown') && (
            <div className="space-y-4">
              <p className="text-[13.5px] leading-relaxed" style={{ color: L.textSec }}>
                Your WhatsApp node is currently{' '}
                <strong className="font-semibold" style={{ color: L.red }}>offline</strong>.{' '}
                Connect your device to begin automating customer replies with{' '}
                <a href="#" style={{ color: L.em, textDecoration: 'none', fontWeight: 500 }}>real-time AI response intelligence</a>.
              </p>
              <button
                onClick={() => whatsappMutation.mutate()}
                disabled={whatsappMutation.isPending}
                className="w-full py-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
                style={{ background: L.em, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#009e75'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${L.emGlow}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = L.em; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
              >
                {whatsappMutation.isPending
                  ? <><RefreshCw className="w-5 h-5 animate-spin" /> Initializing Gateway...</>
                  : <><span>📱</span> Connect WhatsApp Device</>}
              </button>
            </div>
          )}

          {status === 'connected' && (
            <div className="rounded-xl p-5" style={{ background: L.emDim, border: `1px solid ${L.emGlow}` }}>
              <h4 className="font-bold text-lg mb-2" style={{ color: L.em, fontFamily: "'Syne', sans-serif" }}>Node fully operational</h4>
              <p className="text-sm leading-relaxed" style={{ color: L.textSec }}>
                Your proxy node is actively listening. Messages are processed by GPT-4o and routed instantly.
              </p>
              <div className="mt-4 flex gap-3">
                {[{ label: 'Response Mode', val: 'Autonomous AI' }, { label: 'Uptime', val: '99.9%' }].map((item) => (
                  <div key={item.label} className="flex-1 p-3 rounded-lg" style={{ background: L.surface, border: `1px solid ${L.border}` }}>
                    <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: L.textMuted }}>{item.label}</div>
                    <div className="text-sm font-bold" style={{ color: L.em }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'connecting' && (
            <div className="p-7 rounded-xl flex flex-col items-center text-center" style={{ background: '#d9770608', border: '1px solid #d9770625' }}>
              <div className="w-12 h-12 rounded-full border-2 mb-4 animate-spin"
                style={{ borderColor: '#d9770625', borderTopColor: L.amber }} />
              <h4 className="font-bold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif", color: L.amber }}>Establishing Connection</h4>
              <p className="text-sm" style={{ color: L.textSec }}>Attempting to establish a stable websocket handshake with WhatsApp servers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
        <div className="rounded-2xl p-5" style={{ background: L.surface, border: `1px solid ${L.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="text-[13px] font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>⚡ Quick Actions</div>
          <div className="flex flex-col gap-1">
            {quickActions.map((a, i) => (
              <Link key={i} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ border: '1px solid transparent', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = L.surface2; (e.currentTarget as HTMLElement).style.borderColor = L.border; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium" style={{ color: L.textPrimary }}>{a.name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: L.textMuted }}>{a.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: L.textMuted }} />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f0fdf9 0%, #e6faf3 100%)', border: `1px solid ${L.emGlow}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="pointer-events-none absolute -top-8 -right-8"
            style={{ width: 110, height: 110, background: `radial-gradient(circle, ${L.emGlow} 0%, transparent 70%)` }} />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3"
            style={{ background: L.emDim, border: `1px solid ${L.emGlow}`, color: L.em }}>
            ✦ Pro Tip
          </div>
          <h3 className="text-[17px] font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: L.textPrimary, letterSpacing: '-0.3px' }}>
            Boost your AI accuracy instantly
          </h3>
          <p className="text-[13px] leading-relaxed mb-5" style={{ color: L.textSec }}>
            Upload your business PDFs, FAQs, and product documents to the Knowledge Base. Our AI uses this context to deliver precise, on-brand responses.
          </p>
          <Link href="/dashboard/knowledge"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ color: L.em, border: `1px solid ${L.emGlow}`, background: L.emDim, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = L.em; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = L.em; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = L.emDim; (e.currentTarget as HTMLElement).style.color = L.em; (e.currentTarget as HTMLElement).style.borderColor = L.emGlow; }}
          >
            Go to Knowledge Base →
          </Link>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && whatsappMutation.data?.data?.qr && status === 'disconnected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          style={{ background: 'rgba(13,31,24,0.4)', backdropFilter: 'blur(12px)' }}>
          <div className="rounded-3xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-300"
            style={{ background: L.surface, border: `1px solid ${L.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.15)' }}>
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${L.em}, #00c896)` }} />
            <div className="p-10 text-center">
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>Scan to Link</h3>
              <p className="text-sm mb-8" style={{ color: L.textSec }}>
                WhatsApp &gt; <span style={{ color: L.em }}>Linked Devices</span> &gt; <span style={{ color: L.em }}>Link a Device</span>
              </p>
              <div className="p-4 rounded-2xl inline-block mb-8" style={{ background: L.surface2, border: `1px solid ${L.border}` }}>
                <img src={whatsappMutation.data.data.qr} alt="QR Code" className="w-56 h-56 mx-auto" />
              </div>
              <button onClick={() => setShowQR(false)} className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: L.surface2, border: `1px solid ${L.border}`, color: L.textSec, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes shimmer { 0%,100%{opacity:0} 50%{opacity:1} }`}</style>
    </div>
  );
}
