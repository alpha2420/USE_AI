'use client';

import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import LiveDemo from '@/components/landing/LiveDemo';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import ClientLogic from '@/components/landing/ClientLogic';

export default function Home() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "919876543210";
    const message = encodeURIComponent("Hi! I'm interested in useAI for my business.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <>
      <ClientLogic />
      <Navbar />
      <main>
        <Hero />

        {/* Ticker Under Hero */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="ticker-item"><strong>96%</strong> Avg Accuracy</div>
                <div className="t-dot">❖</div>
                <div className="ticker-item"><strong>1.8s</strong> Response Time</div>
                <div className="t-dot">❖</div>
                <div className="ticker-item"><strong>30%</strong> Higher Conversion</div>
                <div className="t-dot">❖</div>
                <div className="ticker-item"><strong>24/7</strong> Availability</div>
                <div className="t-dot">❖</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Band */}
        <section className="stats-band">
          <div className="wrap">
            <div className="stat-col reveal">
              <span className="stat-n counter" data-v="2000" data-s="+">0</span>
              <span className="stat-l">businesses live</span>
            </div>
            <div className="stat-col reveal">
              <span className="stat-n counter" data-v="4" data-s="M+">0</span>
              <span className="stat-l">chats automated</span>
            </div>
            <div className="stat-col reveal">
              <span className="stat-n acc counter" data-v="96" data-s="%">0</span>
              <span className="stat-l">resolution rate</span>
            </div>
            <div className="stat-col reveal">
              <span className="stat-n counter" data-v="14" data-s="">0</span>
              <span className="stat-l">languages supported</span>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Features />
        <LiveDemo />
        <Testimonials />

        {/* Marquee */}
        <div className="mq-wrap">
          <div className="mq-track">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <div className="mq-item accent"><div className="mq-dot"></div>E-commerce</div>
                <div className="mq-item"><div className="mq-dot"></div>Real Estate</div>
                <div className="mq-item"><div className="mq-dot"></div>Education</div>
                <div className="mq-item accent"><div className="mq-dot"></div>Restaurants</div>
                <div className="mq-item"><div className="mq-dot"></div>Healthcare</div>
                <div className="mq-item"><div className="mq-dot"></div>Travel</div>
                <div className="mq-item accent"><div className="mq-dot"></div>Retail</div>
                <div className="mq-item"><div className="mq-dot"></div>Automotive</div>
              </div>
            ))}
          </div>
        </div>

        <Pricing />
        <CTA />
      </main>

      {/* WA Float */}
      <div className="wa-fab" onClick={handleWhatsAppClick}>
        <svg fill="#fff" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
          <path d="M11.99 2C6.47 2 2 6.48 2 12c0 2.16.69 4.15 1.84 5.79L2 22l4.31-1.8c1.61.99 3.51 1.57 5.54 1.57 5.52 0 10-4.48 10-10S17.51 2 11.99 2zm0 18.06c-1.82 0-3.52-.51-4.99-1.4l-.36-.21-3.13 1.3 1.33-3.05-.23-.37C3.59 14.86 3 13.48 3 12c0-4.96 4.04-9 9-9s9 4.04 9-9 9-4.04 9-9 9z" />
          <path d="M16.6 14.39c-.25-.13-1.46-.72-1.68-.81-.23-.08-.39-.13-.56.13-.17.25-.63.81-.78.97-.14.17-.29.19-.54.06-1.02-.52-2.31-1.44-3.04-2.52-.14-.21.05-.2.27-.63.1-.19.23-.41.34-.61.11-.2.06-.39-.01-.52-.08-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.46.06-.7.33-.23.26-.89.87-.89 2.12 0 1.25.91 2.45 1.04 2.63.13.17 1.8 2.74 4.35 3.84.6.26 1.08.42 1.45.54.61.2 1.16.17 1.6.11.49-.07 1.46-.6 1.66-1.18.21-.57.21-1.06.14-1.18-.06-.12-.23-.2-.48-.32z" />
        </svg>
        <div className="wa-tip">Chat with us</div>
      </div>

      <Footer />
    </>
  );
}
