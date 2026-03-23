'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
      <p className="text-gray-500">Manage your useAI account and organization preferences.</p>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-lg">Profile Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Full Name</span>
            <span className="text-gray-900 font-medium">{user?.fullName || 'Not set'}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Email Address</span>
            <span className="text-gray-900 font-medium">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-lg">Account Actions</h3>
        </div>
        <div className="p-6">
          <button 
            onClick={() => signOut({ redirectUrl: '/' })}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-100"
          >
            Logout session
          </button>
        </div>
      </div>
    </div>
  );
}
