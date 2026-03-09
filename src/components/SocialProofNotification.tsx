import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const firstNames = [
  'James', 'Sarah', 'Michael', 'Emma', 'Daniel', 'Olivia', 'David', 'Sophie',
  'Chris', 'Mia', 'Ryan', 'Chloe', 'Matthew', 'Emily', 'Luke', 'Jessica',
  'Nathan', 'Hannah', 'Jake', 'Isabella', 'Ben', 'Ava', 'Tom', 'Grace',
  'Alex', 'Lily', 'Sam', 'Charlotte', 'Josh', 'Amelia',
];

const purchaseEvents = [
  { product: 'Growth — MK677', extra: null },
  { product: 'RAD 140 — Testolone', extra: null },
  { product: 'Ligandrol — LGD-4033', extra: null },
  { product: 'Ostarine — MK2866', extra: null },
  { product: 'Cardarine — GW501516', extra: null },
  { product: 'BPC-157', extra: null },
  { product: 'TB-500', extra: null },
  { product: 'CJC-1295 DAC', extra: null },
  { product: 'PT-141', extra: null },
  { product: 'Andarine — S4', extra: null },
  { product: 'RAD 140 — Testolone', extra: '& 1 more' },
  { product: 'Growth — MK677', extra: '& 2 more' },
  { product: 'BPC-157', extra: '& 1 more' },
];

const lowStockProducts = [
  { name: 'Growth — MK677', left: 4 },
  { name: 'BPC-157', left: 3 },
  { name: 'Ipamorelin', left: 5 },
  { name: 'TB-500', left: 4 },
  { name: 'RAD 140 — Testolone', left: 6 },
];

const locations = [
  'Sydney', 'Melbourne', 'Brisbane', 'Perth',
  'Adelaide', 'Gold Coast', 'Canberra', 'Hobart',
];

function getTimeAgo(): string {
  const n = Math.floor(Math.random() * 8) + 1;
  if (n === 1) return 'just now';
  return `${n} minutes ago`;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Deterministic avatar colour from name
function avatarColor(name: string): string {
  const colours = [
    'hsl(176 70% 36%)',   // teal
    'hsl(213 22% 28%)',   // charcoal-mid
    'hsl(196 70% 40%)',   // steel blue
    'hsl(158 50% 38%)',   // sage
    'hsl(220 60% 42%)',   // indigo
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return colours[h % colours.length];
}

type NotificationType = 'purchase' | 'low_stock';

interface Notification {
  type: NotificationType;
  name?: string;
  product: string;
  extra?: string | null;
  location?: string;
  timeAgo?: string;
  stockLeft?: number;
}

export const SocialProofNotification = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<Notification>({
    type: 'purchase',
    name: 'Alex',
    product: 'Growth — MK677',
    location: 'Melbourne',
    timeAgo: '3 minutes ago',
  });

  const showNotification = useCallback(() => {
    const type: NotificationType = Math.random() < 0.72 ? 'purchase' : 'low_stock';

    if (type === 'purchase') {
      const name = getRandomItem(firstNames);
      const event = getRandomItem(purchaseEvents);
      setNotification({
        type: 'purchase',
        name,
        product: event.product,
        extra: event.extra,
        location: getRandomItem(locations),
        timeAgo: getTimeAgo(),
      });
    } else {
      const item = getRandomItem(lowStockProducts);
      setNotification({ type: 'low_stock', product: item.name, stockLeft: item.left });
    }

    setVisible(true);
    setTimeout(() => setVisible(false), 6000);
  }, []);

  useEffect(() => {
    const init = setTimeout(showNotification, 8000);
    const interval = setInterval(() => {
      setTimeout(showNotification, Math.random() * 12000 + 18000);
    }, 28000);
    return () => { clearTimeout(init); clearInterval(interval); };
  }, [showNotification]);

  const isPurchase = notification.type === 'purchase';
  const initials = notification.name ? notification.name.slice(0, 2).toUpperCase() : '??';
  const bgColor = notification.name ? avatarColor(notification.name) : 'hsl(176 70% 36%)';

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-50 pointer-events-none transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="pointer-events-auto bg-card border border-border/60 rounded-2xl shadow-[0_8px_40px_hsl(213_22%_12%/0.14),0_2px_8px_hsl(213_22%_12%/0.08)] flex items-center gap-0 overflow-hidden w-80">

        {/* Left colour strip */}
        <div
          className="w-1 self-stretch flex-shrink-0"
          style={{ background: isPurchase ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground) / 0.4)' }}
        />

        {/* Avatar */}
        <div className="flex-shrink-0 pl-4 pr-3 py-4">
          {isPurchase ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: bgColor }}
            >
              {initials}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
              📦
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-3.5 pr-2">
          {isPurchase ? (
            <>
              <p className="text-xs text-muted-foreground leading-none mb-1">
                <span className="font-semibold text-foreground">{notification.name}</span> just purchased
              </p>
              <p className="text-sm font-semibold text-foreground leading-snug truncate">
                {notification.product}
                {notification.extra && (
                  <span className="text-accent font-medium"> {notification.extra}</span>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wide">
                {notification.timeAgo} · {notification.location}, AU
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-none mb-1 uppercase tracking-widest">
                Low inventory
              </p>
              <p className="text-sm font-semibold text-foreground leading-snug truncate">
                {notification.product}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wide">
                {notification.stockLeft} units remaining
              </p>
            </>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 pr-3 pl-1 self-start pt-3 text-muted-foreground/30 hover:text-muted-foreground transition-colors duration-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
