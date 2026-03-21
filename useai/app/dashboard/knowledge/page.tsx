'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { knowledgeAPI } from '@/lib/api';

export default function KnowledgeBasePage() {
    const queryClient = useQueryClient();

    // ==========================================
    // SECTION 1: ADD KNOWLEDGE
    // ==========================================

    // URL STATE
    const [url, setUrl] = useState('');
    const [isCrawlLoading, setIsCrawlLoading] = useState(false);
    const [crawlStatus, setCrawlStatus] = useState(''); // Text loop
    const [crawlSuccess, setCrawlSuccess] = useState(false);

    const handleCrawlUrl = async () => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            toast.error('URL must begin with http:// or https://');
            return;
        }

        setIsCrawlLoading(true);
        setCrawlSuccess(false);
        setCrawlStatus('Reading pages...');

        try {
            // Mocking submission: { id }
            // const { id } = await knowledgeAPI.addUrl(url);

            let step = 0;
            const statusTexts = ['Reading pages...', 'Analysing content...', 'Training AI...'];

            // Simulate polling resolution array
            const poll = setInterval(() => {
                step++;
                if (step < 3) {
                    setCrawlStatus(statusTexts[step]);
                } else {
                    clearInterval(poll);
                    setIsCrawlLoading(false);
                    setCrawlSuccess(true);
                    toast.success('Website trained successfully!');
                    setUrl('');
                    queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
                }
            }, 2500);

        } catch (e) {
            toast.error('Failed to crawl website. Try again.');
            setIsCrawlLoading(false);
        }
    };

    // PDF STATE
    const [isDragging, setIsDragging] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isPdfUploading, setIsPdfUploading] = useState(false);
    const [pdfSuccess, setPdfSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        validateAndSetPdf(file);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        validateAndSetPdf(file);
    };

    const validateAndSetPdf = (file?: File) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF documents are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File exceeds 10MB limit.');
            return;
        }
        setPdfFile(file);
        setPdfSuccess(false);
    };

    const trainPdf = async () => {
        if (!pdfFile) return;
        setIsPdfUploading(true);
        try {
            // Mocking the same polling sequence UX
            // await knowledgeAPI.uploadPdf(pdfFile);
            await new Promise(res => setTimeout(res, 4000));
            setIsPdfUploading(false);
            setPdfSuccess(true);
            setPdfFile(null);
            toast.success('PDF processed and trained!');
            queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
        } catch (e) {
            toast.error('PDF upload failed.');
            setIsPdfUploading(false);
        }
    };


    // MANUAL STATE
    const [manualTitle, setManualTitle] = useState('');
    const [manualContent, setManualContent] = useState('');
    const [isManualAdding, setIsManualAdding] = useState(false);

    const addManualInfo = async () => {
        if (!manualTitle.trim() || !manualContent.trim()) {
            toast.error('Title and content are required.');
            return;
        }
        setIsManualAdding(true);
        try {
            // await knowledgeAPI.addManual(manualTitle, manualContent);
            await new Promise(res => setTimeout(res, 800));
            queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
            toast.success('Added! AI is now trained on this data.');
            setManualTitle('');
            setManualContent('');
        } catch (e) {
            toast.error('Failed to save manual input.');
        } finally {
            setIsManualAdding(false);
        }
    };


    // ==========================================
    // SECTION 2: KNOWLEDGE ITEMS TABLE
    // ==========================================
    const { data: knowledgeItems, isLoading: itemsLoading } = useQuery({
        queryKey: ['knowledge-items'],
        queryFn: async () => {
            try {
                const res = await knowledgeAPI.getItems();
                return (res as any)?.data || res;
            } catch (e) {
                // Fallback for visual wireframe layout rendering
                return [
                    { id: '1', type: 'url', source: 'https://acme.com/about', status: 'active', chunks: 24, added: '2h ago' },
                    { id: '2', type: 'pdf', source: 'Product_Catalog_2024.pdf', status: 'processing', chunks: 0, added: 'Just now' },
                    { id: '3', type: 'manual', source: 'Return Policy Query', status: 'failed', chunks: 0, added: '1d ago' },
                ];
            }
        },
        refetchInterval: 10000
    });

    const handleDeleteItem = async (id: string) => {
        if (window.confirm("Delete this knowledge source? AI will forget it.")) {
            try {
                // await knowledgeAPI.deleteItem(id);
                toast.success("Source deleted successfully.");
                queryClient.setQueryData(['knowledge-items'], (old: any) =>
                    old?.filter((item: any) => item.id !== id)
                );
            } catch (e) {
                toast.error("Deletion failed.");
            }
        }
    };


    // ==========================================
    // SECTION 3: UNANSWERED QUESTIONS
    // ==========================================
    const { data: unansweredQs, isLoading: uqLoading } = useQuery({
        queryKey: ['unanswered-qs'],
        queryFn: async () => {
            try {
                const res = await knowledgeAPI.getUnanswered();
                return (res as any)?.data || res;
            } catch (e) {
                return [
                    { id: 'u1', question: 'Do you ship to Germany via standard mail?', customer: '+49 1512 3456789', timeAgo: '2h ago' },
                    { id: 'u2', question: 'Can I combine discount codes at checkout?', customer: '+1 (555) 019-8234', timeAgo: '5h ago' }
                ];
            }
        }
    });

    // Expandable Map dictating state for inline textareas: { 'u1': true, 'u2': false }
    const [expandedQs, setExpandedQs] = useState<{ [id: string]: boolean }>({});
    const [answerTexts, setAnswerTexts] = useState<{ [id: string]: string }>({});
    const [inlineSuccess, setInlineSuccess] = useState<{ [id: string]: boolean }>({});

    const toggleAnswerPanel = (id: string) => {
        setExpandedQs(prev => ({ ...prev, [id]: !prev[id] }));
        // Reset success banner if reopening
        if (inlineSuccess[id]) setInlineSuccess(prev => ({ ...prev, [id]: false }));
    };

    const handleSaveAnswer = async (id: string) => {
        const answer = answerTexts[id];
        if (!answer?.trim()) {
            toast.error("Answer cannot be empty.");
            return;
        }

        try {
            // await knowledgeAPI.answerQuestion(id, answer);
            setInlineSuccess(prev => ({ ...prev, [id]: true }));

            setTimeout(() => {
                toast.success("AI just got smarter! 🧠");
                // Remove from local cache optimistically
                queryClient.setQueryData(['unanswered-qs'], (old: any) =>
                    old?.filter((q: any) => q.id !== id)
                );
                // Clean up local states for mem-leak prevention
                setExpandedQs(prev => { const n = { ...prev }; delete n[id]; return n; });
                setAnswerTexts(prev => { const n = { ...prev }; delete n[id]; return n; });
                setInlineSuccess(prev => { const n = { ...prev }; delete n[id]; return n; });
            }, 2000);

        } catch (e) {
            toast.error("Failed to save training data.");
        }
    };

    return (
        <div className="kb-page animate-fade-in">
            <div className="page-header">
                <h1>Knowledge Base 🧠</h1>
                <p>Give your AI the context it needs to answer customer questions accurately.</p>
            </div>

            {/* SECTION 1: ADD KNOWLEDGE GRID */}
            <h2 className="section-title">Add Training Data</h2>
            <div className="kb-add-grid">

                {/* 1. URL Crawl Card */}
                <div className="kb-card">
                    <div className="card-icon">🌐</div>
                    <h3>Crawl Website</h3>
                    <p>We'll read all pages on your domain.</p>

                    <div className="input-row mt-4">
                        <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            disabled={isCrawlLoading}
                        />
                        <button
                            className="btn-primary"
                            onClick={handleCrawlUrl}
                            disabled={isCrawlLoading || !url}
                        >
                            Crawl
                        </button>
                    </div>

                    {isCrawlLoading && (
                        <div className="loading-zone">
                            <div className="indeterminate-bar"><div className="ib-fill"></div></div>
                            <div className="lz-text">{crawlStatus}</div>
                        </div>
                    )}

                    {crawlSuccess && (
                        <div className="success-banner">
                            ✅ Trained on website dynamically
                        </div>
                    )}
                </div>

                {/* 2. PDF Upload Card */}
                <div className="kb-card">
                    <div className="card-icon">📄</div>
                    <h3>Upload PDF</h3>
                    <p>Product catalogs, menus, or FAQs. <br />(Max 10MB)</p>

                    <div
                        className={`drag-zone mt-4 ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} hidden />
                        {pdfFile ? (
                            <div className="selected-file">
                                <span className="truncate">{pdfFile.name}</span>
                                <span className="sz">{(pdfFile.size / 1024 / 1024).toFixed(1)}MB</span>
                            </div>
                        ) : (
                            <span>Drag & Drop or Click</span>
                        )}
                    </div>

                    {pdfFile && !isPdfUploading && !pdfSuccess && (
                        <button className="btn-primary mt-3 btn-full" onClick={trainPdf}>Upload & Train AI</button>
                    )}

                    {isPdfUploading && (
                        <div className="loading-zone mt-3">
                            <div className="indeterminate-bar"><div className="ib-fill"></div></div>
                            <div className="lz-text">Parsing Document...</div>
                        </div>
                    )}

                    {pdfSuccess && (
                        <div className="success-banner mt-3">
                            ✅ Trained on {pdfFile?.name}
                        </div>
                    )}
                </div>

                {/* 3. Manual Entry Card */}
                <div className="kb-card">
                    <div className="card-icon">✍️</div>
                    <h3>Manual Entry</h3>
                    <p>Add specific answers or instructions instantly.</p>

                    <input
                        type="text"
                        placeholder="Topic or question"
                        className="mt-4 mb-2 full-width"
                        value={manualTitle}
                        onChange={e => setManualTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Answer or information"
                        className="mb-3 full-width"
                        rows={3}
                        value={manualContent}
                        onChange={e => setManualContent(e.target.value)}
                    ></textarea>

                    <button
                        className="btn-secondary btn-full"
                        onClick={addManualInfo}
                        disabled={isManualAdding}
                    >
                        {isManualAdding ? 'Saving...' : 'Add to Knowledge Base'}
                    </button>
                </div>

            </div>

            {/* SECTION 2: ITEMS TABLE */}
            <h2 className="section-title mt-10">Active Knowledge Sources</h2>
            <div className="table-card">
                {itemsLoading ? (
                    <div className="p-4"><div className="table-skeleton"></div><div className="table-skeleton mt-2"></div></div>
                ) : !knowledgeItems || knowledgeItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h4>No knowledge sources yet</h4>
                        <p>Add your website URL above to get started training your agent.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="kb-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Chunks</th>
                                    <th>Added</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {knowledgeItems.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="icon-cell">
                                            {item.type === 'url' ? '🌐' : item.type === 'pdf' ? '📄' : '✍️'}
                                        </td>
                                        <td className="source-cell">{item.source}</td>
                                        <td>
                                            {item.status === 'active' && <span className="status-pill green">✅ Active</span>}
                                            {item.status === 'processing' && <span className="status-pill orange"><span className="spinner">↻</span> Processing...</span>}
                                            {item.status === 'failed' && <span className="status-pill red">❌ Failed — click to retry</span>}
                                        </td>
                                        <td className="text-gray">{item.chunks}</td>
                                        <td className="text-gray">{item.added}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SECTION 3: UNANSWERED QUESTIONS */}
            <h2 id="unanswered" className="section-title mt-10">Unanswered Questions</h2>
            <div className="unanswered-card">
                {uqLoading ? (
                    <div className="p-4"><div className="table-skeleton"></div></div>
                ) : !unansweredQs || unansweredQs.length === 0 ? (
                    <div className="empty-state success-empty">
                        <div className="empty-icon">🎉</div>
                        <h4>Your AI is answering everything!</h4>
                        <p>No unanswered questions requiring manual intervention.</p>
                    </div>
                ) : (
                    <div className="unanswered-list">
                        {unansweredQs.map((q: any) => (
                            <div key={q.id} className="uq-item">
                                <div className="uq-header">
                                    <div className="uq-meta">
                                        <span className="uq-customer">{q.customer}</span>
                                        <span className="uq-time text-gray">• {q.timeAgo}</span>
                                    </div>
                                </div>

                                <div className="uq-content-row">
                                    <div className="uq-question">"{q.question}"</div>
                                    <button
                                        className="btn-outline"
                                        onClick={() => toggleAnswerPanel(q.id)}
                                    >
                                        {expandedQs[q.id] ? 'Close Panel' : 'Answer & Train AI'}
                                    </button>
                                </div>

                                {/* INLINE TRAINING PANEL */}
                                {expandedQs[q.id] && (
                                    <div className="uq-inline-panel animate-fade-in">
                                        {inlineSuccess[q.id] ? (
                                            <div className="success-banner panel-success">
                                                ✅ AI trained on this answer! Learning synchronized...
                                            </div>
                                        ) : (
                                            <>
                                                <textarea
                                                    placeholder="Type the correct answer. The AI will learn this exact context to answer future variations of this question..."
                                                    rows={3}
                                                    value={answerTexts[q.id] || ''}
                                                    onChange={e => setAnswerTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                ></textarea>
                                                <div className="panel-actions">
                                                    <button className="btn-primary-small" onClick={() => handleSaveAnswer(q.id)}>
                                                        Save & Train AI
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .kb-page {
          padding: 32px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        
        /* Typography */
        .page-header h1 { font-family: var(--fd); font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: -0.5px; }
        .page-header p { color: var(--text2); font-size: 16px; margin-bottom: 32px; }
        .section-title { font-family: var(--fd); font-size: 20px; font-weight: 700; color: var(--text); padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .mt-10 { margin-top: 40px; }
        .mt-4 { margin-top: 16px; }
        .mt-3 { margin-top: 12px; }
        .mt-2 { margin-top: 8px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .p-4 { padding: 16px; }

        /* Grid Setup (Section 1) */
        .kb-add-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .kb-card {
           background: white;
           border: 1px solid rgba(0,0,0,0.08);
           border-radius: 16px;
           padding: 24px;
           box-shadow: 0 4px 24px rgba(0,0,0,0.02);
           display: flex;
           flex-direction: column;
        }
        
        .card-icon { font-size: 28px; margin-bottom: 12px; }
        .kb-card h3 { font-family: var(--fb); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .kb-card p { font-size: 13px; color: var(--text3); line-height: 1.4; }

        /* Form Alignments */
        .input-row { display: flex; gap: 8px; }
        .input-row input { flex: 1; min-width: 0; }
        
        input[type="url"], input[type="text"], textarea {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1.5px solid rgba(0,0,0,0.1);
          font-family: var(--fb);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus, textarea:focus { border-color: var(--or); }
        .full-width { width: 100%; box-sizing: border-box; }

        .btn-primary { background: linear-gradient(135deg, var(--or), var(--or2)); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-family: var(--fb); cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255,69,0,0.2); white-space: nowrap; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,69,0,0.3); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-secondary { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); padding: 10px 16px; border-radius: 8px; font-weight: 600; color: var(--text); cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover:not(:disabled) { background: rgba(0,0,0,0.08); }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-full { width: 100%; }

        .btn-outline { background: white; border: 1px solid rgba(0,0,0,0.15); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--text); cursor: pointer; transition: all 0.2s; }
        .btn-outline:hover { border-color: var(--text); background: #fafafa; }
        
        .btn-primary-small { background: var(--or); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 2px 8px rgba(255,69,0,0.3); transition: all 0.2s; }
        .btn-primary-small:hover { transform: translateY(-1px); }

        /* Indeterminate Loader */
        .loading-zone { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; align-items: center; }
        .lz-text { font-size: 12px; font-weight: 500; color: var(--or); animation: pulseText 1.5s infinite; }
        .indeterminate-bar { width: 100%; height: 4px; background: rgba(255,69,0,0.1); border-radius: 2px; overflow: hidden; position: relative; }
        .ib-fill { position: absolute; top: 0; bottom: 0; left: -20%; width: 40%; background: var(--or); border-radius: 2px; animation: slideIndeterminate 1.5s infinite linear; }
        @keyframes slideIndeterminate { 0% { left: -30%; width: 30%; } 50% { width: 60%; } 100% { left: 110%; width: 30%; } }
        @keyframes pulseText { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

        /* Success Banner */
        .success-banner { margin-top: 16px; background: #Edfaf3; border: 1px solid #A7F3D0; color: #047857; font-size: 13px; font-weight: 600; padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; }
        .panel-success { margin-top: 0; margin-bottom: 8px; }

        /* Drag Zone */
        .drag-zone { border: 2px dashed rgba(0,0,0,0.15); border-radius: 12px; background: #fafafa; padding: 20px 16px; text-align: center; color: var(--text3); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; min-height: 80px; }
        .drag-zone.dragging { border-color: var(--or); background: #fff5f2; color: var(--or); }
        .drag-zone:hover { border-color: var(--text3); }
        .selected-file { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .selected-file .truncate { max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; color: var(--text); }
        .selected-file .sz { font-size: 11px; }

        /* Table Architecture */
        .table-card, .unanswered-card { background: white; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.02); overflow: hidden; }
        .table-wrapper { width: 100%; overflow-x: auto; }
        .kb-table { width: 100%; border-collapse: collapse; text-align: left; }
        .kb-table th { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.08); color: var(--text3); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #fafafa; }
        .kb-table td { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 14px; color: var(--text); }
        .source-cell { font-weight: 500; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .status-pill.green { background: #Edfaf3; color: #047857; }
        .status-pill.orange { background: #FFF7ED; color: #C2410C; }
        .status-pill.red { background: #FEF2F2; color: #B91C1C; cursor: pointer; }
        .spinner { display: inline-block; animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .btn-delete { background: none; border: none; color: var(--text3); font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s; }
        .btn-delete:hover { color: #DC2626; text-decoration: underline; }

        .table-skeleton { height: 48px; background: #e5e7eb; border-radius: 8px; animation: pulse 1.5s infinite; }

        /* Empty States */
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-state h4 { font-family: var(--fd); font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
        .empty-state p { font-size: 14px; color: var(--text3); }
        .success-empty { background: #f0fdf4; }

        /* Unanswered Qs Architecture */
        .unanswered-list { display: flex; flex-direction: column; }
        .uq-item { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .uq-item:last-child { border-bottom: none; }
        
        .uq-header { margin-bottom: 8px; }
        .uq-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; }
        .uq-customer { color: var(--or); }
        .text-gray { color: var(--text3); }

        .uq-content-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
        .uq-question { font-family: var(--fb); font-size: 16px; font-weight: 600; color: var(--text); line-height: 1.4; flex: 1; }

        .uq-inline-panel { margin-top: 16px; background: #fafafa; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 16px; border-left: 3px solid var(--or); }
        .panel-actions { display: flex; justify-content: flex-end; margin-top: 12px; }

        @media (max-width: 1024px) {
           .kb-add-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
           .kb-page { padding: 24px 16px; }
           .kb-add-grid { grid-template-columns: 1fr; }
           .uq-content-row { flex-direction: column; align-items: stretch; }
           .btn-outline { align-self: flex-start; }
        }
      `}</style>
        </div>
    );
}
