'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav id="nav">
            <Link href="/" className="nav-logo">
                <div className="nav-dot"></div>
                useAI
            </Link>
            <div className="nav-links">
                <Link href="#how">How it works</Link>
                <Link href="#features">Features</Link>
                <Link href="#demo">Demo</Link>
                <Link href="#testimonials">Reviews</Link>
                <Link href="#pricing">Pricing</Link>
            </div>
            <div className="nav-right">
                <Link href="/login" style={{ textDecoration: 'none' }}>
                    <button className="btn-ghost">Sign in</button>
                </Link>
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary">Get started free →</button>
                </Link>
            </div>
        </nav>
    );
}
