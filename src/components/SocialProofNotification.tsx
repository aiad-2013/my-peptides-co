import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const firstNames = [
  'James', 'Sarah', 'Michael', 'Emma', 'Daniel', 'Olivia', 'David', 'Sophie',
  'Chris', 'Mia', 'Ryan', 'Chloe', 'Matthew', 'Emily', 'Luke', 'Jessica',
  'Nathan', 'Hannah', 'Jake', 'Isabella', 'Ben', 'Ava', 'Tom', 'Grace',
  'Alex', 'Lily', 'Sam', 'Charlotte', 'Josh', 'Amelia',
];

const products = [
  'Growth - MK677',
  'RAD 140 - Testolone',
  'Ligandrol - LGD-4033',
  'Ostarine - MK2866',
  'Cardarine - GW501516',
  'BPC-157',
  'TB-500',
  'CJC-1295 DAC',
  'PT-141',
  'Andarine - S4',
];

const locations = [
  'Sydney, AU', 'Melbourne, AU', 'Brisbane, AU', 'Perth, AU',
  'Adelaide, AU', 'Gold Coast, AU', 'Canberra, AU', 'Hobart, AU',
  'Newcastle, AU', 'Darwin, AU',
];

const lowStockProducts = [
  { name: 'Growth - MK677', left: 4 },
  { name: 'BPC-157', left: 3 },
  { name: 'Ipamorelin', left: 5 },
  { name: 'TB-500', left: 4 },
  { name: 'RAD 140 - Testolone', left: 6 },
];

function getTimeAgo(): string {
  const minutes = Math.floor(Math.random() * 45) + 2;
  if (minutes < 60) return `${minutes} minutes ago`;
  return `1 hour ago`;
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
        name: `${name} ${name[0]}.`,
        product: getRandomItem(products),
        location: getRandomItem(locations),
        timeAgo: getTimeAgo(),
      });
    } else {
      const item = getRandomItem(lowStockProducts);
      setNotification({
        type: 'low_stock',
        product: item.name,
        stockLeft: item.left,
      });
    }

    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(showNotification, 8000);
    const interval = setInterval(() => {
      const delay = Math.random() * 15000 + 15000;
      setTimeout(showNotification, delay);
    }, 25000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [showNotification]);

  const isPurchase = notification.type === 'purchase';

  return (
    <div
      className={cn(
        "fixed bottom-5 left-5 z-50 max-w-xs w-full transition-all duration-500 ease-out pointer-events-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="pointer-events-auto bg-card rounded-lg border border-border shadow-lg p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isPurchase ? "bg-accent/20" : "bg-destructive/15"
        )}>
          {isPurchase
            ? <ShoppingBag className="w-5 h-5 text-accent" />
            : <AlertTriangle className="w-5 h-5 text-destructive" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isPurchase ? (
            <>
              <p className="text-sm text-foreground">
                <span className="font-semibold">{notification.name}</span>{' '}
                <span className="text-muted-foreground">just purchased</span>
              </p>
              <p className="text-sm font-medium text-foreground truncate">{notification.product}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.timeAgo} • {notification.location}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-destructive">Low Stock Alert</p>
              <p className="text-sm font-medium text-foreground truncate">{notification.product}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Only <strong className="text-destructive">{notification.stockLeft} units</strong> remaining
              </p>
            </>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
