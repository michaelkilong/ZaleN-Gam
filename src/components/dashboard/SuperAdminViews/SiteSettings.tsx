'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Settings } from 'lucide-react';

interface Setting {
  _id: string;
  key: string;
  value: string;
}

export function SiteSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/staff/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/staff/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (response.ok) {
        setSuccess('Setting updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update setting');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const settingLabels: Record<string, string> = {
    site_name: 'Site Name',
    site_description: 'Site Description',
    contact_email: 'Contact Email',
    articles_per_page: 'Articles Per Page',
    enable_comments: 'Enable Comments',
    maintenance_mode: 'Maintenance Mode',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Site Settings
        </h2>
        <p className="text-muted-foreground mt-1">Configure global site settings</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-md bg-green-50 text-green-600 flex items-center gap-2">
          <Check className="h-5 w-5" />
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading settings...</div>
      ) : (
        <div className="grid gap-4">
          {settings.map((setting) => (
            <Card key={setting._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium block mb-1">
                      {settingLabels[setting.key] || setting.key}
                    </label>
                    <Input
                      value={setting.value}
                      onChange={(e) => {
                        const newSettings = settings.map(s =>
                          s._id === setting._id ? { ...s, value: e.target.value } : s
                        );
                        setSettings(newSettings);
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => handleUpdate(setting.key, setting.value)}
                    disabled={saving}
                    className="mt-6"
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
