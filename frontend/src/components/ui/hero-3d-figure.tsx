'use client';

import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   Hero Visual — Animated WhatsApp Chat + Dashboard
   No Three.js / WebGL dependency
───────────────────────────────────────────── */

const STYLES = `
@keyframes heroFloat {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-14px) rotate(1deg); }
}
@keyframes heroFloatR {
  0%, 100% { transform: translateY(0px) rotate(1deg); }
  50% { transform: translateY(-10px) rotate(-0.5deg); }
}
@keyframes msgSlideIn {
  from { opacity: 0; transform: translateX(-18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes msgSlideInR {
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes typingPulse {
  0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
  40% { transform: scale(1.4); opacity: 1; }
}
@keyframes barGrow {
  from { height: 4px; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(20,184,166,0.4); }
  50% { box-shadow: 0 0 0 10px rgba(20,184,166,0); }
}
@keyframes statusBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes orbitSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes counterUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* — wrapper — */
.hero-visual-wrap {
  width: 100%;
  max-width: 860px;
  margin: 44px auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
  padding: 0 16px;
}

/* — shared card shell — */
.hero-card {
  border-radius: 24px;
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255,255,255,0.9);
  box-shadow:
    0 8px 40px rgba(15,118,110,0.12),
    0 2px 8px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  overflow: hidden;
}

/* ── CHAT CARD ── */
.chat-card {
  animation: heroFloat 6s ease-in-out infinite;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #0F766E 0%, #0D9488 100%);
  border-radius: 22px 22px 0 0;
}
.chat-header-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.chat-header-info { flex: 1; }
.chat-header-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  font-family: var(--fb, 'Plus Jakarta Sans', sans-serif);
}
.chat-header-sub {
  font-size: 10.5px;
  color: rgba(255,255,255,0.75);
  display: flex;
  align-items: center;
  gap: 4px;
}
.chat-header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  animation: statusBlink 2s ease-in-out infinite;
}
.chat-msgs {
  padding: 14px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  background: #f0f4f8;
  min-height: 220px;
}
.cmsg {
  display: flex;
  flex-direction: column;
}
.cmsg.user { align-items: flex-end; }
.cmsg.ai   { align-items: flex-start; }
.cmsg-label {
  font-size: 9px;
  font-weight: 700;
  color: #0F766E;
  margin-bottom: 3px;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.cmsg-bubble {
  padding: 8px 12px;
  border-radius: 14px;
  font-size: 11.5px;
  line-height: 1.5;
  max-width: 82%;
  font-family: var(--fb, 'Plus Jakarta Sans', sans-serif);
}
.cmsg.user .cmsg-bubble {
  background: #DCF8C6;
  color: #1a2a1f;
  border-radius: 14px 14px 2px 14px;
  animation: msgSlideInR 0.4s ease forwards;
}
.cmsg.ai .cmsg-bubble {
  background: #fff;
  color: #1a1a2e;
  border-radius: 14px 14px 14px 2px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  animation: msgSlideIn 0.4s ease forwards;
}
.cmsg-time {
  font-size: 9px;
  color: #9ca3af;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.typing-wrap {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #fff;
  border-radius: 14px 14px 14px 2px;
  padding: 9px 14px;
  width: fit-content;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  animation: msgSlideIn 0.4s ease 1.6s both;
}
.tdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0D9488;
}
.tdot:nth-child(1) { animation: typingPulse 1.2s 0.0s ease-in-out infinite; }
.tdot:nth-child(2) { animation: typingPulse 1.2s 0.2s ease-in-out infinite; }
.tdot:nth-child(3) { animation: typingPulse 1.2s 0.4s ease-in-out infinite; }

/* ── DASHBOARD CARD ── */
.dash-card {
  animation: heroFloatR 7s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.dash-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(15,118,110,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dash-title {
  font-size: 12px;
  font-weight: 800;
  color: #0F766E;
  font-family: var(--fd, 'Syne', sans-serif);
  letter-spacing: 0.3px;
}
.dash-live {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  color: #0F766E;
}
.dash-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #14B8A6;
  animation: pulseGlow 2s ease-in-out infinite;
}
.dash-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(15,118,110,0.06);
}
.dash-stat {
  padding: 14px 14px;
  background: rgba(255,255,255,0.7);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dash-stat-val {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--fd, 'Syne', sans-serif);
  background: linear-gradient(135deg, #0F766E, #22D3EE);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: counterUp 0.5s ease forwards;
}
.dash-stat-label {
  font-size: 9.5px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.dash-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 700;
  color: #10b981;
  background: rgba(16,185,129,0.1);
  border-radius: 100px;
  padding: 1px 6px;
  margin-top: 2px;
  width: fit-content;
}

/* bar chart */
.dash-chart {
  padding: 14px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dash-chart-title {
  font-size: 10px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.dash-bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 54px;
}
.dash-bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, #0F766E, #22D3EE);
  opacity: 0.85;
  animation: barGrow 0.8s ease forwards;
  transform-origin: bottom;
}
.dash-bar-labels {
  display: flex;
  gap: 5px;
}
.dash-bar-label {
  flex: 1;
  text-align: center;
  font-size: 8.5px;
  color: #9ca3af;
  font-weight: 500;
}

/* AI insights strip */
.dash-insight {
  margin: 0 10px 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(15,118,110,0.08), rgba(34,211,238,0.06));
  border-radius: 12px;
  border: 1px solid rgba(15,118,110,0.12);
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-insight-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.dash-insight-text {
  font-size: 10px;
  font-weight: 600;
  color: #0F766E;
  line-height: 1.4;
}

/* ── ORBIT BADGE (floats between the cards) ── */
.hero-orbit-wrap {
  position: absolute;
  width: 60px;
  height: 60px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.hero-visual-outer {
  position: relative;
  width: 100%;
  max-width: 860px;
  margin: 44px auto 0;
  padding: 0 16px;
}
.hero-visual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
}

/* ── ORBIT PILL ── */
.orbit-pill {
  position: absolute;
  background: linear-gradient(135deg, #0F766E, #22D3EE);
  color: #fff;
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 800;
  font-family: var(--fd, 'Syne', sans-serif);
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(15,118,110,0.4);
  z-index: 10;
}
.orbit-pill-1 {
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  animation: heroFloat 5s ease-in-out infinite;
}
.orbit-pill-2 {
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  animation: heroFloatR 5.5s ease-in-out infinite;
}

@media (max-width: 640px) {
  .hero-visual-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .orbit-pill { display: none; }
}
`;

