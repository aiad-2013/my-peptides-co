import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { CheckCircle2, XCircle, Loader2, RefreshCw, LogOut } from 'lucide-react';

interface Check { name: string; ok: boolean; detail: string; meta?: Record<string, unknown>; }

export default function Admin() {
  useSEO({ title: 'Admin Diagnostics', description: 'Internal diagnostics dashboard' });
  const guard = useAdminGuard();
  const { toast } = useToast();
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [running, setRunning] = useState(false);
  const [syncTarget, setSyncTarget] = useState('');
  const [syncResult, setSyncResult] = useState<unknown>(null);
  const [syncing, setSyncing] = useState(false);

  if (guard.status === 'loading') {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (guard.status !== 'admin') return <Navigate to="/admin/login" replace />;

  async function callDiagnostics(action: string, payload: Record<string, unknown> = {}) {
    const { data, error } = await supabase.functions.invoke('admin-diagnostics', {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async function runHealthChecks() {
    setRunning(true); setChecks(null);
    try {
      const data = await callDiagnostics('health');
      setChecks(data.checks as Check[]);
    } catch (e) {
      toast({ title: 'Health check failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    } finally { setRunning(false); }
  }

  async function syncFull() {
    setSyncing(true); setSyncResult(null);
    try {
      const data = await callDiagnostics('sync-full');
      setSyncResult(data);
      toast({ title: 'Full sync complete' });
    } catch (e) {
      toast({ title: 'Sync failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    } finally { setSyncing(false); }
  }

  async function syncOne() {
    if (!syncTarget.trim()) return;
    setSyncing(true); setSyncResult(null);
    try {
      const isNumeric = /^\d+$/.test(syncTarget.trim());
      const payload = isNumeric ? { wooCommerceId: parseInt(syncTarget, 10) } : { slug: syncTarget.trim() };
      const data = await callDiagnostics('sync-one', payload);
      setSyncResult(data);
      toast({ title: 'Single product sync complete' });
    } catch (e) {
      toast({ title: 'Sync failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    } finally { setSyncing(false); }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Diagnostics</h1>
            <p className="text-sm text-muted-foreground">Signed in as {guard.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
        </header>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Connection Health</h2>
            <Button onClick={runHealthChecks} disabled={running}>
              {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running…</> : <><RefreshCw className="h-4 w-4 mr-2" />Run checks</>}
            </Button>
          </div>
          {!checks && !running && <p className="text-sm text-muted-foreground">Click "Run checks" to test API + webhook + cache.</p>}
          {checks && (
            <ul className="space-y-3">
              {checks.map((c, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-md border">
                  {c.ok ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <Badge variant={c.ok ? 'default' : 'destructive'}>{c.ok ? 'OK' : 'FAIL'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Trigger Product Sync</h2>
          <p className="text-sm text-muted-foreground">Force a re-pull from WooCommerce. Runs the same path webhooks use.</p>
          <div className="flex flex-wrap gap-3 items-end">
            <Button onClick={syncFull} disabled={syncing} variant="default">
              {syncing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing…</> : 'Sync all products'}
            </Button>
            <div className="flex gap-2 items-end">
              <div className="space-y-1">
                <Label htmlFor="target" className="text-xs">Slug or WC ID</Label>
                <Input id="target" value={syncTarget} onChange={e => setSyncTarget(e.target.value)} placeholder="testolone-rad140 or 360" className="w-64" />
              </div>
              <Button onClick={syncOne} disabled={syncing || !syncTarget.trim()} variant="outline">Sync one</Button>
            </div>
          </div>
          {syncResult !== null && (
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">{JSON.stringify(syncResult, null, 2)}</pre>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">Webhook URL</h2>
          <p className="text-sm text-muted-foreground">Configure this URL in WooCommerce → Settings → Advanced → Webhooks.</p>
          <code className="block text-xs bg-muted p-3 rounded break-all">
            {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/woocommerce-webhook`}
          </code>
        </Card>
      </div>
    </div>
  );
}
