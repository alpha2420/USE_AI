'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CTA() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailRegex = /^\\S+@\\S+\\.\\S+$/;
        if (!emailRegex.test(email)) return;

        setIsSubmitting(true);
        localStorage.setItem('useai_lead_email', email);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 800);
    };

    return (
        <section id="cta">
            <div className="wrap">
                <div className="cta-box reveal">
                    <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>Get started</span>
                    <h2 className="section-h2" style={{ textAlign: 'center', marginBottom: '16px' }}>Go live in <em>5 minutes.</em></h2>
                    <p className="cta-p">Paste your URL. Connect WhatsApp. Watch AI reply to every customer query while you focus on growing your business.</p>

                    {isSubmitted ? (
                        <div style={{ background: '#Edfaf3', border: '1px solid #A7F3D0', color: '#047857', padding: '16px', borderRadius: '12px', maxWidth: '450px', margin: '0 auto 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontWeight: 600 }}>✅ Check your inbox! We sent you a link to get started.</div>
                            <button onClick={() => router.push(`/signup?email=${encodeURIComponent(email)}`)} style={{ background: 'none', border: 'none', color: '#047857', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--sans)' }}>
                                Or sign up directly →
                            </button>
                        </div>
                    ) : (
                        <form className="cta-form" onSubmit={handleSubmit}>
                            <input
                                className="cta-input"
                                type="email"
                                placeholder="your@business.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button className="cta-btn" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? '...' : 'Start free →'}
                            </button>
                        </form>
                    )}

                    {!isSubmitted && (
                        <div className="cta-notes">
                            <div className="cn"><span className="cn-check">✓</span> No credit card</div>
                            <div className="cn"><span className="cn-check">✓</span> 100 free conversations</div>
                            <div className="cn"><span className="cn-check">✓</span> Cancel anytime</div>
                            <div className="cn"><span className="cn-check">✓</span> 5-minute setup</div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
