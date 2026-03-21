'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
    const router = useRouter();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsVideoModalOpen(false);
        };
        if (isVideoModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVideoModalOpen]);

    return (
        <section style={{ position: 'relative', background: 'var(--white)' }}>
            <div className="hero">
                <div className="hero-left">
                    <div className="hero-badge">
                        <div className="hero-badge-dot"></div>
                        NOW IN BETA · 2,000+ BUSINESSES LIVE
                    </div>

                    <h1 className="hero-h1">
                        Your business on WhatsApp,<br />
                        powered by <em>real AI</em>
                    </h1>

                    <p className="hero-sub">
                        Train AI on your website in 5 minutes. It handles every customer query on WhatsApp — instantly, 24/7, in their language. While you focus on growing.
                    </p>

                    <div className="hero-actions">
                        <button className="btn-hero" onClick={() => router.push('/signup')}>
                            Start building free
                            <span className="btn-hero-arr">→</span>
                        </button>
                        <button className="btn-sec" onClick={() => setIsVideoModalOpen(true)}>
                            Watch 2-min demo
                        </button>
                    </div>

                    <div className="hero-proof">
                        <div className="proof-avs">
                            <div className="proof-av" style={{ background: '#e8420a' }}>R</div>
                            <div className="proof-av" style={{ background: '#1a1917' }}>P</div>
                            <div className="proof-av" style={{ background: '#7a7870' }}>A</div>
                            <div className="proof-av" style={{ background: '#e8420a' }}>S</div>
                            <div className="proof-av" style={{ background: '#3a3935' }}>M</div>
                        </div>
                        <div className="proof-sep"></div>
                        <div className="proof-txt"><strong>2,000+</strong> businesses trust useAI</div>
                        <div className="proof-sep"></div>
                        <div className="proof-stars">★★★★★</div>
                        <div className="proof-txt"><strong>4.9 / 5</strong></div>
                    </div>
                </div>

                {/* App window */}
                <div className="hero-right">
                    <div className="app-window">
                        <div className="aw-bar">
                            <div className="aw-dots">
                                <div className="aw-dot awd-r"></div>
                                <div className="aw-dot awd-y"></div>
                                <div className="aw-dot awd-g"></div>
                            </div>
                            <div className="aw-url">
                                <span className="aw-lock">🔒</span>
                                app.useai.in/dashboard
                            </div>
                        </div>
                        <div className="aw-dash">
                            <div className="aw-sidebar">
                                <div className="aws-logo">use<span>AI</span></div>
                                <div className="aws-label">MAIN</div>
                                <div className="aws-item on"><div className="ai-l"><span>📊</span>Dashboard</div></div>
                                <div className="aws-item"><div className="ai-l"><span>🧠</span>Knowledge</div></div>
                                <div className="aws-item"><div className="ai-l"><span>💬</span>Conversations</div><span className="aws-badge">3</span></div>
                                <div className="aws-item"><div className="ai-l"><span>❓</span>Unanswered</div><span className="aws-badge amber">7</span></div>
                                <div className="aws-label">TOOLS</div>
                                <div className="aws-item"><div className="ai-l"><span>📣</span>Campaigns</div></div>
                                <div className="aws-item"><div className="ai-l"><span>💳</span>Billing</div></div>
                            </div>
                            <div className="aw-main">
                                <div className="aw-stats">
                                    <div className="aw-stat">
                                        <div className="aw-stat-val or">847</div>
                                        <div className="aw-stat-lbl">Conversations</div>
                                    </div>
                                    <div className="aw-stat">
                                        <div className="aw-stat-val">83%</div>
                                        <div className="aw-stat-lbl">Automated</div>
                                    </div>
                                    <div className="aw-stat">
                                        <div className="aw-stat-val">1.8s</div>
                                        <div className="aw-stat-lbl">Avg reply</div>
                                    </div>
                                    <div className="aw-stat">
                                        <div className="aw-stat-val" style={{ color: '#dc2626' }}>7</div>
                                        <div className="aw-stat-lbl">Unanswered</div>
                                    </div>
                                </div>
                                <div className="aw-chart">
                                    <div className="aw-chart-title">Conversations — last 30 days</div>
                                    <svg width="100%" height="48" viewBox="0 0 400 48" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#e8420a" stopOpacity=".18" />
                                                <stop offset="100%" stopColor="#e8420a" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,44 C50,38 80,28 120,20 S180,10 220,6 S300,2 360,1 L400,0" stroke="#e8420a" strokeWidth="2" fill="none" strokeLinecap="round" />
                                        <path d="M0,44 C50,38 80,28 120,20 S180,10 220,6 S300,2 360,1 L400,0 L400,48 L0,48Z" fill="url(#cg)" />
                                    </svg>
                                </div>
                                <div className="aw-table">
                                    <div className="aw-tr head"><span style={{ flex: 1 }}>Customer</span><span style={{ flex: 2 }}>Message</span><span>Status</span></div>
                                    <div className="aw-tr">
                                        <div className="aw-av" style={{ background: '#e8420a', flexShrink: 0, marginRight: '6px' }}>R</div>
                                        <span style={{ flex: 1, fontWeight: 600, fontSize: '11px' }}>+91 98123…</span>
                                        <span style={{ flex: 2, color: 'var(--ink3)' }}>Price of red sofa?</span>
                                        <span className="aw-status st-ai">🤖 AI</span>
                                    </div>
                                    <div className="aw-tr">
                                        <div className="aw-av" style={{ background: '#3a3935', flexShrink: 0, marginRight: '6px' }}>P</div>
                                        <span style={{ flex: 1, fontWeight: 600, fontSize: '11px' }}>Priya M.</span>
                                        <span style={{ flex: 2, color: 'var(--ink3)' }}>Delivery to Pune?</span>
                                        <span className="aw-status st-ai">🤖 AI</span>
                                    </div>
                                    <div className="aw-tr">
                                        <div className="aw-av" style={{ background: '#7a7870', flexShrink: 0, marginRight: '6px' }}>A</div>
                                        <span style={{ flex: 1, fontWeight: 600, fontSize: '11px' }}>Arjun K.</span>
                                        <span style={{ flex: 2, color: 'var(--ink3)' }}>Cancel my order</span>
                                        <span className="aw-status st-esc">⚠ Escalated</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated interactive generic Video React Modal mapping */}
            {isVideoModalOpen && (
                <div
                    onClick={() => setIsVideoModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 20px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', cursor: 'default' }}
                    >
                        <button
                            onClick={() => setIsVideoModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
                        >
                            ✕
                        </button>
                        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                            <iframe
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
