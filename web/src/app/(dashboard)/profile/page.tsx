'use client';

import { User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-20 w-20 rounded-full bg-vstep-blue flex items-center justify-center text-white text-2xl font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">Target Level: {user?.targetLevel || 'Not set'}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Email</span>
              </div>
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Target Level</span>
              </div>
              <span className="text-vstep-blue font-medium">{user?.targetLevel || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
