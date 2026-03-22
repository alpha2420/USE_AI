'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Phone, Clock, MessageCircle, Send, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function ConversationsPage() {
  const { isLoaded, user } = useUser();
  const [selectedConv, setSelectedConv] = useState<any>(null);

  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/chat/conversations').then(res => res.data),
    refetchInterval: 5000,
  });

  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', selectedConv?.id],
    queryFn: () => api.get(`/chat/conversations/${selectedConv.id}/messages`).then(res => res.data),
    enabled: !!selectedConv?.id,
    refetchInterval: 5000,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isLoaded) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold text-gray-800">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs && !conversations && <div className="p-4 text-center text-sm text-gray-500 flex justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>}
          
          {conversations?.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No conversations yet
            </div>
          )}

          {conversations?.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={clsx(
                "w-full text-left p-4 border-b border-gray-100 hover:bg-orange-50 transition-colors flex flex-col gap-1 focus:outline-none",
                selectedConv?.id === conv.id ? "bg-orange-50 border-l-4 border-l-orange-500" : "bg-white border-l-4 border-transparent"
              )}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {conv.customer_phone}
                </span>
                {conv.status === 'active' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                Active
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="w-2/3 flex flex-col bg-gray-50/50 relative">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10 sticky top-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  {selectedConv.customer_phone.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 tracking-tight">{selectedConv.customer_phone}</h3>
                  <p className="text-xs text-green-600 font-medium tracking-wide">● Online</p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingMsgs ? (
                <div className="flex justify-center mt-10 text-gray-400"><Loader2 className="animate-spin w-6 h-6" /></div>
              ) : messages?.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10">No messages found for this thread</div>
              ) : (
                messages?.map((msg: any) => {
                  const isAi = msg.direction === 'outbound';
                  return (
                    <div key={msg.id} className={clsx("flex w-full", isAi ? "justify-end" : "justify-start")}>
                      <div className={clsx(
                        "max-w-[75%] rounded-2xl px-5 py-3 shadow-sm",
                        isAi 
                          ? "bg-orange-500 text-white rounded-br-sm" 
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                      )}>
                        <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <p className={clsx("text-[10px] mt-2 text-right", isAi ? "text-orange-200" : "text-gray-400")}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Fake View (Read Only) */}
            <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
               <input 
                  type="text" 
                  disabled
                  placeholder="Replies are fully automated by AI..." 
                  className="flex-1 border border-gray-300 rounded-full px-4 text-sm bg-gray-50 opacity-60 cursor-not-allowed" 
               />
               <button disabled className="p-3 bg-gray-200 text-gray-400 rounded-full cursor-not-allowed">
                  <Send className="w-5 h-5 -ml-1" />
               </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <MessageCircle className="w-16 h-16 opacity-20" />
            <p className="text-sm font-medium tracking-wide text-gray-500">Select a conversation to view transcript</p>
          </div>
        )}
      </div>

    </div>
  );
}
