'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Check } from 'lucide-react';

interface CreateWriterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateWriterModal({ onClose, onSuccess }: CreateWriterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'AUTHOR',
    temporaryPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/staff/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedUser(data.user);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (createdUser) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Writer Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p><strong>Name:</strong> {createdUser.name}</p>
              <p><strong>Role:</strong> {createdUser.role}</p>
              <p><strong>Temporary Password:</strong> {formData.temporaryPassword}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please share these credentials securely with the new writer. They will be required to change their password on first login.
            </p>
            <Button onClick={onSuccess} className="w-full">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Writer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email (optional)</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Role *</label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTHOR">Author</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Temporary Password *</label>
            <Input
              type="password"
              value={formData.temporaryPassword}
              onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Writer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
