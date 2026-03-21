export default function HowItWorks() {
    return (
        <section id="how" style={{ padding: '100px 0', background: 'var(--white)' }}>
            <div className="wrap">
                <div className="how-inner">
                    <div>
                        <div className="reveal">
                            <span className="section-label">How it works</span>
                            <h2 className="section-h2">From URL to live AI<br />in <em>5 minutes</em></h2>
                            <p className="section-sub">No code. No developers. No complex setup. Paste your URL and your AI is live.</p>
                        </div>
                        <div className="how-steps" style={{ marginTop: '40px' }}>
                            <div className="step reveal">
                                <div className="step-num">01</div>
                                <div>
                                    <div className="step-title">Paste your website URL</div>
                                    <div className="step-desc">Our crawler reads every page, product, price and policy on your site — automatically, in under 5 minutes.</div>
                                </div>
                            </div>
                            <div className="step reveal">
                                <div className="step-num">02</div>
                                <div>
                                    <div className="step-title">AI learns your business</div>
                                    <div className="step-desc">GPT-4o reads your content, builds a knowledge base, and is ready to answer any customer question with your exact information.</div>
                                </div>
                            </div>
                            <div className="step reveal">
                                <div className="step-num">03</div>
                                <div>
                                    <div className="step-title">Connect your WhatsApp</div>
                                    <div className="step-desc">Scan a QR code with WhatsApp Business or connect via Meta API. Your AI is now live on your number.</div>
                                </div>
                            </div>
                            <div className="step reveal">
                                <div className="step-num">04</div>
                                <div>
                                    <div className="step-title">Grow while AI handles it all</div>
                                    <div className="step-desc">Every message answered in 1.8 seconds. You&apos;re notified only when a human is truly needed. Sleep well.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Chat demo */}
                    <div className="how-chat reveal" id="how-chat">
                        <div className="hc-top">
                            <div className="hc-av">🛋️</div>
                            <div>
                                <div className="hc-name">Sharma Furniture</div>
                                <div className="hc-status">🤖 Powered by useAI · Online</div>
                            </div>
                        </div>
                        <div className="hc-body">
                            <div className="cm in">
                                <div className="cm-bbl">Hi! Red Oslo sofa ka price kya hai? 😊</div>
                                <div className="cm-meta">2:41 PM</div>
                            </div>
                            <div className="cm out">
                                <div className="cm-tag">🤖 useAI · 96% confident</div>
                                <div className="cm-bbl">Namaste! 😊 Red Oslo Sofa ₹12,499 mein available hai — stock mein hai! Free delivery 3 din mein ₹5,000+ ke orders pe. Delivery book karein? 🚚</div>
                                <div className="cm-meta">2:41 PM · 1.6s ⚡</div>
                            </div>
                            <div className="cm in">
                                <div className="cm-bbl">Yes! Saturday morning milegi?</div>
                                <div className="cm-meta">2:42 PM</div>
                            </div>
                            <div className="cm out">
                                <div className="cm-tag">🤖 useAI · 94% confident</div>
                                <div className="cm-bbl">Bilkul! 🎉 Saturday morning (10 AM–1 PM) available hai. Naam aur address share karein?</div>
                                <div className="cm-meta">2:42 PM · 1.8s ⚡</div>
                            </div>
                            <div className="cm-typing">
                                <div className="ct"></div><div className="ct"></div><div className="ct"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
