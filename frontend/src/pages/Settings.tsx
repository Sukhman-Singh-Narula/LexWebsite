import React, { useState } from 'react';
import { Bell, Moon, Globe, Shield, Activity, Mail, Smartphone } from 'lucide-react';

interface Settings {
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
    reminders: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
  };
  language: string;
}

type Tab = 'general' | 'notifications' | 'security';

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-md ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    notifications: {
      email: true,
      push: true,
      updates: true,
      reminders: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    },
    language: 'en'
  });

  const handleToggle = (section: keyof Settings, key?: string) => {
    if (key) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section as keyof Settings],
          [key]: !settings[section as keyof Settings][key]
        }
      });
    } else if (typeof settings[section] === 'boolean') {
      setSettings({
        ...settings,
        [section]: !settings[section]
      });
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Moon className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Dark Mode</h3>
            <p className="text-sm text-gray-500">Enable dark mode for the interface</p>
          </div>
        </div>
        <button
          onClick={() => handleToggle('darkMode')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            settings.darkMode ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span className="sr-only">Enable dark mode</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              settings.darkMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Language</h3>
            <p className="text-sm text-gray-500">Select your preferred language</p>
          </div>
        </div>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          className="rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive email updates about your cases</p>
          </div>
        </div>
        <button
          onClick={() => handleToggle('notifications', 'email')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            settings.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">Get push notifications on your devices</p>
          </div>
        </div>
        <button
          onClick={() => handleToggle('notifications', 'push')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            settings.notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Case Updates</h3>
            <p className="text-sm text-gray-500">Get notified about case status changes</p>
          </div>
        </div>
        <button
          onClick={() => handleToggle('notifications', 'updates')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            settings.notifications.updates ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              settings.notifications.updates ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
    const renderSecuritySettings = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Shield className="h-5 w-5 text-gray-400" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
        </div>
      </div>
      <button
        onClick={() => handleToggle('security', 'twoFactor')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
          settings.security.twoFactor ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Activity className="h-5 w-5 text-gray-400" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">Session Activity</h3>
          <p className="text-sm text-gray-500">View and manage active sessions</p>
        </div>
      </div>
      <button className="text-indigo-600 hover:underline">Manage</button>
    </div>
  </div>
);
}