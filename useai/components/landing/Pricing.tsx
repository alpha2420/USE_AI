'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Pricing() {
    const router = useRouter();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Contact State Form Layer
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("We'll contact you within 24 hours! 📞");
        setIsContactModalOpen(false);
        // Clear
        setName(''); setEmail(''); setPhone(''); setMessage('');
    };

    return (
        <section id="pricing">
            <div className="wrap">
                <div className="pricing-head reveal">
                    <span className="section-label">Pricing</span>
                    <h2 className="section-h2">Simple. Transparent.<br /><em>No surprises.</em></h2>
                    <p className="section-sub" style={{ margin: '0 auto' }}>Pay only for what you use. Start free, scale as you grow.</p>
                </div>
                <div className="pricing-grid">
                    <div className="pc pc-free reveal">
                        <div className="pc-plan">Free</div>
                        <div className="pc-price"><sup>₹</sup>0</div>
                        <div className="pc-per">forever free</div>
                        <div className="pc-note">Up to 100 conversations/month</div>
                        <div className="pc-hr"></div>
                        <div className="pc-feats">
                            <div className="pf"><span className="pf-y">✓</span> 1 website URL training</div>
                            <div className="pf"><span className="pf-y">✓</span> WhatsApp QR connection</div>
                            <div className="pf"><span className="pf-y">✓</span> Basic analytics</div>
                            <div className="pf"><span className="pf-y">✓</span> 1 team member</div>
                            <div className="pf"><span className="pf-n">✗</span> Bulk campaigns</div>
                            <div className="pf"><span className="pf-n">✗</span> Integrations</div>
                        </div>
                        <button className="pc-btn pc-btn-ghost" onClick={() => router.push('/signup?plan=free')}>Get started free</button>
                    </div>

                    <div className="pc pc-starter reveal" style={{ transitionDelay: '.08s' }}>
                        <div className="pc-badge">MOST POPULAR</div>
                        <div className="pc-plan">Starter</div>
                        <div className="pc-price"><sup>₹</sup>7</div>
                        <div className="pc-per">per conversation</div>
                        <div className="pc-note">+ ₹1,200 / month for WhatsApp API</div>
                        <div className="pc-hr"></div>
                        <div className="pc-feats">
                            <div className="pf"><span className="pf-y">✓</span> Unlimited training sources</div>
                            <div className="pf"><span className="pf-y">✓</span> Official WhatsApp Business API</div>
                            <div className="pf"><span className="pf-y">✓</span> Bulk campaigns</div>
                            <div className="pf"><span className="pf-y">✓</span> Shopify + CRM integrations</div>
                            <div className="pf"><span className="pf-y">✓</span> 3 team members</div>
                            <div className="pf"><span className="pf-y">✓</span> Priority support</div>
                        </div>
                        <button className="pc-btn pc-btn-accent" onClick={() => router.push('/signup?plan=starter')}>Start for free →</button>
                    </div>

                    <div className="pc pc-pro reveal" style={{ transitionDelay: '.16s' }}>
                        <div className="pc-plan">Pro</div>
                        <div className="pc-price"><sup>₹</sup>5</div>
                        <div className="pc-per">per conversation</div>
                        <div className="pc-note">For 2,000+ conversations/month</div>
                        <div className="pc-hr"></div>
                        <div className="pc-feats">
                            <div className="pf"><span className="pf-y">✓</span> Everything in Starter</div>
                            <div className="pf"><span className="pf-y">✓</span> Custom AI personality</div>
                            <div className="pf"><span className="pf-y">✓</span> Unlimited team members</div>
                            <div className="pf"><span className="pf-y">✓</span> Advanced analytics</div>
                            <div className="pf"><span className="pf-y">✓</span> Dedicated account manager</div>
                            <div className="pf"><span className="pf-y">✓</span> SLA + uptime guarantee</div>
                        </div>
                        <button className="pc-btn pc-btn-dark" onClick={() => setIsContactModalOpen(true)}>Talk to sales →</button>
                    </div>
                </div>
            </div>

            {/* Contact Sales Form Rendering Node */}
            {isContactModalOpen && (
                <div
                    onClick={() => setIsContactModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '16px', padding: '24px', position: 'relative', margin: '0 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', cursor: 'default' }}
                    >
                        <button
                            onClick={() => setIsContactModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text3)' }}
                        >✕</button>
                        <h3 style={{ fontSize: '20px', fontFamily: 'var(--serif)', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)', letterSpacing: '-0.3px' }}>Talk to sales</h3>
                        <p style={{ fontSize: '14px', color: 'var(--ink3)', marginBottom: '20px' }}>Tell us about your needs and we&apos;ll be in touch.</p>
                        <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" placeholder="Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px', fontFamily: 'var(--sans)', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }} />
                            <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', fontFamily: 'var(--sans)', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }} />
                            <input type="tel" placeholder="Phone" required value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '12px', fontFamily: 'var(--sans)', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none' }} />
                            <textarea placeholder="Tell us about your business" required value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{ padding: '12px', fontFamily: 'var(--sans)', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                            <button type="submit" style={{ background: 'var(--accent)', fontFamily: 'var(--sans)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', marginTop: '8px', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(232,66,10,0.2)' }}>Send message</button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
