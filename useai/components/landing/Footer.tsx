import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <div className="wrap">
                <div className="ft-top">
                    <div>
                        <div className="ft-logo">use<span>AI</span></div>
                        <div className="ft-tagline">
                            We build AI agents for Indian businesses that actually work, drive revenue, and don&apos;t feel like robots.
                        </div>
                    </div>
                    <div className="ft-cols">
                        <div className="ft-col">
                            <div className="ft-col-title">PRODUCT</div>
                            <Link href="#features">Features</Link>
                            <Link href="#how">How it works</Link>
                            <Link href="#demo">Live Demo</Link>
                            <Link href="#pricing">Pricing</Link>
                        </div>
                        <div className="ft-col">
                            <div className="ft-col-title">RESOURCES</div>
                            <a href="#">Help Center</a>
                            <a href="#">API Documentation</a>
                            <a href="#">Case Studies</a>
                            <a href="#">Blog</a>
                        </div>
                        <div className="ft-col">
                            <div className="ft-col-title">COMPANY</div>
                            <a href="#">About us</a>
                            <a href="#">Careers</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
                <div className="ft-bottom">
                    <div className="ft-copy">© 2024 useAI Technologies Inc. All rights reserved.</div>
                    <div className="ft-copy">Built for India 🇮🇳</div>
                </div>
            </div>
        </footer>
    );
}
