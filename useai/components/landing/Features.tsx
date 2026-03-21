export default function Features() {
    return (
        <section id="features" style={{ padding: '100px 0', background: 'var(--bg)' }}>
            <div className="wrap">
                <div className="feat-header reveal">
                    <span className="section-label">Features</span>
                    <h2 className="section-h2">Everything you need.<br />Nothing you don&apos;t.</h2>
                </div>
                <div className="bento">

                    {/* Big card */}
                    <div className="bn b-lg bn-dark reveal" style={{ transitionDelay: '.05s' }}>
                        <span className="bn-icon">🧠</span>
                        <div className="bn-title">Real AI — not button flows</div>
                        <div className="bn-desc" style={{ marginBottom: '18px' }}>Powered by GPT-4o + RAG. Reads context, understands intent, gives accurate answers. Every single time.</div>
                        <div className="conf-wrap">
                            <div className="conf-row"><span>Answer confidence</span><span>96%</span></div>
                            <div className="conf-track"><div className="conf-fill"></div></div>
                        </div>
                        <div className="bn-num counter" data-v="96" data-s="%">0</div>
                        <div className="bn-num-label" style={{ color: 'rgba(255,255,255,.3)' }}>average answer accuracy</div>
                        <div className="bn-bars" style={{ marginTop: '16px' }}>
                            <div className="bb" style={{ height: '28%' }}></div>
                            <div className="bb" style={{ height: '44%' }}></div>
                            <div className="bb" style={{ height: '60%' }}></div>
                            <div className="bb" style={{ height: '50%' }}></div>
                            <div className="bb" style={{ height: '72%' }}></div>
                            <div className="bb" style={{ height: '62%' }}></div>
                            <div className="bb" style={{ height: '84%' }}></div>
                            <div className="bb" style={{ height: '72%' }}></div>
                            <div className="bb" style={{ height: '100%' }}></div>
                        </div>
                    </div>

                    {/* Speed */}
                    <div className="bn b-md bn-tint reveal" style={{ transitionDelay: '.1s' }}>
                        <span className="bn-icon">⚡</span>
                        <div className="bn-title">1.8s average reply</div>
                        <div className="bn-desc">Even at 3 AM on a Sunday. Customers never wait.</div>
                        <div className="speed-wrap">
                            <div className="s-ring">
                                <svg viewBox="0 0 68 68">
                                    <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(232,66,10,.12)" strokeWidth="6" />
                                    <circle cx="34" cy="34" r="28" fill="none" stroke="#e8420a" strokeWidth="6"
                                        strokeDasharray="176" strokeDashoffset="28" strokeLinecap="round"
                                        transform="rotate(-90 34 34)" />
                                </svg>
                                <div className="s-ring-inner">
                                    <div className="s-rv">1.8s</div>
                                    <div className="s-rl">avg</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: 1.5 }}>vs 4+ hours with manual replies</div>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="bn b-sm bn-white reveal" style={{ transitionDelay: '.15s' }}>
                        <span className="bn-icon">🌍</span>
                        <div className="bn-title">14 Languages</div>
                        <div className="bn-desc">Auto-detects and replies in the customer&apos;s own language.</div>
                        <div className="lang-chips">
                            <span className="lc">🇮🇳 Hindi</span>
                            <span className="lc">Tamil</span>
                            <span className="lc">Bengali</span>
                            <span className="lc">English</span>
                            <span className="lc">Marathi</span>
                            <span className="lc">+9 more</span>
                        </div>
                    </div>

                    {/* Campaigns */}
                    <div className="bn b-sm bn-white reveal" style={{ transitionDelay: '.2s' }}>
                        <span className="bn-icon">📣</span>
                        <div className="bn-title">Bulk Campaigns</div>
                        <div className="bn-desc">Broadcast Diwali offers, restock alerts. AI handles every reply.</div>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                            <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: '9px', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
                                <span>Holi Sale 🎨</span><span style={{ color: '#16a34a' }}>73% read</span>
                            </div>
                            <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: '9px', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
                                <span>New Arrivals ✨</span><span style={{ color: '#16a34a' }}>65% read</span>
                            </div>
                        </div>
                    </div>

                    {/* Integrations */}
                    <div className="bn b-w7 bn-white reveal" style={{ transitionDelay: '.25s' }}>
                        <span className="bn-icon">🔗</span>
                        <div className="bn-title">Plug into your existing stack</div>
                        <div className="bn-desc">Connect your store, CRM, and calendar. AI knows live inventory, order status, and availability in real time.</div>
                        <div className="integ-row">
                            <div className="ic">🛍 Shopify</div>
                            <div className="ic">🔌 WooCommerce</div>
                            <div className="ic">📊 Zoho CRM</div>
                            <div className="ic">📅 Google Calendar</div>
                            <div className="ic">💳 Razorpay</div>
                        </div>
                    </div>

                    {/* Pay per use */}
                    <div className="bn b-sm bn-tint reveal" style={{ transitionDelay: '.3s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <span className="bn-icon">💸</span>
                            <div className="bn-title">Pay only when it works</div>
                            <div className="bn-desc">No monthly fees to start. Only pay per conversation handled.</div>
                        </div>
                        <div className="bn-num">₹7</div>
                        <div className="bn-num-label">per conversation</div>
                    </div>

                </div>
            </div>
        </section>
    );
}
