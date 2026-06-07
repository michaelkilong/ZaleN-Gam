'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Check, AlertCircle } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-muted rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5" />
        <h3 className="font-semibold">Subscribe to Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Get the latest news delivered to your inbox.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-5 w-5" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{message}</span>
        </div>
      )}
    </div>
  );
}
