export default function LiveDemo() {
    return (
        <section id="demo">
            <div className="wrap">
                <div className="demo-layout">
                    <div className="demo-left reveal">
                        <span className="section-label" style={{ color: 'rgba(255,255,255,.3)' }}>Live demo</span>
                        <h2 className="demo-h2">Watch AI handle a<br /><em>real conversation</em></h2>
                        <p className="demo-p">Customer asks in Hindi, AI replies with accurate product info in 1.6 seconds. No human involved. This is a real exchange.</p>
                        <div className="demo-stats">
                            <div className="ds-item">
                                <span className="ds-val acc">1.6s</span>
                                <div className="ds-label">Response time</div>
                            </div>
                            <div className="ds-item">
                                <span className="ds-val">94%</span>
                                <div className="ds-label">Confidence</div>
                            </div>
                            <div className="ds-item">
                                <span className="ds-val acc">₹0</span>
                                <div className="ds-label">Human cost</div>
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="phone reveal" id="phone">
                        <div className="phone-notch"></div>
                        <div className="wa-top">
                            <div className="wa-av">🛋️</div>
                            <div>
                                <div className="wa-nm">Sharma Furniture</div>
                                <div className="wa-st">🤖 Powered by useAI</div>
                            </div>
                        </div>
                        <div className="wa-msgs">
                            <div className="wm i">
                                <div className="wm-b">Hi! Red sofa ka price? 😊</div>
                                <div className="wm-t">2:41 PM</div>
                            </div>
                            <div className="wm o">
                                <div className="wm-tag">🤖 useAI · 96% confident</div>
                                <div className="wm-b">Namaste! 😊 Red Oslo Sofa ₹12,499 — stock mein hai! Free delivery ₹5,000+ pe. Book karein? 🚚</div>
                                <div className="wm-t">2:41 PM · 1.6s ⚡</div>
                            </div>
                            <div className="wm i">
                                <div className="wm-b">Saturday morning milegi?</div>
                                <div className="wm-t">2:42 PM</div>
                            </div>
                            <div className="wm o">
                                <div className="wm-tag">🤖 useAI · 94% confident</div>
                                <div className="wm-b">Bilkul! 🎉 Saturday 10 AM–1 PM available hai. Naam aur address share karein?</div>
                                <div className="wm-t">2:42 PM · 1.8s ⚡</div>
                            </div>
                            <div className="wm-typing">
                                <div className="wt"></div><div className="wt"></div><div className="wt"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
