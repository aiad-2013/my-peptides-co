import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Subscribes to WooCommerce product changes via Supabase Realtime.
 * When a product is updated/created/deleted in WooCommerce, the webhook
 * bumps `cache_invalidations.products.updated_at`, which triggers this
 * listener to immediately refetch the products query.
 */
export function useProductCacheSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('product-cache-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cache_invalidations',
          filter: 'id=eq.products',
        },
        () => {
          console.log('[ProductCacheSync] Product data changed in WooCommerce — refetching...');
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
