
// PWA registration utility
export function registerPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Create inline service worker
      const swCode = `
        const CACHE_NAME = 'mindflow-v1';
        const urlsToCache = [
          '/',
          '/chat',
          '/journal',
          '/self-care',
          '/progress',
          '/settings'
        ];

        self.addEventListener('install', (event) => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.addAll(urlsToCache);
              })
          );
        });

        self.addEventListener('fetch', (event) => {
          event.respondWith(
            caches.match(event.request)
              .then((response) => {
                if (response) {
                  return response;
                }
                return fetch(event.request);
              }
            )
          );
        });
      `;

      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  // Check for iOS standalone
  const isInWebAppiOS = (window.navigator as any).standalone === true;
  
  return isStandalone || isInWebAppiOS;
}

// Check if PWA install is available
export function isPWAInstallable(): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 1000);
    
    window.addEventListener('beforeinstallprompt', () => {
      clearTimeout(timeout);
      resolve(true);
    }, { once: true });
  });
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
}

// Send local notification
export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
    
    return notification;
  }
}

// Schedule wellness reminders
export function scheduleWellnessReminder(message: string, delayMs: number) {
  setTimeout(() => {
    sendNotification('Mindflow Wellness Reminder', {
      body: message,
      tag: 'wellness-reminder',
      requireInteraction: false,
      actions: [
        {
          action: 'log-mood',
          title: 'Log Mood'
        },
        {
          action: 'open-app',
          title: 'Open App'
        }
      ]
    });
  }, delayMs);
}

