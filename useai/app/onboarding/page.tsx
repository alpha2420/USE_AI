'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authAPI, knowledgeAPI, whatsappAPI, dashboardAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import confetti from 'canvas-confetti';

interface KnowledgeSource {
    id: string;
    type: 'url' | 'pdf' | 'manual';
    name: string;
    status: 'processing' | 'active' | 'failed';
}

export default function OnboardingPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    // Router protection
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/signup');
        }
    }, [router]);

    // Global Step State
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data State
    const [stepData, setStepData] = useState({
        businessName: user?.name || '',
        businessType: '',
        phone: '',
        description: '',
        knowledgeSources: [] as KnowledgeSource[],
        whatsappConnection: 'none' as 'api' | 'qr' | 'none'
    });

    useEffect(() => {
        if (user?.name && !stepData.businessName) {
            setStepData(prev => ({ ...prev, businessName: user.name }));
        }
    }, [user]);

    // Step Navigations
    const handleNext = () => window.scrollTo(0, 0);

    // ==========================================
    // STEP 1: Company Info
    // ==========================================
    const [s1Errors, setS1Errors] = useState<{ [key: string]: string }>({});

    const validateStep1 = () => {
        const errs: any = {};
        if (!stepData.businessName.trim()) errs.businessName = 'Required';
        if (!stepData.businessType) errs.businessType = 'Please select a type';
        if (!stepData.phone.trim()) errs.phone = 'Required';
        setS1Errors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleStep1Submit = async () => {
        if (!validateStep1()) return;
        setIsLoading(true);
        try {
            // Assuming PUT /organizations/me exists on dashboardAPI or we mock it for the flow
            // await dashboardAPI.updateOrganization({ ... });

            // Simulate API call for now structure
            await new Promise(resolve => setTimeout(resolve, 800));
            setCurrentStep(2);
            handleNext();
        } catch (err) {
            toast.error('Failed to save details. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // STEP 2: Train AI
    // ==========================================
    const [activeTabS2, setActiveTabS2] = useState<'url' | 'pdf' | 'manual'>('url');

    // URL Tab
    const [urlInput, setUrlInput] = useState('');
    const [isCrawling, setIsCrawling] = useState(false);
    const pollIntervalRefs = useRef<{ [id: string]: NodeJS.Timeout }>({});

    const pollSourceStatus = (id: string, type: 'url' | 'pdf') => {
        const poll = setInterval(async () => {
            try {
                // Assume getStatus endpoint exists. Mocking standard resolution for UX currently.
                // const res = await knowledgeAPI.getStatus(id);

                // Mock Resolution after 4 seconds
                setStepData(prev => ({
                    ...prev,
                    knowledgeSources: prev.knowledgeSources.map(s =>
                        s.id === id ? { ...s, status: 'active' } : s
                    )
                }));
                clearInterval(pollIntervalRefs.current[id]);
                if (type === 'url') {
                    setIsCrawling(false);
                    toast.success('Website crawled successfully! 18 pages found.');
                } else {
                    toast.success('PDF processed successfully!');
                }
            } catch (e) {
                // error boundary
            }
        }, 4000);
        pollIntervalRefs.current[id] = poll;
    };

    const handleAddUrl = async () => {
        if (!urlInput.startsWith('http')) {
            toast.error('Please enter a valid URL starting with http/https');
            return;
        }
        setIsCrawling(true);
        try {
            // Mock API trigger
            // const res = await knowledgeAPI.addUrl(urlInput);
            const fakeId = `url_${Date.now()}`;

            const newSource: KnowledgeSource = {
                id: fakeId,
                type: 'url',
                name: urlInput,
                status: 'processing'
            };

            setStepData(prev => ({
                ...prev,
                knowledgeSources: [...prev.knowledgeSources, newSource]
            }));

            setUrlInput('');
            pollSourceStatus(fakeId, 'url');
        } catch (err) {
            toast.error('Failed to add URL');
            setIsCrawling(false);
        }
    };

    // PDF Tab
    const [isUploading, setIsUploading] = useState(false);
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are accepted');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setIsUploading(true);
        try {
            // const res = await knowledgeAPI.uploadPdf(file);
            const fakeId = `pdf_${Date.now()}`;
            const newSource: KnowledgeSource = {
                id: fakeId,
                type: 'pdf',
                name: file.name,
                status: 'processing'
            };
            setStepData(prev => ({
                ...prev,
                knowledgeSources: [...prev.knowledgeSources, newSource]
            }));
            pollSourceStatus(fakeId, 'pdf');
            toast.success('PDF uploaded, processing data...');
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    // Manual Tab
    const [manualTitle, setManualTitle] = useState('');
    const [manualContent, setManualContent] = useState('');
    const [isAddingManual, setIsAddingManual] = useState(false);

    const handleAddManual = async () => {
        if (!manualTitle.trim() || !manualContent.trim()) {
            toast.error('Title and content are required');
            return;
        }

        setIsAddingManual(true);
        try {
            // await knowledgeAPI.addManual(manualTitle, manualContent);
            const newSource: KnowledgeSource = {
                id: `man_${Date.now()}`,
                type: 'manual',
                name: manualTitle,
                status: 'active' // Manual is instant
            };
            setStepData(prev => ({
                ...prev,
                knowledgeSources: [...prev.knowledgeSources, newSource]
            }));
            setManualTitle('');
            setManualContent('');
            toast.success('Manual knowledge added');
        } catch (err) {
            toast.error('Failed to add manual data');
        } finally {
            setIsAddingManual(false);
        }
    };

    const removeSource = (id: string) => {
        setStepData(prev => ({
            ...prev,
            knowledgeSources: prev.knowledgeSources.filter(s => s.id !== id)
        }));
    };

    const activeSourcesCount = stepData.knowledgeSources.filter(s => s.status === 'active').length;


    // ==========================================
    // STEP 3: Connect WhatsApp
    // ==========================================
    const [activeTabS3, setActiveTabS3] = useState<'qr' | 'api'>('qr');
    const [waPhoneId, setWaPhoneId] = useState('');
    const [waToken, setWaToken] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleApiConnect = async () => {
        if (!waPhoneId.trim() || !waToken.trim()) {
            toast.error('Both fields are required');
            return;
        }
        setIsConnecting(true);
        try {
            // await whatsappAPI.connect(waPhoneId, waToken);
            await new Promise(res => setTimeout(res, 1000));
            setStepData(prev => ({ ...prev, whatsappConnection: 'api' }));
            toast.success('✅ Connected successfully!');
        } catch (err) {
            toast.error('Connection failed Check your tokens.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleQRConnect = () => {
        setStepData(prev => ({ ...prev, whatsappConnection: 'qr' }));
        toast.success('✅ Connected via QR!');
    };

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#00E5A0', '#38BDF8', '#8B5CF6']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#00E5A0', '#38BDF8', '#8B5CF6']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    useEffect(() => {
        if (currentStep === 4) triggerConfetti();
    }, [currentStep]);


    return (
        <div className="onb-layout">
            {/* HEADER */}
            <header className="onb-header">
                <div className="onb-logo">use<span>AI</span></div>
                <div className="onb-progress-container">
                    <div className="onb-progress-bar">
                        <div className="onb-progress-fill" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
                    </div>
                    <div className="onb-steps">
                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className={`onb-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                                <div className="os-circle">{currentStep > step ? '✓' : step}</div>
                                <div className="os-label">
                                    {step === 1 && 'Company'}
                                    {step === 2 && 'Knowledge'}
                                    {step === 3 && 'WhatsApp'}
                                    {step === 4 && 'Go Live'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ width: '80px' }}></div> {/* Spacer */}
            </header>

            {/* BODY CARDS */}
            <main className="onb-main">
                <div className="onb-card">

                    {/* STEP 1 */}
                    {currentStep === 1 && (
                        <div className="onb-step-content animate-fade-in">
                            <div className="osc-header">
                                <h2>Tell us about your business</h2>
                                <p>This helps the AI understand context and sound natural representing you.</p>
                            </div>

                            <div className="osc-form">
                                <div className="form-group">
                                    <label>Business Name</label>
                                    <input
                                        type="text"
                                        value={stepData.businessName}
                                        onChange={e => setStepData({ ...stepData, businessName: e.target.value })}
                                        placeholder="Acme Corp"
                                    />
                                    {s1Errors.businessName && <span className="error-txt">{s1Errors.businessName}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Industry / Type</label>
                                    <select
                                        value={stepData.businessType}
                                        onChange={e => setStepData({ ...stepData, businessType: e.target.value })}
                                    >
                                        <option value="" disabled>Select industry...</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="realestate">Real Estate</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="education">Education</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="travel">Travel</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {s1Errors.businessType && <span className="error-txt">{s1Errors.businessType}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Support Phone Number</label>
                                    <input
                                        type="tel"
                                        value={stepData.phone}
                                        onChange={e => setStepData({ ...stepData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                    {s1Errors.phone && <span className="error-txt">{s1Errors.phone}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Short Description (Optional)</label>
                                    <textarea
                                        value={stepData.description}
                                        onChange={e => setStepData({ ...stepData, description: e.target.value })}
                                        placeholder="We sell premium organic coffee beans across India..."
                                        maxLength={200}
                                        rows={3}
                                    ></textarea>
                                    <div className="char-count">{stepData.description.length}/200</div>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleStep1Submit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Continue to Knowledge Setup →'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                        <div className="onb-step-content animate-fade-in">
                            <div className="osc-header" style={{ marginBottom: '16px' }}>
                                <button className="btn-back" onClick={() => setCurrentStep(1)}>← Back</button>
                                <h2>Train your AI agent</h2>
                                <p>Upload your website, menus, or FAQs. The AI will learn instantly.</p>
                            </div>

                            <div className="tabs-container">
                                <div className="tabs-header">
                                    <button className={`tab-btn ${activeTabS2 === 'url' ? 'active' : ''}`} onClick={() => setActiveTabS2('url')}>🌐 Website URL</button>
                                    <button className={`tab-btn ${activeTabS2 === 'pdf' ? 'active' : ''}`} onClick={() => setActiveTabS2('pdf')}>📄 Upload PDF</button>
                                    <button className={`tab-btn ${activeTabS2 === 'manual' ? 'active' : ''}`} onClick={() => setActiveTabS2('manual')}>✍️ Manual Text</button>
                                </div>

                                <div className="tab-content">
                                    {/* URL */}
                                    {activeTabS2 === 'url' && (
                                        <div className="tc-url">
                                            <div className="input-with-btn">
                                                <input
                                                    type="text"
                                                    placeholder="https://yourwebsite.com"
                                                    value={urlInput}
                                                    onChange={e => setUrlInput(e.target.value)}
                                                    disabled={isCrawling}
                                                />
                                                <button className="btn-secondary" onClick={handleAddUrl} disabled={isCrawling || !urlInput}>
                                                    {isCrawling ? 'Crawling...' : 'Crawl Website'}
                                                </button>
                                            </div>
                                            {isCrawling && <div className="crawling-indicator">✨ Reading your website... scanning pages...</div>}
                                        </div>
                                    )}

                                    {/* PDF */}
                                    {activeTabS2 === 'pdf' && (
                                        <div className="tc-pdf">
                                            <label className="pdf-dropzone">
                                                <input type="file" accept=".pdf" onChange={handlePdfUpload} disabled={isUploading} hidden />
                                                <div className="drop-icon">📄</div>
                                                <div className="drop-text">{isUploading ? 'Uploading...' : 'Click or drag PDF here (Max 10MB)'}</div>
                                            </label>
                                        </div>
                                    )}

                                    {/* Manual */}
                                    {activeTabS2 === 'manual' && (
                                        <div className="tc-manual">
                                            <input
                                                type="text"
                                                placeholder="Snippet Title (e.g. Return Policy)"
                                                value={manualTitle}
                                                onChange={e => setManualTitle(e.target.value)}
                                                className="mb-2"
                                            />
                                            <textarea
                                                placeholder="Enter the exact text you want the AI to memorize..."
                                                rows={4}
                                                value={manualContent}
                                                onChange={e => setManualContent(e.target.value)}
                                                className="mb-2"
                                            ></textarea>
                                            <button className="btn-secondary btn-full" onClick={handleAddManual} disabled={isAddingManual}>
                                                {isAddingManual ? 'Adding...' : 'Add Knowledge Snippet'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Added Sources List */}
                            {stepData.knowledgeSources.length > 0 && (
                                <div className="sources-list-container">
                                    <h4 className="sl-title">Learned Knowledge</h4>
                                    <div className="sources-list">
                                        {stepData.knowledgeSources.map(source => (
                                            <div key={source.id} className="source-item">
                                                <div className="si-icon">
                                                    {source.type === 'url' ? '🌐' : source.type === 'pdf' ? '📄' : '✍️'}
                                                </div>
                                                <div className="si-name">{source.name}</div>
                                                <div className={`si-status ${source.status}`}>
                                                    {source.status === 'processing' ? 'Processing...' : 'Active'}
                                                </div>
                                                <button className="si-delete" onClick={() => removeSource(source.id)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn-primary mt-6"
                                onClick={() => { setCurrentStep(3); handleNext(); }}
                                disabled={activeSourcesCount === 0}
                            >
                                Continue to WhatsApp Connection →
                            </button>
                            {activeSourcesCount === 0 && <div className="btn-hint">Add at least one completed knowledge source to continue.</div>}
                        </div>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                        <div className="onb-step-content animate-fade-in">
                            <div className="osc-header" style={{ marginBottom: '16px' }}>
                                <button className="btn-back" onClick={() => setCurrentStep(2)}>← Back</button>
                                <h2>Connect WhatsApp</h2>
                                <p>Choose how you want to deploy your AI agent.</p>
                            </div>

                            <div className="tabs-container">
                                <div className="tabs-header">
                                    <button className={`tab-btn ${activeTabS3 === 'qr' ? 'active' : ''}`} onClick={() => setActiveTabS3('qr')}>📱 Quick Start (QR)</button>
                                    <button className={`tab-btn ${activeTabS3 === 'api' ? 'active' : ''}`} onClick={() => setActiveTabS3('api')}>⚙️ Official API</button>
                                </div>

                                <div className="tab-content" style={{ padding: '32px' }}>
                                    {activeTabS3 === 'qr' && (
                                        <div className="tc-qr">
                                            <div className="qr-placeholder">
                                                {stepData.whatsappConnection === 'qr' ? '✅ Connected!' : <><div className="qr-icon">📱</div><p>QR Code loads here</p></>}
                                            </div>
                                            <div className="qr-instructions">
                                                <ol>
                                                    <li>Open WhatsApp Business app</li>
                                                    <li>Tap the <strong>3 dots</strong> or <strong>Settings</strong></li>
                                                    <li>Select <strong>Linked Devices</strong></li>
                                                    <li>Tap <strong>Link a Device</strong> and scan this code</li>
                                                </ol>
                                            </div>
                                            <button
                                                className={`btn-secondary btn-full ${stepData.whatsappConnection === 'qr' ? 'success' : ''}`}
                                                onClick={handleQRConnect}
                                                disabled={stepData.whatsappConnection === 'qr'}
                                            >
                                                {stepData.whatsappConnection === 'qr' ? 'Connection Verified' : "I've scanned — test connection"}
                                            </button>
                                        </div>
                                    )}

                                    {activeTabS3 === 'api' && (
                                        <div className="tc-api">
                                            <div className="api-guide">
                                                <h4>Getting your API credentials:</h4>
                                                <ul>
                                                    <li>1. Create an APP at <a href="https://developers.facebook.com" target="_blank">developers.facebook.com</a></li>
                                                    <li>2. Add WhatsApp product to your app</li>
                                                    <li>3. Copy Phone Number ID & Generate Permanent Token</li>
                                                </ul>
                                            </div>

                                            <div className="form-group mb-2">
                                                <label>Phone Number ID</label>
                                                <input type="text" value={waPhoneId} onChange={e => setWaPhoneId(e.target.value)} disabled={stepData.whatsappConnection === 'api'} />
                                            </div>
                                            <div className="form-group mb-4">
                                                <label>Permanent Access Token</label>
                                                <input type="password" value={waToken} onChange={e => setWaToken(e.target.value)} disabled={stepData.whatsappConnection === 'api'} />
                                            </div>

                                            <button
                                                className={`btn-secondary btn-full ${stepData.whatsappConnection === 'api' ? 'success' : ''}`}
                                                onClick={handleApiConnect}
                                                disabled={stepData.whatsappConnection === 'api' || isConnecting}
                                            >
                                                {isConnecting ? 'Verifying...' : stepData.whatsappConnection === 'api' ? '✅ Connected to API' : 'Connect API'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                className="btn-primary mt-6"
                                onClick={() => { setCurrentStep(4); handleNext(); }}
                                disabled={stepData.whatsappConnection === 'none'}
                            >
                                Deploy AI Agent ✨
                            </button>
                            {stepData.whatsappConnection === 'none' && <div className="btn-hint text-center">Please connect a WhatsApp method to deploy your agent.</div>}
                        </div>
                    )}

                    {/* STEP 4 */}
                    {currentStep === 4 && (
                        <div className="onb-step-content text-center animate-fade-in py-12">
                            <div className="success-icon">🎉</div>
                            <h2 className="mb-2" style={{ fontFamily: 'var(--fd)', fontSize: '32px' }}>Your AI is Live!</h2>
                            <p className="mb-8" style={{ color: 'var(--text3)' }}>Your business is now fully automated on WhatsApp.</p>

                            <div className="summary-card">
                                <div className="sc-item">
                                    <div className="sc-icon">🧠</div>
                                    <div className="sc-text">Trained on <strong>{activeSourcesCount} data sources</strong></div>
                                    <div className="sc-check">✅</div>
                                </div>
                                <div className="sc-item">
                                    <div className="sc-icon">📱</div>
                                    <div className="sc-text">WhatsApp <strong>Connected ({stepData.whatsappConnection.toUpperCase()})</strong></div>
                                    <div className="sc-check">✅</div>
                                </div>
                                <div className="sc-item">
                                    <div className="sc-icon">⚡</div>
                                    <div className="sc-text">AI Engine <strong>Active & Listening</strong></div>
                                    <div className="sc-check">✅</div>
                                </div>
                            </div>

                            <div className="test-agent-zone">
                                <p style={{ fontWeight: 600, marginBottom: '12px' }}>Test your agent right now:</p>
                                <div className="taz-flex">
                                    <div className="taz-qr">QR</div>
                                    <div className="taz-info">
                                        Scan the code or message <strong>+91 XXXXX XXXXX</strong> to test your setup natively.
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn-primary btn-full mt-6"
                                style={{ fontSize: '16px', padding: '16px' }}
                                onClick={() => router.push('/dashboard')}
                            >
                                Open Dashboard →
                            </button>
                            <div className="mt-4 text-sm" style={{ color: 'var(--text3)' }}>
                                You can add more knowledge sources later in settings.
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <style jsx global>{`
        /* Global Overrides just for Onboarding Layout */
        body { background: #f9fafb; }
        
        .onb-layout { min-height: 100vh; display: flex; flex-direction: column; }
        
        .onb-header {
          background: #0D1117;
          color: white;
          padding: 0 40px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .onb-logo { font-family: var(--fd); font-size: 20px; font-weight: 800; cursor: pointer; }
        .onb-logo span { background: linear-gradient(135deg, var(--or), var(--or3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .onb-progress-container { width: 400px; max-width: 40%; }
        
        .onb-progress-bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .onb-progress-fill {
          height: 100%;
          background: var(--or);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .onb-steps {
          display: flex;
          justify-content: space-between;
        }
        
        .onb-step {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.4;
          transition: all 0.3s;
        }
        
        .onb-step.active, .onb-step.completed { opacity: 1; }
        
        .os-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .onb-step.active .os-circle { background: var(--or); color: white; }
        .onb-step.completed .os-circle { background: #00E5A0; color: #0D1117; }
        
        .os-label { font-size: 12px; font-weight: 500; display: none; }
        .onb-step.active .os-label { display: block; }
        
        @media (min-width: 900px) {
           .os-label { display: block; }
        }
        
        .onb-main {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 60px 20px;
        }
        
        .onb-card {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
          padding: 40px;
          position: relative;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .btn-back {
          background: none;
          border: none;
          color: var(--text3);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 16px;
          padding: 0;
        }
        .btn-back:hover { color: var(--text); }
        
        .osc-header h2 {
          font-family: var(--fd);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text);
          margin-bottom: 8px;
        }
        
        .osc-header p {
          color: var(--text2);
          font-size: 15px;
          line-height: 1.5;
        }
        
        .osc-form { display: flex; flex-direction: column; gap: 20px; margin-top: 32px; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 600; color: var(--text2); }
        
        input[type="text"], input[type="tel"], input[type="password"], select, textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.1);
          font-family: var(--fb);
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }
        
        input:focus, select:focus, textarea:focus { border-color: var(--or); box-shadow: 0 0 0 3px rgba(255,69,0,0.1); }
        
        .error-txt { color: rgb(239, 68, 68); font-size: 13px; margin-top: -4px; }
        .char-count { font-size: 12px; color: var(--text3); text-align: right; margin-top: -4px; }
        
        /* Buttons */
        .btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--or), var(--or2));
          color: white;
          border: none;
          font-family: var(--fb);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(255,69,0,0.2);
        }
        
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,69,0,0.3); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-secondary {
          padding: 12px 20px;
          border-radius: 10px;
          background: rgba(0,0,0,0.04);
          color: var(--text);
          border: 1px solid rgba(0,0,0,0.08);
          font-family: var(--fb);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover:not(:disabled) { background: rgba(0,0,0,0.08); }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary.success { background: #Edfaf3; color: #047857; border-color: #A7F3D0; }
        .btn-full { width: 100%; }
        
        .mt-6 { margin-top: 24px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .py-12 { padding-top: 48px; padding-bottom: 48px; }
        .text-center { text-align: center; }
        .text-sm { font-size: 14px; }
        
        /* Tabs */
        .tabs-header { display: flex; gap: 8px; border-bottom: 1px solid rgba(0,0,0,0.1); margin-bottom: 24px; padding-bottom: 12px; margin-top: 24px; }
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 10px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text3);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .tab-btn:hover { background: rgba(0,0,0,0.03); }
        .tab-btn.active { background: #f0fdf4; color: #166534; }
        
        /* URLs */
        .input-with-btn { display: flex; gap: 8px; }
        .input-with-btn input { flex: 1; }
        .crawling-indicator { font-size: 13px; color: var(--or); margin-top: 12px; font-weight: 500; animation: pulse 2s infinite; }
        
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        
        /* PDF */
        .pdf-dropzone {
          border: 2px dashed rgba(0,0,0,0.15);
          border-radius: 16px;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }
        .pdf-dropzone:hover { border-color: var(--or); background: #fff5f2; }
        .drop-icon { font-size: 32px; }
        .drop-text { font-weight: 600; color: var(--text2); }
        
        /* Sources List */
        .sources-list-container { margin-top: 32px; }
        .sources-list-container .sl-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .sources-list { display: flex; flex-direction: column; gap: 8px; }
        .source-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
        }
        
        .si-icon { font-size: 18px; }
        .si-name { flex: 1; font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .si-status { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
        .si-status.processing { background: #FEF3C7; color: #92400E; }
        .si-status.active { background: #D1FAE5; color: #065F46; }
        .si-delete { background: none; border: none; font-size: 14px; color: var(--text3); cursor: pointer; padding: 4px; }
        .si-delete:hover { color: red; }
        
        .btn-hint { font-size: 13px; color: var(--text3); text-align: center; margin-top: 12px; }
        
        /* Connect WhatsApp */
        .qr-placeholder { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; width: 220px; height: 220px; margin: 0 auto 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-weight: 600; color: var(--text3); }
        .qr-icon { font-size: 32px; }
        .qr-instructions ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: var(--text2); margin-bottom: 24px; }
        
        .api-guide { background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
        .api-guide h4 { color: #1e40af; font-size: 14px; margin-bottom: 8px; }
        .api-guide ul { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #1e3a8a; list-style: none; padding: 0; margin: 0; }
        .api-guide a { color: #2563eb; text-decoration: underline; }
        
        /* Success Screen */
        .success-icon { font-size: 64px; margin-bottom: 16px; animation: bounceBounce 2s; }
        @keyframes bounceBounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
        
        .summary-card { background: rgba(0,0,0,0.03); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; text-align: left; }
        .sc-item { display: flex; align-items: center; gap: 12px; }
        .sc-icon { width: 32px; height: 32px; border-radius: 10px; background: white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .sc-text { flex: 1; font-size: 14px; color: var(--text2); }
        
        .test-agent-zone { border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 16px; text-align: left; }
        .taz-flex { display: flex; align-items: center; gap: 16px; }
        .taz-qr { width: 50px; height: 50px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #555; }
        .taz-info { flex: 1; font-size: 14px; color: var(--text2); line-height: 1.5; }
        
        @media (max-width: 768px) {
          .onb-header { padding: 0 20px; }
          .onb-progress-container { width: auto; max-width: 50%; }
          .onb-main { padding: 20px; }
          .onb-card { padding: 24px; }
          .input-with-btn { flex-direction: column; }
        }
      `}</style>
        </div>
    );
}
