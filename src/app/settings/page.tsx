'use client';

import { useState, useEffect } from 'react';
import { Save, Keyboard, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Settings {
  id: string;
  normalMoveAmount: number;
  shiftMoveAmount: number;
  defaultBackgroundVisible: boolean;
}

export default function Page() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [normalMoveAmount, setNormalMoveAmount] = useState<string>('0.5');
  const [shiftMoveAmount, setShiftMoveAmount] = useState<string>('1.0');
  const [defaultBackgroundVisible, setDefaultBackgroundVisible] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      const data = await response.json();
      setSettings(data.settings);
      setNormalMoveAmount(data.settings.normalMoveAmount.toString());
      setShiftMoveAmount(data.settings.shiftMoveAmount.toString());
      setDefaultBackgroundVisible(data.settings.defaultBackgroundVisible);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const normalValue = parseFloat(normalMoveAmount);
      const shiftValue = parseFloat(shiftMoveAmount);

      // Validation
      if (isNaN(normalValue) || normalValue <= 0 || normalValue > 10) {
        toast({ title: 'Error', description: 'Normal move amount must be between 0 and 10 mm', variant: 'error' });
        return;
      }

      if (isNaN(shiftValue) || shiftValue <= 0 || shiftValue > 10) {
        toast({ title: 'Error', description: 'Shift move amount must be between 0 and 10 mm', variant: 'error' });
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({
          normalMoveAmount: normalValue,
          shiftMoveAmount: shiftValue,
          defaultBackgroundVisible,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      toast({ title: 'Success', description: 'Settings saved successfully', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save settings', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setNormalMoveAmount(settings.normalMoveAmount.toString());
      setShiftMoveAmount(settings.shiftMoveAmount.toString());
      setDefaultBackgroundVisible(settings.defaultBackgroundVisible);
      toast({ title: 'Info', description: 'Values reset to saved settings', variant: 'info' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure application behavior and preferences</p>
        </div>

        {/* Keyboard Movement Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Keyboard className="text-amber-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Keyboard Movement</h2>
                <p className="text-sm text-gray-600">Configure field movement distances in Certificate Designer</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Normal Move Amount */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Normal Arrow Key Movement
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={normalMoveAmount}
                      onChange={(e) => setNormalMoveAmount(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      placeholder="0.5"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-medium">mm</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Distance to move when pressing arrow keys (without Shift)
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-[-30px] px-4 py-2 bg-gray-100 rounded-lg">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↑</kbd>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↓</kbd>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">←</kbd>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">→</kbd>
                </div>
              </div>
            </div>

            {/* Shift Move Amount */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Shift + Arrow Key Movement
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={shiftMoveAmount}
                      onChange={(e) => setShiftMoveAmount(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      placeholder="1.0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-medium">mm</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Distance to move when pressing Shift + arrow keys (for faster movement)
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-[-30px] px-4 py-2 bg-gray-100 rounded-lg">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Shift</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↑→↓←</kbd>
                </div>
              </div>
            </div>

            {/* Default Background Visibility */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <label className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-gray-700">Default Background Visibility</span>
                  <p className="mt-1 text-sm text-gray-500">
                    Default setting for background visibility when issuing new certificates
                  </p>
                </div>
                <button
                  onClick={() => setDefaultBackgroundVisible(!defaultBackgroundVisible)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    defaultBackgroundVisible ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  type="button"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      defaultBackgroundVisible ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Note:</h3>
              <p className="text-sm text-blue-700">
                These settings control how much certificate template fields move when you use arrow keys
                in the Certificate Designer. Use smaller values for precise positioning and larger values
                for quick adjustments.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} />
              Reset
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
