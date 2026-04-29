import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export type AdminState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated-not-admin'; email: string }
  | { status: 'admin'; email: string; session: Session };

export function useAdminGuard(): AdminState {
  const [state, setState] = useState<AdminState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function evaluate(session: Session | null) {
      if (!session) { if (!cancelled) setState({ status: 'unauthenticated' }); return; }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (cancelled) return;
      const email = session.user.email ?? '';
      if (error || !data) setState({ status: 'authenticated-not-admin', email });
      else setState({ status: 'admin', email, session });
    }

    // Listener FIRST, then getSession
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase calls to avoid deadlocks inside the callback
      setTimeout(() => evaluate(session), 0);
    });
    supabase.auth.getSession().then(({ data: { session } }) => evaluate(session));

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}
