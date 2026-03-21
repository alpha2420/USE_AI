'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Papa from 'papaparse';
// Using the generic internal api utility for custom POST endpoints matching mock specifications
import api, { campaignAPI } from '@/lib/api';

export default function CampaignsPage() {
    const queryClient = useQueryClient();

    // ==========================================
    // SECTION 1: HEADER & TABLE DATA
    // ==========================================
    const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            try {
                const res = await campaignAPI.getAll();
                return (res as any)?.data || res;
            } catch (e) {
                // Fallback wireframe layout data
                return [
                    { id: '1', name: 'Valentine Flash Sale', status: 'completed', sent_count: 5000, recipient_count: 5000, read_count: 4200, replies: 124, created: 'Feb 10, 2024' },
                    { id: '2', name: 'Q1 Product Update', status: 'running', sent_count: 1200, recipient_count: 3000, read_count: 900, replies: 15, created: 'Today, 9:00 AM' },
                    { id: '3', name: 'Abandoned Cart Recovery', status: 'draft', sent_count: 0, recipient_count: 0, read_count: 0, replies: 0, created: 'Yesterday' },
                    { id: '4', name: 'Holiday Special (Error)', status: 'failed', sent_count: 42, recipient_count: 1000, read_count: 10, replies: 0, created: 'Dec 20, 2023' }
                ];
            }
        },
        refetchInterval: 30000
    });

    // Calculate Metrics Header natively from array payload
    const cData = campaigns || [];
    const totalCampaignsCount = cData.length;
    const totalMessagesSent = cData.reduce((acc: number, c: any) => acc + (c.sent_count || 0), 0);

    // Avg read = average of (read/sent) percentages across active/completed instances
    let avgReadRate = 0;
    const validReadCamps = cData.filter((c: any) => c.sent_count > 0);
    if (validReadCamps.length > 0) {
        const sumH = validReadCamps.reduce((acc: number, c: any) => acc + ((c.read_count / c.sent_count) * 100), 0);
        avgReadRate = Math.round(sumH / validReadCamps.length);
    }

    // ==========================================
    // SECTION 2: CREATE MODAL SYSTEM
    // ==========================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1); // 1: Message, 2: Recipients, 3: Review

    // Step 1 State
    const [campaignName, setCampaignName] = useState('');
    const [messageText, setMessageText] = useState('');

    // Step 2 State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvPreview, setCsvPreview] = useState<{ valid: any[], skipped: number } | null>(null);

    // Step 3 API State
    const [isSending, setIsSending] = useState(false);

    // Core Modifiers
    const openModal = () => {
        setModalStep(1);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        // Reset states explicitly dropping file references
        setTimeout(() => {
            setCampaignName('');
            setMessageText('');
            setCsvFile(null);
            setCsvPreview(null);
            setModalStep(1);
        }, 300);
    };

    const parseCsvFile = (file: File) => {
        setCsvFile(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                let valid: any[] = [];
                let skipped = 0;

                results.data.forEach((row: any) => {
                    // Validate mapping: lowercase headers checking explicit variables
                    const keys = Object.keys(row).map(k => k.trim().toLowerCase());
                    const hasPhone = keys.includes('phone');
                    const hasName = keys.includes('name');

                    if (hasPhone && hasName && row.phone && row.name) {
                        valid.push({ phone: row.phone, name: row.name });
                    } else {
                        skipped++;
                    }
                });

                setCsvPreview({ valid, skipped });
            },
            error: () => {
                toast.error("Failed to parse CSV file.");
                setCsvFile(null);
                setCsvPreview(null);
            }
        });
    };

    const handleDownloadTemplate = () => {
        const csvStr = "phone,name\\n+919876543210,Rahul";
        const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "useai_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCreateCampaign = async () => {
        if (!campaignName || !messageText || !csvPreview?.valid.length) return;

        setIsSending(true);
        try {
            // Mock the create action via standard API routes
            // await campaignAPI.create({ name: campaignName, message: messageText, recipients: csvPreview.valid, schedule: null });
            await new Promise(res => setTimeout(res, 1500));

            toast.success("Campaign started! 🚀");
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            closeModal();
        } catch (e) {
            toast.error("Failed to launch campaign.");
        } finally {
            setIsSending(false);
        }
    };


    return (
        <div className="campaigns-page animate-fade-in">
            <div className="page-header">
                <div className="ph-left">
                    <h1>Campaigns 📣</h1>
                    <p>Blast updates, promotions, and notifications via WhatsApp API.</p>
                </div>
                <button className="btn-primary" onClick={openModal}>+ Create Campaign</button>
            </div>

            {/* METRICS ROW */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="st-label">Total Campaigns</div>
                    <div className="st-value">{isCampaignsLoading ? '...' : totalCampaignsCount}</div>
                </div>
                <div className="stat-card">
                    <div className="st-label">Total Messages Sent</div>
                    <div className="st-value">{isCampaignsLoading ? '...' : totalMessagesSent.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="st-label">Average Read Rate</div>
                    <div className="st-value">{isCampaignsLoading ? '...' : `${avgReadRate}%`}</div>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="table-card">
                {isCampaignsLoading ? (
                    <div className="p-4"><div className="table-skeleton"></div><div className="table-skeleton mt-2"></div></div>
                ) : campaigns?.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📧</div>
                        <h4>No campaigns found</h4>
                        <p>Click "Create Campaign" to initiate your first WhatsApp broadcast.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="camp-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th style={{ minWidth: '180px' }}>Sent</th>
                                    <th>Read Rate</th>
                                    <th>Replies</th>
                                    <th>Created</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cData.map((camp: any) => {
                                    const progress = camp.recipient_count > 0 ? (camp.sent_count / camp.recipient_count) * 100 : 0;

                                    return (
                                        <tr key={camp.id}>
                                            <td className="font-medium truncate-cell">{camp.name}</td>
                                            <td>
                                                <span className={`status-pill ${camp.status}`}>
                                                    {camp.status === 'running' && <span className="green-dot"></span>}
                                                    {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="prog-wrapper">
                                                    <div className="prog-text">
                                                        {camp.sent_count.toLocaleString()} / {camp.recipient_count.toLocaleString()}
                                                    </div>
                                                    <div className="prog-bar-bg">
                                                        <div className="prog-bar-fill" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-medium">
                                                {camp.sent_count > 0 ? Math.round((camp.read_count / camp.sent_count) * 100) : 0}%
                                            </td>
                                            <td className="text-gray">{camp.replies.toLocaleString()}</td>
                                            <td className="text-gray">{camp.created}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="btn-text">View details</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE CAMPAIGN MODAL */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box animate-scale-up">

                        <div className="modal-header">
                            <h3>Create Campaign</h3>
                            <button className="btn-close-icon" onClick={closeModal} disabled={isSending}>✕</button>
                        </div>

                        <div className="stepper">
                            <div className={`step ${modalStep >= 1 ? 'active' : ''}`}>1. Message</div>
                            <div className="step-line"></div>
                            <div className={`step ${modalStep >= 2 ? 'active' : ''}`}>2. Recipients</div>
                            <div className="step-line"></div>
                            <div className={`step ${modalStep >= 3 ? 'active' : ''}`}>3. Review</div>
                        </div>

                        <div className="modal-body">
                            {/* STEP 1: MESSAGE */}
                            {modalStep === 1 && (
                                <div className="step-content s1-grid">
                                    <div className="s1-form">
                                        <label>Campaign Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Summer Sale Broadast"
                                            className="fw-input mb-4"
                                            value={campaignName}
                                            onChange={e => setCampaignName(e.target.value)}
                                        />

                                        <label>WhatsApp Message</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Type your message here..."
                                            className={`fw-input mt-1 ${messageText.length >= 900 ? 'border-red text-red-area' : ''}`}
                                            maxLength={1024}
                                            value={messageText}
                                            onChange={e => setMessageText(e.target.value)}
                                        ></textarea>
                                        <div className="textarea-meta">
                                            <span className="hint">Hint: Use {'{{name}}'} to dynamically inject customer's name.</span>
                                            <span className={`counter ${messageText.length >= 900 ? 'text-red' : ''}`}>{messageText.length}/1024</span>
                                        </div>
                                    </div>

                                    <div className="s1-preview">
                                        <div className="preview-label">Live Preview</div>
                                        <div className="wa-mock">
                                            <div className="wa-bubble">
                                                {messageText ? messageText.split('\n').map((line, i) => (
                                                    <span key={i}>{line}<br /></span>
                                                )) : <span className="placeholder-txt">Your message will appear here...</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: RECIPIENTS */}
                            {modalStep === 2 && (
                                <div className="step-content">
                                    <div className="csv-uploader">
                                        <div className="upload-icon">📊</div>
                                        <h4>Upload CSV Data</h4>
                                        <p>Your document must contain specific <code>phone</code> and <code>name</code> columns.</p>

                                        <button className="btn-secondary mt-3" onClick={() => fileInputRef.current?.click()}>
                                            {csvFile ? 'Select Different File' : 'Browse Files'}
                                        </button>
                                        <input type="file" accept=".csv" ref={fileInputRef} onChange={e => {
                                            if (e.target.files?.[0]) parseCsvFile(e.target.files[0]);
                                        }} hidden />

                                        <button className="btn-text-orange mt-2" onClick={handleDownloadTemplate}>
                                            Download sample template →
                                        </button>
                                    </div>

                                    {csvPreview && (
                                        <div className="csv-results mt-4 animate-fade-in">
                                            <div className="res-item success">
                                                <span>✅</span>
                                                {csvPreview.valid.length} valid phone numbers mapping found.
                                            </div>
                                            {csvPreview.skipped > 0 && (
                                                <div className="res-item warning">
                                                    <span>⚠️</span>
                                                    {csvPreview.skipped} rows skipped due to invalid formats.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: REVIEW & SEND */}
                            {modalStep === 3 && (
                                <div className="step-content">
                                    <div className="warning-banner mb-4">
                                        ⚠️ Overuse of Campaigns can lead to WhatsApp ban. Only send to opted-in customers!
                                    </div>

                                    <div className="summary-box">
                                        <div className="sum-row">
                                            <span className="sum-label">Campaign Name:</span>
                                            <span className="sum-val">{campaignName}</span>
                                        </div>
                                        <div className="sum-row">
                                            <span className="sum-label">Target Audience:</span>
                                            <span className="sum-val">{csvPreview?.valid.length || 0} Recipients</span>
                                        </div>
                                        <div className="sum-row">
                                            <span className="sum-label">Estimated Pricing:</span>
                                            <span className="sum-val font-cash">₹{(csvPreview?.valid.length || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="tiny-preview mt-4">
                                        <div className="tp-label">Message Payload</div>
                                        <div className="tp-box">{messageText}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            {modalStep === 1 && (
                                <>
                                    <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button className="btn-primary" disabled={!campaignName.trim() || !messageText.trim()} onClick={() => setModalStep(2)}>Next Step →</button>
                                </>
                            )}
                            {modalStep === 2 && (
                                <>
                                    <button className="btn-secondary" onClick={() => setModalStep(1)}>← Back</button>
                                    <button className="btn-primary" disabled={!csvPreview || csvPreview.valid.length === 0} onClick={() => setModalStep(3)}>Next Step →</button>
                                </>
                            )}
                            {modalStep === 3 && (
                                <>
                                    <button className="btn-secondary" disabled={isSending} onClick={() => setModalStep(2)}>← Back</button>
                                    <button className="btn-primary" disabled={isSending} onClick={handleCreateCampaign}>
                                        {isSending ? 'Launching...' : '🚀 Send Now'}
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}


            <style jsx>{`
        .campaigns-page { padding: 32px 40px; max-width: 1400px; margin: 0 auto; }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scaleUp { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }

        /* Typography */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .ph-left h1 { font-family: var(--fd); font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: -0.5px; }
        .ph-left p { color: var(--text2); font-size: 16px; }

        .btn-primary { background: linear-gradient(135deg, var(--or), var(--or2)); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-family: var(--fb); cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255,69,0,0.2); }
        .btn-primary:active { transform: translateY(1px); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,69,0,0.3); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); padding: 10px 16px; border-radius: 8px; font-weight: 600; color: var(--text); cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover:not(:disabled) { background: rgba(0,0,0,0.08); }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Metrics Row */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .stat-card { background: white; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px; }
        .st-label { font-size: 14px; font-weight: 600; color: var(--text2); }
        .st-value { font-family: var(--fd); font-size: 36px; font-weight: 700; color: var(--text); letter-spacing: -1px; }

        /* Main Table Layout */
        .table-card { background: white; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.02); overflow: hidden; }
        .table-wrapper { width: 100%; overflow-x: auto; }
        .camp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .camp-table th { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.08); color: var(--text3); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #fafafa; }
        .camp-table td { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 14px; color: var(--text); }
        
        .font-medium { font-weight: 600; color: var(--text); }
        .text-gray { color: var(--text3); }
        .truncate-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Badges / Graphic States */
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .status-pill.draft { background: #f3f4f6; color: #374151; }
        .status-pill.completed { background: #e5e7eb; color: #111827; }
        .status-pill.failed { background: #FEF2F2; color: #B91C1C; }
        .status-pill.running { background: #D1FAE5; color: #065F46; }
        .green-dot { width: 8px; height: 8px; border-radius: 50%; background: #059669; animation: pulseOp 1.5s infinite; }
        @keyframes pulseOp { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .prog-wrapper { display: flex; flex-direction: column; gap: 6px; }
        .prog-text { font-size: 13px; font-weight: 600; color: var(--text2); }
        .prog-bar-bg { width: 100%; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; }
        .prog-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); border-radius: 3px; }

        .btn-text { background: none; border: none; font-size: 13px; font-weight: 600; color: var(--or); cursor: pointer; }
        .btn-text:hover { text-decoration: underline; }

        .empty-state { padding: 60px 20px; text-align: center; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .empty-state h4 { font-family: var(--fd); font-size: 18px; font-weight: 700; margin-bottom: 8px; }

        /* Modal Substrate */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-box { width: 100%; max-width: 720px; background: white; border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.15); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
        
        .modal-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { font-family: var(--fd); font-size: 20px; font-weight: 700; margin: 0; }
        .btn-close-icon { background: none; border: none; font-size: 24px; color: var(--text3); cursor: pointer; padding: 4px; line-height: 1; }
        .btn-close-icon:hover { color: var(--text); }

        /* Modal Typography/Layouts */
        .stepper { display: flex; align-items: center; padding: 16px 24px; background: #fafafa; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .step { font-size: 13px; font-weight: 600; color: var(--text3); opacity: 0.6; }
        .step.active { color: var(--or); opacity: 1; text-shadow: 0 0 1px rgba(255,69,0,0.5); }
        .step-line { flex: 1; height: 1px; background: rgba(0,0,0,0.08); margin: 0 16px; }

        .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: flex-end; gap: 12px; background: #fafafa; }

        .mb-4 { margin-bottom: 16px; }
        .mt-4 { margin-top: 16px; }
        .mt-3 { margin-top: 12px; }
        .mt-2 { margin-top: 8px; }

        /* S1 Message Grid */
        .s1-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .s1-form { display: flex; flex-direction: column; }
        .s1-form label { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .fw-input { width: 100%; padding: 12px 14px; border-radius: 8px; border: 1.5px solid rgba(0,0,0,0.1); font-family: var(--fb); font-size: 14px; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .fw-input:focus { border-color: var(--or); }
        .fw-input.border-red { border-color: #DC2626 !important; }
        .text-red-area { color: #DC2626; }
        
        .textarea-meta { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 6px; }
        .hint { font-size: 11px; color: var(--text3); }
        .counter { font-size: 11px; font-weight: 600; color: var(--text3); }
        .text-red { color: #DC2626; }

        .s1-preview { display: flex; flex-direction: column; }
        .preview-label { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; }
        .wa-mock { background: #e5ddd5; border-radius: 12px; padding: 20px; flex: 1; position: relative; display: flex; flex-direction: column; }
        .wa-bubble { background: #dcf8c6; padding: 12px 14px; border-radius: 12px; border-top-right-radius: 0; font-size: 14px; line-height: 1.4; color: #111; align-self: flex-end; max-width: 100%; word-break: break-word; position: relative; box-shadow: 0 1px 1px rgba(0,0,0,0.1); }
        .wa-bubble::after { content: ''; position: absolute; right: -8px; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 10px 10px; border-color: transparent transparent transparent #dcf8c6; }
        .placeholder-txt { color: rgba(0,0,0,0.4); font-style: italic; }

        /* S2 Upload Grid */
        .csv-uploader { border: 2px dashed rgba(0,0,0,0.15); border-radius: 12px; padding: 40px 24px; text-align: center; background: #fafafa; }
        .upload-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.6; }
        .csv-uploader h4 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .csv-uploader p { font-size: 14px; color: var(--text3); }
        .csv-uploader code { background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-weight: 600; color: var(--text); }
        
        .btn-text-orange { background: none; border: none; font-size: 13px; font-weight: 600; color: var(--or); cursor: pointer; display: block; margin: 0 auto; }
        .btn-text-orange:hover { text-decoration: underline; }

        .res-item { padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .res-item.success { background: #Edfaf3; border: 1px solid #A7F3D0; color: #047857; }
        .res-item.warning { background: #FFF7ED; border: 1px solid #FDBA74; color: #9A3412; }

        /* S3 Review Grid */
        .warning-banner { background: #FFF7ED; border-left: 4px solid #F97316; padding: 16px; color: #9A3412; font-size: 14px; font-weight: 500; border-radius: 4px; }
        .summary-box { border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 20px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .sum-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .sum-row:last-child { border-bottom: none; padding-bottom: 0; }
        .sum-row:first-child { padding-top: 0; }
        
        .sum-label { font-size: 14px; font-weight: 600; color: var(--text3); }
        .sum-val { font-size: 14px; font-weight: 600; color: var(--text); }
        .font-cash { font-family: var(--fd); font-size: 20px; color: #059669; }

        .tiny-preview .tp-label { font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; margin-bottom: 8px; }
        .tp-box { background: #fafafa; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.5; color: var(--text2); white-space: pre-wrap; word-break: break-word; }

        @media (max-width: 1024px) {
           .stats-grid { grid-template-columns: 1fr; gap: 12px; }
        }
        @media (max-width: 768px) {
           .campaigns-page { padding: 24px 16px; }
           .page-header { flex-direction: column; align-items: stretch; gap: 16px; }
           .s1-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
