import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';

const credsSchema = z.object({
  email: z.string().trim().email('Enter a valid email').max(255),
  password: z.string().min(8, 'Min 8 characters').max(72),
});

export default function AdminAuth() {
  useSEO({ title: 'Admin Sign In', description: 'Internal admin access', noindex: true });
  const guard = useAdminGuard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (guard.status === 'admin') return <Navigate to="/admin" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: 'Invalid input', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        navigate('/admin');
      } else {
        const { error } = await supabase.auth.signUp({
          ...parsed.data,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast({ title: 'Account created', description: 'Ask the project owner to grant admin role.' });
      }
    } catch (err) {
      toast({ title: 'Auth error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold">Admin {mode === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
          <p className="text-sm text-muted-foreground">Internal diagnostics access only.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
          <button type="button" onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
            {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
          {guard.status === 'authenticated-not-admin' && (
            <p className="text-xs text-destructive text-center">
              Signed in as {guard.email} but no admin role granted yet.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
