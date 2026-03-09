import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const firstNames = [
  'James', 'Sarah', 'Michael', 'Emma', 'Daniel', 'Olivia', 'David', 'Sophie',
  'Chris', 'Mia', 'Ryan', 'Chloe', 'Matthew', 'Emily', 'Luke', 'Jessica',
  'Nathan', 'Hannah', 'Jake', 'Isabella', 'Ben', 'Ava', 'Tom', 'Grace',
  'Alex', 'Lily', 'Sam', 'Charlotte', 'Josh', 'Amelia',
];

const products = [
  'Growth — MK677',
  'RAD 140 — Testolone',
  'Ligandrol — LGD-4033',
  'Ostarine — MK2866',
  'Cardarine — GW501516',
  'BPC-157',
  'TB-500',
  'CJC-1295 DAC',
  'PT-141',
  'Andarine — S4',
];

const locations = [
  'Sydney', 'Melbourne', 'Brisbane', 'Perth',
  'Adelaide', 'Gold Coast', 'Canberra', 'Hobart',
  'Newcastle', 'Darwin',
];

const lowStockProducts = [
  { name: 'Growth — MK677', left: 4 },
  { name: 'BPC-157', left: 3 },
  { name: 'Ipamorelin', left: 5 },
  { name: 'TB-500', left: 4 },
  { name: 'RAD 140 — Testolone', left: 6 },
];

function getTimeAgo(): string {
  const minutes = Math.floor(Math.random() * 50) + 3;
  return `${minutes}m ago`;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type NotificationType = 'purchase' | 'low_stock';

interface Notification {
  type: NotificationType;
  name?: string;
  product: string;
  location?: string;
  timeAgo?: string;
  stockLeft?: number;
}

export const SocialProofNotification = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<Notification>({
    type: 'purchase',
    name: '',
    product: '',
    location: '',
    timeAgo: '',
  });

  const showNotification = useCallback((forceType?: NotificationType) => {
    const type: NotificationType = forceType ?? (Math.random() < 0.65 ? 'purchase' : 'low_stock');

    if (type === 'purchase') {
      const name = getRandomItem(firstNames);
      setNotification({
        type: 'purchase',
        name,
        product: getRandomItem(products),
        location: getRandomItem(locations),
        timeAgo: getTimeAgo(),
      });
    } else {
      const item = getRandomItem(lowStockProducts);
      setNotification({ type: 'low_stock', product: item.name, stockLeft: item.left });
    }

    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(showNotification, 10000);
    const interval = setInterval(() => {
      setTimeout(showNotification, Math.random() * 15000 + 20000);
    }, 30000);
    return () => { clearTimeout(initialTimeout); clearInterval(interval); };
  }, [showNotification]);

  const isPurchase = notification.type === 'purchase';

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-50 w-72 pointer-events-none transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <div className="pointer-events-auto bg-card border border-border/80 rounded-sm shadow-[0_8px_32px_hsl(213_22%_12%/0.1)] p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center",
          isPurchase ? "bg-accent/10" : "bg-muted"
        )}>
          {isPurchase
            ? <ShoppingBag className="w-4 h-4 text-accent" />
            : <AlertCircle className="w-4 h-4 text-muted-foreground" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isPurchase ? (
            <>
              <p className="text-xs text-foreground leading-snug">
                <span className="font-medium">{notification.name}</span>
                <span className="text-muted-foreground"> purchased</span>
              </p>
              <p className="text-xs font-medium text-foreground truncate mt-0.5">{notification.product}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wide">
                {notification.location} · {notification.timeAgo}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Low inventory</p>
              <p className="text-xs font-medium text-foreground truncate mt-0.5">{notification.product}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wide">
                {notification.stockLeft} units remaining
              </p>
            </>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
