'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { dashboardAPI } from '@/lib/api';
import api from '@/lib/api'; // Native axios required for custom unhandled POST actions per spec

// Helper parsing time relative definitions (e.g. "2m", "1h") from generic stamps
const formatRelativeTime = (timeString: string) => {
    // Simulating relative times for wireframe matching until real ISO stamps arrive
    return timeString;
};

// Auto-Scroll generic hook for chat anchoring
const useChatScroll = <T extends HTMLElement>(dep: any) => {
    const ref = useRef<T>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, [dep]);
    return ref;
};

export default function ConversationsPage() {
    const queryClient = useQueryClient();

    // LEFT PANEL STATE
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'escalated' | 'closed'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // OVERRIDE: Simulated Endpoints to prevent layout crashes during purely frontend development
    // ----------------------------------------------------

    // 1. Fetch Conversations List (10s Polling)
    const { data: convsData, isLoading: isConvsLoading } = useQuery({
        queryKey: ['conversations-list'],
        queryFn: async () => {
            try {
                const res = await dashboardAPI.getConversations();
                return (res as any)?.data || res;
            } catch (e) {
                return [
                    { id: 'c1', customerName: 'Alex Smith', customerPhone: '+1 (555) 019-8234', lastMessage: 'I need to talk to a human.', time: '2m', status: 'escalated', hasUnread: true },
                    { id: 'c2', customerName: 'Sarah Jenkins', customerPhone: '+44 7911 123456', lastMessage: 'Where is my order?', time: '1h', status: 'active', hasUnread: false },
                    { id: 'c3', customerName: 'Unknown', customerPhone: '+91 98765 43210', lastMessage: 'Thanks, the AI was very helpful.', time: 'Yesterday', status: 'closed', hasUnread: false },
                ];
            }
        },
        refetchInterval: 10000
    });

    // Derived filtered conversations
    const filteredConvs = (convsData || []).filter((c: any) => {
        const matchesFilter = filter === 'all' || c.status === filter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = c.customerName.toLowerCase().includes(searchLower) || c.customerPhone.toLowerCase().includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    // Calculate generic counts natively
    const counts = {
        all: convsData?.length || 0,
        active: convsData?.filter((c: any) => c.status === 'active').length || 0,
        escalated: convsData?.filter((c: any) => c.status === 'escalated').length || 0,
        closed: convsData?.filter((c: any) => c.status === 'closed').length || 0,
    };

    const selectedConvMeta = convsData?.find((c: any) => c.id === selectedConvId);


    // RIGHT PANEL STATE (Messages)
    const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
        queryKey: ['messages', selectedConvId],
        queryFn: async () => {
            try {
                const res = await dashboardAPI.getMessages(selectedConvId!);
                return (res as any)?.data || res;
            } catch (e) {
                // Mock payload specific to escalated states
                if (selectedConvMeta?.status === 'escalated') {
                    return [
                        { id: 'm1', type: 'inbound', text: 'Hi, I need help with my recent order.', time: '10:30 AM', sender: 'Customer' },
                        { id: 'm2', type: 'outbound_ai', text: 'Hello! I can help you with your order. Can you provide the order ID?', time: '10:30 AM', confidence: 98 },
                        { id: 'm3', type: 'inbound', text: 'I dont know it. I really need to talk to a human about this.', time: '10:32 AM', sender: 'Customer' }
                    ];
                }
                return [
                    { id: 'm1', type: 'inbound', text: 'Where is my order?', time: '2:15 PM', sender: 'Customer' },
                    { id: 'm2', type: 'outbound_ai', text: 'Your order #12345 is currently out for delivery and should arrive by 8:00 PM today.', time: '2:15 PM', confidence: 99 }
                ];
            }
        },
        enabled: !!selectedConvId,
        refetchInterval: 5000
    });

    // Scroll Ref Hook explicitly bound to `messagesData` rendering
    const chatScrollRef = useChatScroll<HTMLDivElement>(messagesData);

    // CHAT INPUT STATE
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);

    // ACTIONS
    const handleTakeOver = async () => {
        if (!selectedConvId) return;
        try {
            await dashboardAPI.assignConversation(selectedConvId);
            toast.success('You have mapped this conversation manually.');
            // Optimistic UI Status toggle triggering rerenders unlocking chat
            queryClient.setQueryData(['conversations-list'], (old: any) =>
                old?.map((c: any) => c.id === selectedConvId ? { ...c, status: 'escalated' } : c)
            );
        } catch (e) {
            toast.error('Failed to take over conversation.');
            // Mock UI update anyway during wireframe testing
            queryClient.setQueryData(['conversations-list'], (old: any) =>
                old?.map((c: any) => c.id === selectedConvId ? { ...c, status: 'escalated' } : c)
            );
        }
    };

    const handleCloseChat = async () => {
        if (!selectedConvId) return;
        try {
            await api.post(`/dashboard/conversations/${selectedConvId}/close`);
            toast.success('Conversation closed.');
            queryClient.setQueryData(['conversations-list'], (old: any) =>
                old?.map((c: any) => c.id === selectedConvId ? { ...c, status: 'closed' } : c)
            );
        } catch (e) {
            toast.error('Failed to close chat.');
            queryClient.setQueryData(['conversations-list'], (old: any) =>
                old?.map((c: any) => c.id === selectedConvId ? { ...c, status: 'closed' } : c)
            );
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedConvId) return;
        setIsSending(true);
        try {
            await api.post(`/dashboard/conversations/${selectedConvId}/reply`, { message: replyText });

            // Optimistic mapping explicitly rendering agent outbounds
            const newMsg = {
                id: `m_new_${Date.now()}`,
                type: 'outbound_agent',
                text: replyText,
                time: 'Just now',
                sender: 'You'
            };
            queryClient.setQueryData(['messages', selectedConvId], (old: any) => [...(old || []), newMsg]);

            setReplyText('');
        } catch (e) {
            toast.error('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="chat-layout animate-fade-in">

            {/* ========================================== */}
            {/* LEFT PANEL (Inbox) */}
            {/* ========================================== */}
            <div className="chat-sidebar">

                <div className="sidebar-header">
                    <h2>Inbox</h2>
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-tabs">
                    {(['all', 'active', 'escalated', 'closed'] as const).map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="count">{counts[f]}</span>
                        </button>
                    ))}
                </div>

                <div className="conv-list">
                    {isConvsLoading ? (
                        <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="skeleton-row"></div>
                            <div className="skeleton-row"></div>
                            <div className="skeleton-row"></div>
                        </div>
                    ) : filteredConvs.length === 0 ? (
                        <div className="empty-list">No conversations found.</div>
                    ) : (
                        filteredConvs.map((conv: any) => (
                            <div
                                key={conv.id}
                                className={`conv-item ${selectedConvId === conv.id ? 'selected' : ''}`}
                                onClick={() => setSelectedConvId(conv.id)}
                            >
                                <div className="ci-avatar">
                                    {conv.customerName !== 'Unknown' ? conv.customerName.charAt(0).toUpperCase() : '?'}
                                    {conv.hasUnread && <div className="unread-dot"></div>}
                                </div>
                                <div className="ci-content">
                                    <div className="ci-top">
                                        <span className="ci-name">{conv.customerName !== 'Unknown' ? conv.customerName : conv.customerPhone}</span>
                                        <span className="ci-time">{formatRelativeTime(conv.time)}</span>
                                    </div>
                                    <div className="ci-preview">{conv.lastMessage}</div>
                                    <div className="ci-badges">
                                        {conv.status === 'active' && <span className="chip chip-ai">🤖 AI handling</span>}
                                        {conv.status === 'escalated' && <span className="chip chip-warn">⚠️ Escalated</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* ========================================== */}
            {/* RIGHT PANEL (Chat Window) */}
            {/* ========================================== */}
            <div className="chat-main">
                {!selectedConvId ? (
                    <div className="chat-empty">
                        <div className="ce-icon">💬</div>
                        <h3>Select a conversation</h3>
                        <p>Choose an active or escalated thread from the list to view messages.</p>
                    </div>
                ) : (
                    <>
                        {/* TOP BAR */}
                        <div className="chat-header">
                            <div className="ch-info">
                                <div className="ch-avatar">
                                    {selectedConvMeta?.customerName !== 'Unknown' ? selectedConvMeta?.customerName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="ch-details">
                                    <h4>{selectedConvMeta?.customerName !== 'Unknown' ? selectedConvMeta?.customerName : selectedConvMeta?.customerPhone}</h4>
                                    <div className="ch-status">
                                        {selectedConvMeta?.status === 'active' ? '🟢 Active · AI is handling' :
                                            selectedConvMeta?.status === 'escalated' ? '🟠 Escalated · Assigned to you' :
                                                '⚫ Closed'}
                                    </div>
                                </div>
                            </div>
                            <div className="ch-actions">
                                {selectedConvMeta?.status === 'active' && (
                                    <button className="btn-takeover" onClick={handleTakeOver}>Take Over</button>
                                )}
                                {selectedConvMeta?.status !== 'closed' && (
                                    <button className="btn-close" onClick={handleCloseChat}>Close Chat</button>
                                )}
                            </div>
                        </div>

                        {/* MESSAGES AREA */}
                        <div className="chat-messages" ref={chatScrollRef}>
                            {isMessagesLoading ? (
                                <div className="messages-loading">Loading chat history...</div>
                            ) : (
                                messagesData?.map((msg: any) => (
                                    <div key={msg.id} className={`msg-wrapper ${msg.type.startsWith('outbound') ? 'outbound' : 'inbound'}`}>

                                        <div className={`msg-bubble ${msg.type === 'outbound_ai' ? 'ai' : msg.type === 'outbound_agent' ? 'agent' : 'customer'}`}>
                                            {msg.text}
                                        </div>

                                        <div className="msg-meta">
                                            {msg.type === 'outbound_ai' && `🤖 AI · ${msg.time} · ${msg.confidence}% confident`}
                                            {msg.type === 'outbound_agent' && `👤 You · ${msg.time}`}
                                            {msg.type === 'inbound' && `${msg.time}`}
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>

                        {/* BOTTOM ACTION BAR */}
                        <div className="chat-input-area">
                            {selectedConvMeta?.status === 'active' ? (
                                <div className="ai-handling-notice">
                                    <p>🤖 AI is actively handling this customer.</p>
                                    <button className="btn-takeover-sm" onClick={handleTakeOver}>Take Over</button>
                                </div>
                            ) : selectedConvMeta?.status === 'closed' ? (
                                <div className="closed-notice">This conversation is marked as closed.</div>
                            ) : (
                                <div className="human-input">
                                    <input
                                        type="text"
                                        placeholder="Type a message to send directly..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                                        disabled={isSending}
                                    />
                                    <button
                                        className="btn-send"
                                        onClick={handleSendReply}
                                        disabled={!replyText.trim() || isSending}
                                    >
                                        {isSending ? '...' : 'Send'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
        /* Core Split Layout Shell */
        .chat-layout {
          display: flex;
          height: calc(100vh - 0px); /* Fill dashboard shell completely natively */
          background: white;
          overflow: hidden;
        }
        
        @media (min-width: 1024px) {
           .chat-layout { margin: -0px; } /* Flush against nav boundaries */
        }
        
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        /* Left Panel */
        .chat-sidebar {
          width: 380px;
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          background: #fafafa;
          z-index: 10;
        }

        .sidebar-header {
           padding: 24px 20px 16px;
           background: white;
        }
        .sidebar-header h2 { font-family: var(--fd); font-size: 24px; font-weight: 700; margin-bottom: 16px; color: var(--text); letter-spacing: -0.5px; }
        
        .search-box {
           position: relative;
           display: flex;
           align-items: center;
        }
        .search-icon { position: absolute; left: 12px; font-size: 14px; opacity: 0.5; }
        .search-box input {
           width: 100%;
           padding: 10px 12px 10px 36px;
           border-radius: 8px;
           border: 1px solid rgba(0,0,0,0.1);
           font-family: var(--fb);
           font-size: 14px;
           outline: none;
           background: #f4f5f7;
           transition: all 0.2s;
        }
        .search-box input:focus { background: white; border-color: var(--or); box-shadow: 0 0 0 2px rgba(255,69,0,0.1); }

        .filter-tabs {
           display: flex;
           gap: 2px;
           padding: 0 16px 12px;
           background: white;
           border-bottom: 1px solid rgba(0,0,0,0.06);
           overflow-x: auto;
        }
        .filter-tabs::-webkit-scrollbar { display: none; }
        
        .filter-tab {
           background: none;
           border: none;
           padding: 8px 12px;
           font-size: 13px;
           font-weight: 600;
           color: var(--text3);
           border-radius: 20px;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 6px;
           transition: all 0.2s;
           white-space: nowrap;
        }
        .filter-tab:hover { background: rgba(0,0,0,0.04); color: var(--text); }
        .filter-tab.active { background: #ffe4db; color: #C2410C; }
        .filter-tab .count { background: rgba(0,0,0,0.08); padding: 2px 6px; border-radius: 10px; font-size: 11px; }
        .filter-tab.active .count { background: rgba(194,65,12,0.15); color: #C2410C; }

        .conv-list {
           flex: 1;
           overflow-y: auto;
        }

        .conv-item {
           padding: 16px 20px;
           display: flex;
           gap: 12px;
           border-bottom: 1px solid rgba(0,0,0,0.04);
           cursor: pointer;
           transition: background 0.2s;
        }
        .conv-item:hover { background: white; }
        .conv-item.selected { background: #eff6ff; border-left: 3px solid #3b82f6; padding-left: 17px; }

        .ci-avatar {
           width: 44px;
           height: 44px;
           border-radius: 50%;
           background: linear-gradient(135deg, #1e3a8a, #3b82f6);
           color: white;
           display: flex;
           align-items: center;
           justify-content: center;
           font-family: var(--fb);
           font-weight: 700;
           font-size: 16px;
           position: relative;
           flex-shrink: 0;
        }
        .unread-dot {
           width: 12px; height: 12px;
           background: #3b82f6;
           border: 2px solid white;
           border-radius: 50%;
           position: absolute;
           top: -2px; right: -2px;
        }

        .ci-content { flex: 1; min-width: 0; }
        .ci-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .ci-name { font-weight: 600; font-size: 15px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ci-time { font-size: 12px; font-weight: 500; color: var(--text3); flex-shrink: 0; }
        .ci-preview { font-size: 13px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
        
        .ci-badges { display: flex; gap: 6px; }
        .chip { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; display: inline-block; }
        .chip-ai { background: #D1FAE5; color: #065F46; }
        .chip-warn { background: #FFF7ED; color: #9A3412; }

        .skeleton-row { height: 70px; background: #e5e7eb; border-radius: 8px; animation: pulse 1.5s infinite; }
        .empty-list { padding: 40px 20px; text-align: center; color: var(--text3); font-size: 14px; font-weight: 500; }

        /* Right Panel */
        .chat-main {
           flex: 1;
           display: flex;
           flex-direction: column;
           background: #f0f2f5;
        }

        .chat-empty {
           flex: 1;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           color: var(--text3);
           background: #f9fafb;
        }
        .ce-icon { font-size: 56px; opacity: 0.2; margin-bottom: 16px; }
        .chat-empty h3 { font-family: var(--fd); font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .chat-empty p { font-size: 14px; }

        .chat-header {
           padding: 16px 24px;
           background: white;
           border-bottom: 1px solid rgba(0,0,0,0.08);
           display: flex;
           justify-content: space-between;
           align-items: center;
           z-index: 10;
        }
        
        .ch-info { display: flex; align-items: center; gap: 12px; }
        .ch-avatar { width: 40px; height: 40px; border-radius: 50%; background: #CBD5E1; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #334155; }
        .ch-details h4 { font-size: 16px; font-weight: 700; color: var(--text); margin: 0; }
        .ch-status { font-size: 12px; font-weight: 600; color: var(--text3); margin-top: 2px; }

        .ch-actions { display: flex; gap: 8px; }
        .btn-takeover { background: var(--or); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255,69,0,0.2); }
        .btn-takeover:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,69,0,0.3); }
        .btn-close { background: white; border: 1px solid rgba(0,0,0,0.15); color: var(--text2); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .btn-close:hover { background: #fafafa; border-color: var(--text); }

        .chat-messages {
           flex: 1;
           overflow-y: auto;
           padding: 24px;
           display: flex;
           flex-direction: column;
           gap: 16px;
           /* Subtle background pattern matching WhatsApp desktop natively */
           background-image: radial-gradient(circle at center, rgba(0,0,0,0.03) 1px, transparent 1px);
           background-size: 20px 20px;
        }

        .messages-loading { text-align: center; color: var(--text3); font-size: 13px; padding: 20px; font-weight: 500; }

        .msg-wrapper { display: flex; flex-direction: column; max-width: 75%; }
        .msg-wrapper.inbound { align-self: flex-start; }
        .msg-wrapper.outbound { align-self: flex-end; align-items: flex-end; }

        .msg-bubble {
           padding: 12px 16px;
           border-radius: 12px;
           font-size: 14.5px;
           line-height: 1.4;
           box-shadow: 0 1px 2px rgba(0,0,0,0.05);
           word-break: break-word;
        }

        .msg-bubble.customer { background: white; border-top-left-radius: 2px; color: var(--text); }
        .msg-bubble.ai { background: linear-gradient(135deg, var(--or), var(--or2)); color: white; border-top-right-radius: 2px; }
        .msg-bubble.agent { background: #1e3a8a; color: white; border-top-right-radius: 2px; }

        .msg-meta { font-size: 11px; font-weight: 600; color: rgba(0,0,0,0.4); margin-top: 4px; }

        /* Input Zone */
        .chat-input-area {
           background: white;
           padding: 16px 24px;
           border-top: 1px solid rgba(0,0,0,0.08);
           position: relative;
        }

        .ai-handling-notice {
           background: #fafafa;
           border: 1px solid rgba(0,0,0,0.06);
           border-radius: 12px;
           padding: 16px;
           display: flex;
           justify-content: space-between;
           align-items: center;
        }
        .ai-handling-notice p { font-size: 14px; font-weight: 600; color: var(--text3); margin: 0; }
        .btn-takeover-sm { background: white; border: 1px solid var(--or); color: var(--or); padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .btn-takeover-sm:hover { background: var(--or); color: white; }

        .closed-notice {
           text-align: center;
           font-size: 14px;
           font-weight: 600;
           color: var(--text3);
           padding: 16px 0;
        }

        .human-input {
           display: flex;
           gap: 12px;
        }
        .human-input input {
           flex: 1;
           padding: 14px 16px;
           border-radius: 24px;
           border: 1px solid rgba(0,0,0,0.1);
           font-family: var(--fb);
           font-size: 15px;
           outline: none;
           background: #fafafa;
           transition: all 0.2s;
        }
        .human-input input:focus { background: white; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
        .human-input input:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-send { background: #3b82f6; color: white; border: none; padding: 0 24px; border-radius: 24px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .btn-send:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
        .btn-send:disabled { opacity: 0.5; background: #9ca3af; cursor: not-allowed; }

        @media (max-width: 768px) {
           .chat-sidebar { width: 100%; display: ${selectedConvId ? 'none' : 'flex'}; }
           .chat-main { display: ${selectedConvId ? 'flex' : 'none'}; }
           /* Insert dummy Back block for mobile layout inside main if necessary */
        }
      `}</style>
        </div>
    );
}
