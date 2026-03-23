'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function TestChat() {
  const { isLoaded, user } = useUser();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const chatMutation = useMutation({
    mutationFn: (newQuestion: string) => api.post('/chat/test', { question: newQuestion }),
    onSuccess: (data: any) => {
      setHistory((prev) => [
        ...prev,
        { role: 'ai', text: data.data.reply },
      ]);
      toast.success('Reply received');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to send message'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setHistory((prev) => [
        ...prev,
        { role: 'user', text: question.trim() },
      ]);
      chatMutation.mutate(question.trim());
      setQuestion('');
    }
  };

  if (!isLoaded || !user) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between z-10 sticky top-0">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Test Chat Sandbox</h2>
          <p className="text-sm text-gray-500">Interact natively with your active knowledge base embeddings.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Ready to Test
        </div>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
             <div className="p-4 bg-orange-50 text-orange-600 rounded-full">
               <Bot className="w-10 h-10" />
             </div>
             <p className="text-gray-500 max-w-sm">No messages yet. Try asking your AI Agent a question regarding the Knowledge base you uploaded!</p>
          </div>
        ) : (
          history.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={clsx("flex gap-4 w-full animate-in slide-in-from-bottom-2 duration-300", isUser ? "flex-row-reverse" : "flex-row")}>
                
                {/* Avatar */}
                <div className={clsx(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                  isUser ? "bg-orange-600 text-white" : "bg-gray-800 text-white"
                )}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={clsx(
                  "max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
                  isUser 
                    ? "bg-orange-600 text-white rounded-tr-sm" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing Placeholder */}
        {chatMutation.isPending && (
          <div className="flex gap-4 w-full animate-in fade-in duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-gray-800 text-white">
               <Bot className="w-4 h-4" />
            </div>
            <div className="px-5 py-4 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow text-sm"
          placeholder="Ask a question..."
          disabled={chatMutation.isPending}
        />
        <button
          type="submit"
          disabled={chatMutation.isPending || !question.trim()}
          className="flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {chatMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
