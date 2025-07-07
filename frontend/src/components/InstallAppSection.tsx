import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Monitor, Wifi, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallAppSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success('Mindflow installed successfully! 🎉');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show detailed installation instructions based on device/browser
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
        instructions = 'Chrome: Look for the install icon (⊞) in the address bar, or go to Menu > Install Mindflow';
      } else if (userAgent.includes('firefox')) {
        instructions = 'Firefox: Menu > Add to Home screen (mobile) or use "Install" if available';
      } else if (userAgent.includes('safari')) {
        if (userAgent.includes('mobile')) {
          instructions = 'Safari (iOS): Tap Share button (□↗) → Add to Home Screen';
        } else {
          instructions = 'Safari (Mac): File > Add to Dock or look for install options in the address bar';
        }
      } else if (userAgent.includes('edge')) {
        instructions = 'Edge: Look for the install icon (⊞) in the address bar, or go to Settings > Apps > Install Mindflow';
      } else {
        instructions = 'Look for "Install App", "Add to Home Screen", or a ⊞ install icon in your browser\'s menu or address bar';
      }
      
      toast.info(instructions, { duration: 8000 });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Installing Mindflow...');
      } else {
        toast.info('Install cancelled');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
      toast.error('Installation failed. Please try using your browser\'s install option.');
    }
  };

  if (isInstalled) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              App Installed! ✅
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              Mindflow is now installed as a native app
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Install Mindflow App
              </h3>
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Get the full app experience with offline access, notifications, and faster loading.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Wifi className="w-4 h-4" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Bell className="w-4 h-4" />
                <span>Wellness reminders</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Monitor className="w-4 h-4" />
                <span>Full-screen mode</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Smartphone className="w-4 h-4" />
                <span>Home screen icon</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isInstallable ? 'Install Now' : 'Install App'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Look for "Install" or "Add to Home Screen" in your browser menu');
            }}
            className="text-gray-600 dark:text-gray-300"
          >
            Help
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Look for the install icon in your browser's address bar
        </p>
      </div>
    </Card>
  );
}

