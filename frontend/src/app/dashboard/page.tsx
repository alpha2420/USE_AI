'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import { RefreshCw, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useUser();
  const [showQR, setShowQR] = useState(false);

  const whatsappMutation = useMutation({
    mutationFn: () => api.post('/whatsapp/connect'),
    onSuccess: () => {
      setShowQR(true);
      toast.success('Connection request sent!');
    },
    onError: () => {
      toast.error('Failed to request WhatsApp connection');
    }
  });

  const { data: whatsappStatus, refetch } = useQuery({
    queryKey: ['whatsappStatus'],
    queryFn: () => api.get('/whatsapp/status').then(res => res.data),
    refetchInterval: 2000,
  });

  const status = whatsappStatus?.status || 'unknown';

  useEffect(() => {
    if (status === 'connected') {
      setShowQR(false);
    }
  }, [status]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your useAI system connections.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Ready</span>
          {/* <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Training</span> */}
        </div>
      </div>
      
      {/* Onboarding Message */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-6 border border-orange-200/50 shadow-sm">
        <h3 className="font-bold text-orange-900 mb-4 text-lg">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="text-orange-600 font-bold mb-1">Step 1</div>
            <div className="text-gray-800 font-medium">Connect WhatsApp</div>
            <div className="text-xs text-gray-500 mt-1">Scan the QR to link your agent.</div>
          </div>
          <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="text-orange-600 font-bold mb-1">Step 2</div>
            <div className="text-gray-800 font-medium">Upload knowledge</div>
            <div className="text-xs text-gray-500 mt-1">Provide URLs or PDFs for AI training.</div>
          </div>
          <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="text-orange-600 font-bold mb-1">Step 3</div>
            <div className="text-gray-800 font-medium">Start chatting</div>
            <div className="text-xs text-gray-500 mt-1">AI automatically replies to customers.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* WhatsApp Connection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-500" />
              WhatsApp Node
            </h3>
            <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw className={`w-5 h-5 ${whatsappMutation.isPending ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Connection Status</span>
              {status === 'connected' && <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-semibold border border-green-200">Connected</span>}
              {status === 'connecting' && <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200">Connecting...</span>}
              {(status === 'disconnected' || status === 'unknown') && <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-semibold border border-red-200">Disconnected</span>}
            </div>

            {(status === 'disconnected' || status === 'unknown') && (
              <button 
                onClick={() => whatsappMutation.mutate()} 
                disabled={whatsappMutation.isPending} 
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {whatsappMutation.isPending ? 'Requesting Connection...' : 'Connect WhatsApp'}
              </button>
            )}
            
            {status === 'connected' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100 mt-4">
                <p className="text-green-800 text-sm">Your proxy node is actively listening. Incoming messages will be automatically routed to your AI agent.</p>
              </div>
            )}
            {status === 'connecting' && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 mt-4">
                <p className="text-yellow-800 text-sm">Attempting to establish a stable websocket connection to WhatsApp...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal for Whatsapp */}
      {showQR && whatsappMutation.data?.data?.qr && status !== 'connected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Scan to Link Device</h3>
              <p className="text-sm text-gray-500 mb-6">Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device. Point your camera at this QR code.</p>
              <div className="bg-gray-50 p-4 rounded-xl inline-block border border-gray-100">
                <img src={whatsappMutation.data.data.qr} alt="WhatsApp QR Code" className="w-56 h-56 mx-auto mix-blend-multiply" />
              </div>
              <button onClick={() => setShowQR(false)} className="mt-6 w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
