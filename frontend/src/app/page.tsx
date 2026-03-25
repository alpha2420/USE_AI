'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // Cursor trail
    const cd = document.getElementById('cd');
    const cr = document.getElementById('cr');
    let mx = 0, my = 0, rx = 0, ry = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cd) {
        cd.style.left = mx + 'px';
        cd.style.top = my + 'px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    let animFrame: number;
    function animCursor() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (cr) {
        cr.style.left = rx + 'px';
        cr.style.top = ry + 'px';
      }
      animFrame = requestAnimationFrame(animCursor);
    }
    animCursor();

    document.querySelectorAll('a,button,.glass-card,.nav-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cr) {
          cr.style.width = '48px';
          cr.style.height = '48px';
          cr.style.borderColor = 'rgba(255,69,0,0.6)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (cr) {
          cr.style.width = '32px';
          cr.style.height = '32px';
          cr.style.borderColor = 'rgba(255,69,0,0.4)';
        }
      });
    });

    // Intersection Observer for reveal animations
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal,.how-step,.bento-card,.testi-card,.chat-demo').forEach(el => io.observe(el));

    // Stagger bento cards
    document.querySelectorAll('.bento-card').forEach((c, i) => {
      (c as HTMLElement).style.transitionDelay = (i * 0.07) + 's';
    });
    // Stagger how steps
    document.querySelectorAll('.how-step').forEach((s, i) => {
      (s as HTMLElement).style.transitionDelay = (i * 0.1) + 's';
    });
    // Stagger testis
    document.querySelectorAll('.testi-card').forEach((t, i) => {
      (t as HTMLElement).style.transitionDelay = (i * 0.12) + 's';
    });

    // Counter animation
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const target = parseInt(el.dataset.target || '0');
          const isHeroStat = el.closest('.hero-stats');
          const isBigStat = el.classList.contains('big-stat');
          const dur = 1800;
          const start = performance.now();

          function update(now: number) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = Math.floor(ease * target);
            if (isBigStat) {
              el.textContent = val + '%';
            } else if (isHeroStat) {
              const hs = el.closest('.hero-stat');
              const lbl = hs && hs.querySelector('.hs-label')?.textContent;
              if (lbl && lbl.includes('Million')) el.textContent = val + 'M+';
              else if (lbl && lbl.includes('%')) el.textContent = val + '%';
              else el.textContent = val.toString();
            } else el.textContent = val + '%';
            if (p < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
          counterIO.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter[data-target]').forEach(el => counterIO.observe(el));

    // Floating particles
    const spawnParticle = (x: number, y: number) => {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 8 + 4;
      const colors = ['#FF4500', '#38BDF8', '#8B5CF6', '#00E5A0', '#F472B6', '#FFB347'];
      p.style.cssText = `
        width:${size}px;height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${x}px;top:${y}px;
        animation:particleAnim 0.8s ease-out forwards;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    };

    // Add keyframe for particles dynamically if it doesn't exist
    if (!document.getElementById('particle-style')) {
      const style = document.createElement('style');
      style.id = 'particle-style';
      style.textContent = `@keyframes particleAnim{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(${(Math.random() - 0.5) * 80}px,${-40 - Math.random() * 40}px) scale(0)}}`;
      document.head.appendChild(style);
    }

    const handleGlobalClick = (e: MouseEvent) => {
      for (let i = 0; i < 6; i++) {
        spawnParticle(e.clientX + (Math.random() - 0.5) * 20, e.clientY + (Math.random() - 0.5) * 20);
      }
    };
    document.addEventListener('click', handleGlobalClick);

    // Smooth nav active
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const handleScroll = () => {
      let current = '';
      sections.forEach(s => {
        const section = s as HTMLElement;
        if (window.scrollY >= section.offsetTop - 100) current = section.id;
      });
      navLinks.forEach(a => {
        const link = a as HTMLAnchorElement;
        link.style.color = link.getAttribute('href') === '#' + current ? 'var(--or)' : '';
      });

      // Nav scroll effect
      const navbar = document.querySelector('nav');
      if (navbar) {
        if (window.scrollY > 60) {
          navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
        } else {
          navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)';
        }
      }
    };
    window.addEventListener('scroll', handleScroll);

    console.log('%cuseAI Landing Page 🚀', 'color:#FF4500;font-family:Syne;font-size:18px;font-weight:800');

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animFrame);
      io.disconnect();
      counterIO.disconnect();
    };
  }, []);

  return (
    <>
      {/* cursor */}
      <div className="cursor-dot" id="cd"></div>
      <div className="cursor-ring" id="cr"></div>

      {/* aurora bg */}
      <div className="aurora-bg">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="orb orb4"></div>
        <div className="orb orb5"></div>
      </div>

      {/* wa float */}
      <Link href="/signup" className="wa-float" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>💬</Link>

      {/* ══ NAV ════════════════════════════════════════════ */}
      <nav className="landing-nav">
        <div className="nav-logo">use<span>AI</span></div>
        <div className="nav-links">
          <Link href="#how">How it works</Link>
          <Link href="#features">Features</Link>
          <Link href="#proof">Reviews</Link>
          <Link href="#pricing">Pricing</Link>
        </div>
        <div className="nav-cta">
          <Link href="/login" className="btn-nav btn-ghost-nav" style={{textDecoration: 'none'}}>Sign in</Link>
          <Link href="/signup" className="btn-nav btn-fill-nav" style={{textDecoration: 'none'}}>Start free →</Link>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-tag">
          <div className="hero-tag-dot"></div>
          Trusted by 2,000+ Indian businesses
        </div>

        <h1 className="hero-h1">
          Your business on<br />
          <span className="gr">WhatsApp,</span> powered by<br />
          <span className="gr2">real AI</span>
        </h1>

        <p className="hero-sub">
          Train AI on your website in 5 minutes. It replies to every customer query on WhatsApp — instantly, 24/7, in their language.
        </p>

        <div className="hero-actions">
          <Link href="/signup" className="btn-hero btn-hero-primary" style={{textDecoration: 'none'}}>
            🚀 Start free — no credit card
          </Link>
          <button className="btn-hero btn-hero-secondary">
            ▶ Watch 2-min demo
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hs-val counter" data-target="853">0</div>
            <div className="hs-label">Million WhatsApp users in India</div>
          </div>
          <div className="hero-stat">
            <div className="hs-val counter" data-target="63">0</div>
            <div className="hs-label">Million Indian SMBs</div>
          </div>
          <div className="hero-stat">
            <div className="hs-val">₹7</div>
            <div className="hs-label">Per conversation only</div>
          </div>
          <div className="hero-stat">
            <div className="hs-val counter" data-target="83">0</div>
            <div className="hs-label">% automation rate avg</div>
          </div>
        </div>

        {/* dashboard mockup */}
        <div className="hero-mockup reveal">
          <div className="mockup-browser">
            <div className="mockup-bar">
              <div className="mockup-dots">
                <div className="mockup-dot md-r"></div>
                <div className="mockup-dot md-y"></div>
                <div className="mockup-dot md-g"></div>
              </div>
              <div className="mockup-url">🔒 app.useai.in/dashboard</div>
            </div>
            <div className="mockup-body">
              <div className="dash-preview">
                <div className="dp-sidebar">
                  <div className="dp-logo"><b>use</b>AI</div>
                  <div className="dp-item on">📊 Dashboard</div>
                  <div className="dp-item">🧠 Knowledge</div>
                  <div className="dp-item">💬 Conversations</div>
                  <div className="dp-item">📣 Campaigns</div>
                  <div className="dp-item">💳 Billing</div>
                </div>
                <div className="dp-main">
                  <div className="dp-stats">
                    <div className="dp-stat"><div className="dp-sv" style={{ color: 'var(--or)' }}>847</div><div className="dp-sl">Conversations</div></div>
                    <div className="dp-stat"><div className="dp-sv" style={{ color: 'var(--mint)' }}>83%</div><div className="dp-sl">Automated</div></div>
                    <div className="dp-stat"><div className="dp-sv" style={{ color: 'var(--sky)' }}>1.8s</div><div className="dp-sl">Avg Reply</div></div>
                    <div className="dp-stat"><div className="dp-sv" style={{ color: 'var(--red,#ef4444)' }}>7</div><div className="dp-sl">Unanswered</div></div>
                  </div>
                  <div className="dp-chart">
                    <svg width="100%" height="56" viewBox="0 0 400 56" preserveAspectRatio="none">
                      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4500" stopOpacity="0.2" /><stop offset="100%" stopColor="#FF4500" stopOpacity="0" /></linearGradient></defs>
                      <path d="M0,50 C50,45 80,35 120,28 S180,15 220,10 S300,4 350,2 S380,2 400,1" stroke="#FF4500" strokeWidth="2" fill="none" />
                      <path d="M0,50 C50,45 80,35 120,28 S180,15 220,10 S300,4 350,2 S380,2 400,1 L400,56 L0,56Z" fill="url(#g1)" />
                    </svg>
                  </div>
                  <div className="dp-table" style={{ marginTop: '8px' }}>
                    <div className="dp-tr" style={{ background: '#faf9f7', fontWeight: 700, color: 'var(--text3)' }}><span style={{ flex: 2 }}>Customer</span><span style={{ flex: 3 }}>Message</span><span style={{ flex: 1 }}>Status</span></div>
                    <div className="dp-tr"><span style={{ flex: 2, fontWeight: 600 }}>+91 98123...</span><span style={{ flex: 3, color: 'var(--text3)' }}>Price of red sofa?</span><span style={{ flex: 1, color: 'var(--mint)', fontWeight: 700 }}>AI ✓</span></div>
                    <div className="dp-tr"><span style={{ flex: 2, fontWeight: 600 }}>Priya M.</span><span style={{ flex: 3, color: 'var(--text3)' }}>Delivery to Pune?</span><span style={{ flex: 1, color: 'var(--mint)', fontWeight: 700 }}>AI ✓</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════ */}
      <div className="marquee-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="marquee-track" id="marquee">
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--or)' }}></div>Furniture Store</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--sky)' }}></div>Real Estate Agency</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--mint)' }}></div>Online Clothing Store</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--violet)' }}></div>Coaching Institute</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--pink)' }}></div>Restaurant Chain</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--or)' }}></div>Travel Agency</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--sky)' }}></div>Healthcare Clinic</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--mint)' }}></div>D2C Brand</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--violet)' }}></div>Electronics Shop</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--pink)' }}></div>Wedding Planner</div>
          {/* duplicate for loop */}
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--or)' }}></div>Furniture Store</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--sky)' }}></div>Real Estate Agency</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--mint)' }}></div>Online Clothing Store</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--violet)' }}></div>Coaching Institute</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--pink)' }}></div>Restaurant Chain</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--or)' }}></div>Travel Agency</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--sky)' }}></div>Healthcare Clinic</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--mint)' }}></div>D2C Brand</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--violet)' }}></div>Electronics Shop</div>
          <div className="marquee-item"><div className="mi-dot" style={{ background: 'var(--pink)' }}></div>Wedding Planner</div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section id="how">
        <div className="container">
          <div className="how-grid">
            <div>
              <div className="section-tag tag-orange">How It Works</div>
              <h2 className="section-title">From website URL to<br /><span style={{ color: 'var(--or)' }}>live AI in 5 minutes</span></h2>
              <p className="section-sub" style={{ marginBottom: '36px' }}>No code. No developers. No complex setup. Just paste your URL and go.</p>
              <div className="how-steps">
                <div className="how-step">
                  <div className="step-num sn1">1</div>
                  <div>
                    <div className="step-title">Paste your website URL</div>
                    <div className="step-desc">Our crawler reads your entire website — every product, price, policy, and FAQ. Takes under 5 minutes.</div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="step-num sn2">2</div>
                  <div>
                    <div className="step-title">Connect your WhatsApp</div>
                    <div className="step-desc">Scan a QR code with your WhatsApp Business app and you're live instantly. API upgrade available anytime.</div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="step-num sn3">3</div>
                  <div>
                    <div className="step-title">AI handles every message</div>
                    <div className="step-desc">Customers message you, AI replies in 2 seconds with accurate answers drawn from your knowledge base.</div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="step-num sn4">4</div>
                  <div>
                    <div className="step-title">You grow, AI keeps learning</div>
                    <div className="step-desc">Unanswered questions get flagged. You add answers, AI trains instantly. Gets smarter every day.</div>
                  </div>
                </div>
              </div>
            </div>
            {/* chat demo */}
            <div className="chat-demo">
              <div className="chat-top">
                <div className="chat-av">🛋️</div>
                <div>
                  <div className="chat-biz-name">Sharma Furniture</div>
                  <div className="chat-biz-status">🤖 Powered by useAI · Online</div>
                </div>
              </div>
              <div className="chat-body">
                <div className="chat-msg in">
                  <div className="chat-bubble">Hi! Red Oslo sofa ka price kya hai? 😊</div>
                  <div className="chat-time">2:41 PM</div>
                </div>
                <div className="chat-msg out" style={{ alignSelf: 'flex-start' }}>
                  <div className="ai-label">🤖 useAI · 96% confident</div>
                  <div className="chat-bubble">Namaste! 😊 Red Oslo Sofa ₹12,499 mein available hai aur stock mein hai! Free delivery 3 din mein — ₹5,000 se upar ke orders pe. Delivery book karein? 🚚</div>
                  <div className="chat-time">2:41 PM · 1.6 sec ⚡</div>
                </div>
                <div className="chat-msg in">
                  <div className="chat-bubble">Yes! Can I get it by Saturday morning?</div>
                  <div className="chat-time">2:42 PM</div>
                </div>
                <div className="chat-msg out" style={{ alignSelf: 'flex-start' }}>
                  <div className="ai-label">🤖 useAI · 94% confident</div>
                  <div className="chat-bubble">Absolutely! Saturday morning slot (10 AM–1 PM) available hai 🎉 Aapka naam aur address share karein, hum booking confirm kar denge!</div>
                  <div className="chat-time">2:42 PM · 1.8 sec ⚡</div>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES BENTO ════════════════════════════════ */}
      <section id="features">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="reveal">
            <div className="section-tag tag-violet" style={{ display: 'inline-flex' }}>Everything you need</div>
            <h2 className="section-title">Built for Indian<br />businesses that move fast</h2>
          </div>
          <div className="bento">

            <div className="bento-card bc-1 bc-theme-orange glass-card">
              <div className="bc-icon">🧠</div>
              <div className="bc-title">RAG-Powered AI Brain</div>
              <div className="bc-desc">Not keyword matching. Not a button flow. Real AI that reads your website, understands context, and gives accurate answers every time.</div>
              <div className="big-stat counter" data-target="96">0</div>
              <div className="big-stat-label">% average answer accuracy</div>
              <div className="mini-bars">
                <div className="mini-bar" style={{ height: '35%' }}></div>
                <div className="mini-bar" style={{ height: '55%' }}></div>
                <div className="mini-bar" style={{ height: '75%' }}></div>
                <div className="mini-bar" style={{ height: '60%' }}></div>
                <div className="mini-bar" style={{ height: '85%' }}></div>
                <div className="mini-bar" style={{ height: '95%' }}></div>
                <div className="mini-bar" style={{ height: '100%' }}></div>
              </div>
            </div>

            <div className="bento-card bc-2 bc-theme-blue glass-card">
              <div className="bc-icon">⚡</div>
              <div className="bc-title">2-Second Replies</div>
              <div className="bc-desc">Average AI response time is 1.8 seconds. Your customers never wait. Even at 2 AM on a Sunday.</div>
              <div className="speed-ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e4e0d8" strokeWidth="7" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="url(#sg)" strokeWidth="7"
                    strokeDasharray="188" strokeDashoffset="37" strokeLinecap="round"
                    transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 2s ease' }} />
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF4500" /><stop offset="100%" stopColor="#FFB347" /></linearGradient></defs>
                </svg>
                <div className="speed-text">1.8s<br /><span className="speed-sub">AVG</span></div>
              </div>
            </div>

            <div className="bento-card bc-3 bc-theme-green glass-card">
              <div className="bc-icon">🌍</div>
              <div className="bc-title">Auto Multilingual</div>
              <div className="bc-desc">Detects and replies in customer&apos;s own language.</div>
              <div className="lang-flags">
                <span className="lang-flag">🇮🇳 Hindi</span>
                <span className="lang-flag">🏳️ Tamil</span>
                <span className="lang-flag">🏳️ Bengali</span>
                <span className="lang-flag">🇬🇧 English</span>
                <span className="lang-flag">🏳️ Marathi</span>
                <span className="lang-flag">+ 10 more</span>
              </div>
            </div>

            <div className="bento-card bc-4 bc-theme-dark glass-card">
              <div className="bc-icon">📣</div>
              <div className="bc-title" style={{ color: '#fff' }}>Bulk Campaigns</div>
              <div className="bc-desc" style={{ color: 'rgba(255,255,255,0.55)' }}>Send Diwali offers, new arrivals, restock alerts to thousands. AI handles every reply automatically.</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                <span style={{ padding: '4px 10px', background: 'rgba(255,69,0,0.2)', borderRadius: '100px', fontSize: '11px', color: 'var(--or)', fontWeight: 700 }}>Diwali Sale 🪔</span>
                <span style={{ padding: '4px 10px', background: 'rgba(56,189,248,0.15)', borderRadius: '100px', fontSize: '11px', color: 'var(--sky)', fontWeight: 700 }}>New Arrivals ✨</span>
                <span style={{ padding: '4px 10px', background: 'rgba(0,229,160,0.15)', borderRadius: '100px', fontSize: '11px', color: 'var(--mint)', fontWeight: 700 }}>Restock Alert 📦</span>
              </div>
            </div>

            <div className="bento-card bc-5 bc-theme-violet glass-card">
              <div className="bc-icon">🛒</div>
              <div className="bc-title">Shopify + CRM Integrations</div>
              <div className="bc-desc">Connect your store. AI knows live inventory, order status, and cart data. &quot;Where&apos;s my order?&quot; — answered in 2 seconds.</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', border: '1px solid rgba(0,0,0,0.06)' }}>🛍 Shopify</span>
                <span style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', border: '1px solid rgba(0,0,0,0.06)' }}>🔗 WooCommerce</span>
                <span style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', border: '1px solid rgba(0,0,0,0.06)' }}>📊 Zoho CRM</span>
                <span style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', border: '1px solid rgba(0,0,0,0.06)' }}>📅 Google Cal</span>
              </div>
            </div>

            <div className="bento-card bc-6 bc-theme-pink glass-card">
              <div className="bc-icon">💸</div>
              <div className="bc-title">Pay Only When It Works</div>
              <div className="bc-desc">₹7 per conversation. Zero monthly fee to start. Only pay for what you use.</div>
              <div style={{ marginTop: '10px', fontFamily: 'var(--fd)', fontSize: '28px', fontWeight: 800, color: 'var(--or)' }}>₹7<span style={{ fontSize: '14px', color: 'var(--text3)', fontFamily: 'var(--fb)', fontWeight: 400 }}> / convo</span></div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ SOCIAL PROOF ══════════════════════════════════ */}
      <section id="proof">
        <div className="container">
          <div style={{ textAlign: 'center' }} className="reveal">
            <div className="section-tag tag-green" style={{ display: 'inline-flex' }}>Reviews</div>
            <h2 className="section-title">2,000+ businesses<br />already saving time</h2>
          </div>
          <div className="logos-row reveal">
            <div className="logo-chip">🛋️ Sharma Furniture</div>
            <div className="logo-chip">🏠 PropEasy Realty</div>
            <div className="logo-chip">👗 Desi Drip</div>
            <div className="logo-chip">📚 EduSpark</div>
            <div className="logo-chip">🍕 Spice Route</div>
            <div className="logo-chip">✈️ VoyageIn</div>
          </div>
          <div className="testimonials">
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">&quot;Hamare store pe roz 80+ WhatsApp messages aate the. Main khud hi reply karta tha — 2-3 ghante waste. useAI ne yeh kaam apne haath mein le liya. Ab main sirf important calls attend karta hoon.&quot;</div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: 'linear-gradient(135deg,var(--or),var(--or3))' }}>RS</div>
                <div><div className="testi-name">Rahul Sharma</div><div className="testi-biz">Sharma Furniture, Delhi</div></div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">&quot;Real estate mein ek missed lead matlab ek deal gone. useAI 24/7 property queries handle karta hai — price, location, availability. 40% more qualified leads now because no message goes unanswered.&quot;</div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: 'linear-gradient(135deg,var(--sky),var(--mint))' }}>PK</div>
                <div><div className="testi-name">Priya Kapoor</div><div className="testi-biz">PropEasy Realty, Mumbai</div></div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">&quot;We tried 3 other chatbot tools before. All had rigid flows and button menus. useAI is the only one that actually UNDERSTANDS what the customer is asking and gives a real answer.&quot;</div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: 'linear-gradient(135deg,var(--violet),var(--pink))' }}>AM</div>
                <div><div className="testi-name">Arjun Mehta</div><div className="testi-biz">EduSpark Coaching, Pune</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════════════ */}
      <section id="pricing">
        <div className="container">
          <div className="reveal">
            <div className="section-tag tag-orange" style={{ display: 'inline-flex' }}>Pricing</div>
            <h2 className="section-title">Simple. Transparent.<br />No surprises.</h2>
            <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Pay only for what you use. Start free, scale as you grow.</p>
          </div>
          <div className="pricing-grid reveal">

            <div className="price-card">
              <div className="price-name">Free</div>
              <div className="price-amount">₹0 <span className="price-unit">/ month</span></div>
              <div className="price-note">Up to 100 conversations/month</div>
              <div className="price-features">
                <div className="pf-row"><span className="pf-check">✓</span> 1 website URL training</div>
                <div className="pf-row"><span className="pf-check">✓</span> WhatsApp QR connection</div>
                <div className="pf-row"><span className="pf-check">✓</span> Basic analytics</div>
                <div className="pf-row"><span className="pf-x">✗</span> <span style={{ color: 'var(--text3)' }}>Bulk campaigns</span></div>
                <div className="pf-row"><span className="pf-x">✗</span> <span style={{ color: 'var(--text3)' }}>Integrations</span></div>
              </div>
              <Link href="/signup" className="price-btn price-btn-ghost" style={{display: 'inline-block', textAlign: 'center', textDecoration: 'none', width: '100%', boxSizing: 'border-box'}}>Get started free</Link>
            </div>

            <div className="price-card featured">
              <div className="price-popular">MOST POPULAR</div>
              <div className="price-name">Starter</div>
              <div className="price-amount">₹7 <span className="price-unit">/ conversation</span></div>
              <div className="price-note">+ ₹1,200/month for WhatsApp API</div>
              <div className="price-features">
                <div className="pf-row"><span className="pf-check">✓</span> Unlimited training sources</div>
                <div className="pf-row"><span className="pf-check">✓</span> Official WhatsApp API</div>
                <div className="pf-row"><span className="pf-check">✓</span> Bulk campaigns</div>
                <div className="pf-row"><span className="pf-check">✓</span> Shopify + CRM integrations</div>
                <div className="pf-row"><span className="pf-check">✓</span> 3 team members</div>
                <div className="pf-row"><span className="pf-check">✓</span> Priority support</div>
              </div>
              <Link href="/signup" className="price-btn price-btn-primary" style={{display: 'inline-block', textAlign: 'center', textDecoration: 'none', width: '100%', boxSizing: 'border-box'}}>Start for free →</Link>
            </div>

            <div className="price-card">
              <div className="price-name">Pro</div>
              <div className="price-amount">₹5 <span className="price-unit">/ conversation</span></div>
              <div className="price-note">For 2,000+ conversations/month</div>
              <div className="price-features">
                <div className="pf-row"><span className="pf-check">✓</span> Everything in Starter</div>
                <div className="pf-row"><span className="pf-check">✓</span> Custom AI personality</div>
                <div className="pf-row"><span className="pf-check">✓</span> Unlimited team members</div>
                <div className="pf-row"><span className="pf-check">✓</span> Advanced analytics</div>
                <div className="pf-row"><span className="pf-check">✓</span> Dedicated account manager</div>
                <div className="pf-row"><span className="pf-check">✓</span> SLA + uptime guarantee</div>
              </div>
              <Link href="/signup" className="price-btn price-btn-ghost" style={{display: 'inline-block', textAlign: 'center', textDecoration: 'none', width: '100%', boxSizing: 'border-box'}}>Talk to sales</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════ */}
      <section id="cta">
        <div className="container">
          <div className="cta-box reveal">
            <span className="cta-emoji">🚀</span>
            <div className="cta-title">Your AI is waiting.<br />Go live in 5 minutes.</div>
            <div className="cta-sub">Paste your website URL. Connect WhatsApp. Watch AI handle every customer query — while you sleep.</div>
            <div className="cta-form">
              <input className="cta-input" type="email" placeholder="Enter your business email" />
              <Link href="/signup" className="cta-submit" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}>Start free →</Link>
            </div>
            <div className="cta-promise">✓ No credit card &nbsp;&nbsp;✓ <span>100 free conversations</span> &nbsp;&nbsp;✓ Cancel anytime</div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════ */}
      <footer>
        <div className="footer-logo">use<span>AI</span></div>
        <div className="footer-links">
          <Link href="#">Product</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Blog</Link>
          <Link href="#">Docs</Link>
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
        </div>
        <div className="footer-copy">© 2026 useAI. Built with ❤️ for Indian businesses.</div>
      </footer>
    </>
  );
}