const BAR_HEIGHTS = [38, 52, 44, 68, 74, 58, 80];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Hero3DFigure() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!document.getElementById('hero-visual-styles')) {
      const el = document.createElement('style');
      el.id = 'hero-visual-styles';
      el.textContent = STYLES;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => {
      styleRef.current?.remove();
    };
  }, []);

  return (
    <div className="hero-visual-outer">
      <div className="hero-visual-grid">

        {/* ── LEFT: WhatsApp Chat Mockup ── */}
        <div className="hero-card chat-card">
          {/* header */}
          <div className="chat-header">
            <div className="chat-header-av">🛋️</div>
            <div className="chat-header-info">
              <div className="chat-header-name">Sharma Furniture</div>
              <div className="chat-header-sub">
                <div className="chat-header-dot" />
                Powered by useAI · Online
              </div>
            </div>
          </div>

          {/* messages */}
          <div className="chat-msgs">
            <div className="cmsg user">
              <div className="cmsg-bubble">Hi! Red Oslo sofa ka price kya hai? 🛋️</div>
              <div className="cmsg-time">2:41 PM ✓✓</div>
            </div>

            <div className="cmsg ai">
              <div className="cmsg-label">🤖 useAI · 96% confident</div>
              <div className="cmsg-bubble">
                Namaste! 🙏 Red Oslo Sofa ₹12,499 mein available hai aur stock mein hai! Free delivery 3 din mein — ₹5,000 se upar ke orders pe. Delivery book karein? 🚚
              </div>
              <div className="cmsg-time">2:41 PM · ⚡ 1.6 sec</div>
            </div>

            <div className="cmsg user">
              <div className="cmsg-bubble">Can I get it by Saturday? 😊</div>
              <div className="cmsg-time">2:42 PM ✓✓</div>
            </div>

            {/* typing indicator */}
            <div className="cmsg ai">
              <div className="cmsg-label">🤖 useAI</div>
              <div className="typing-wrap">
                <div className="tdot" />
                <div className="tdot" />
                <div className="tdot" />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Dashboard Stats ── */}
        <div className="hero-card dash-card">
          {/* header */}
          <div className="dash-header">
            <div className="dash-title">useAI Dashboard</div>
            <div className="dash-live">
              <div className="dash-live-dot" />
              Live
            </div>
          </div>

          {/* 2×2 stat grid */}
          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-val">1,284</div>
              <div className="dash-stat-label">Conversations</div>
              <div className="dash-stat-badge">↑ +18% this week</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val">96%</div>
              <div className="dash-stat-label">AI Accuracy</div>
              <div className="dash-stat-badge">↑ +3%</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val">1.8s</div>
              <div className="dash-stat-label">Avg Response</div>
              <div className="dash-stat-badge">↓ faster</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val">₹7</div>
              <div className="dash-stat-label">Per Conversation</div>
              <div className="dash-stat-badge">✓ pay-as-go</div>
            </div>
          </div>

          {/* mini bar chart */}
          <div className="dash-chart">
            <div className="dash-chart-title">Messages this week</div>
            <div className="dash-bars">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="dash-bar"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>
            <div className="dash-bar-labels">
              {DAYS.map((d, i) => (
                <div key={i} className="dash-bar-label">{d}</div>
              ))}
            </div>
          </div>

          {/* AI insight strip */}
          <div className="dash-insight">
            <div className="dash-insight-icon">✨</div>
            <div className="dash-insight-text">
              AI saved you <strong>~14 hours</strong> of manual replies this week
            </div>
          </div>
        </div>

      </div>

      {/* floating pills between the cards */}
      <div className="orbit-pill orbit-pill-1">⚡ 2-sec AI replies</div>
      <div className="orbit-pill orbit-pill-2">🇮🇳 Hindi · Tamil · English + 10 more</div>
    </div>
  );
}
