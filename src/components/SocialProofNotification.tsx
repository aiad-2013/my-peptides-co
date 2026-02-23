import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag } from 'lucide-react';
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

function getTimeAgo(): string {
  const minutes = Math.floor(Math.random() * 45) + 2;
  if (minutes < 60) return `${minutes} minutes ago`;
  return `1 hour ago`;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SocialProofNotification = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({
    name: '',
    initial: '',
    product: '',
    location: '',
    timeAgo: '',
  });

  const showNotification = useCallback(() => {
    const name = getRandomItem(firstNames);
    setNotification({
      name: `${name} ${name[0]}.`,
      initial: name[0],
      product: getRandomItem(products),
      location: getRandomItem(locations),
      timeAgo: getTimeAgo(),
    });
    setVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    // First notification after 8 seconds
    const initialTimeout = setTimeout(showNotification, 8000);

    // Then every 15-30 seconds
    const interval = setInterval(() => {
      const delay = Math.random() * 15000 + 15000;
      setTimeout(showNotification, delay);
    }, 25000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [showNotification]);

  return (
    <div
      className={cn(
        "fixed bottom-5 left-5 z-50 max-w-xs w-full transition-all duration-500 ease-out pointer-events-none",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      )}
    >
      <div className="pointer-events-auto bg-card rounded-lg border border-border shadow-lg p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-accent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{notification.name}</span>{' '}
            <span className="text-muted-foreground">just purchased</span>
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {notification.product}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {notification.timeAgo} • {notification.location}
          </p>
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
