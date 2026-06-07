'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Log {
  _id: string;
  action: string;
  userId?: { name: string };
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export function SystemLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/staff/logs?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to load logs');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const actionColors: Record<string, string> = {
    STAFF_LOGIN: 'bg-blue-100 text-blue-800',
    PASSWORD_CHANGE: 'bg-yellow-100 text-yellow-800',
    ARTICLE_CREATE: 'bg-green-100 text-green-800',
    ARTICLE_UPDATE: 'bg-orange-100 text-orange-800',
    ARTICLE_DELETE: 'bg-red-100 text-red-800',
    USER_CREATE: 'bg-purple-100 text-purple-800',
    CATEGORY_CREATE: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="h-6 w-6" />
          System Logs
        </h2>
        <p className="text-muted-foreground mt-1">Track all staff actions</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No logs found</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <Badge className={actionColors[log.action] || 'bg-gray-100'}>
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.userId?.name || 'System'}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.details || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress || 'N/A'}</TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
