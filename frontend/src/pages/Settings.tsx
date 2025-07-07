import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { 
  ArrowLeft, 
  Home,
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Shield, 
  Palette, 
  User,
  Heart,
  HelpCircle,
  Phone,
  ExternalLink
} from 'lucide-react';
import { UserGuard, useUserGuardContext } from 'app/auth';

function SettingsInternal() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    achievements: true,
    moodCheckins: false
  });
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    crashReports: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const nigerianCrisisResources = [
    {
      name: "National Mental Health Emergency Line",
      number: "0809-210-0010",
      description: "24/7 mental health crisis support",
      available: "24/7"
    },
    {
      name: "Lagos State Crisis Helpline",
      number: "0809-993-7777", 
      description: "Lagos State mental health support",
      available: "24/7"
    },
    {
      name: "Mentally Aware Nigeria Initiative (MANI)",
      number: "0909-900-9001",
      description: "Mental health awareness and support",
      available: "9AM - 5PM"
    },
    {
      name: "Suicide Prevention Nigeria",
      number: "0906-599-0000",
      description: "Suicide prevention and crisis intervention",
      available: "24/7"
    },
    {
      name: "Federal Neuropsychiatric Hospital",
      number: "0803-333-3333",
      description: "Professional mental health services",
      available: "24/7 Emergency"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              ⚙️ Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Customize your Mindflow experience
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Profile</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Manage your account information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{user.displayName || 'User'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{user.primaryEmail}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/edit-profile')}
                  className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Appearance</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Choose your preferred theme
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-sm">Light</span>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-sm">Dark</span>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-sm">System</span>
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Current theme: <Badge variant="secondary" className="ml-1">{theme}</Badge>
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Notifications</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Manage your notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'dailyReminders', label: 'Daily mood check-in reminders', desc: 'Get gentle reminders to log your mood' },
                  { key: 'weeklyReports', label: 'Weekly progress reports', desc: 'Receive insights about your mental health journey' },
                  { key: 'achievements', label: 'Achievement notifications', desc: 'Celebrate your self-care milestones' },
                  { key: 'moodCheckins', label: 'Smart mood check-ins', desc: 'Adaptive reminders based on your patterns' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(value) => handleNotificationChange(key, value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Privacy & Data</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Control how your data is used
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'dataSharing', label: 'Anonymous data sharing', desc: 'Help improve mental health research' },
                  { key: 'analytics', label: 'Usage analytics', desc: 'Help us improve the app experience' },
                  { key: 'crashReports', label: 'Crash reports', desc: 'Automatically send error reports to improve stability' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{desc}</p>
                    </div>
                    <Switch
                      checked={privacy[key as keyof typeof privacy]}
                      onCheckedChange={(value) => handlePrivacyChange(key, value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crisis Resources */}
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-800 dark:text-red-200">Crisis Support - Nigeria</CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-300">
                    If you're in crisis, these resources are here to help immediately
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nigerianCrisisResources.map((resource, index) => (
                  <div key={index} className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm">{resource.name}</h4>
                      <Badge variant="secondary" className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        {resource.available}
                      </Badge>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-300 mb-3">{resource.description}</p>
                    <a 
                      href={`tel:${resource.number}`}
                      className="flex items-center gap-2 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="font-mono text-sm font-semibold">{resource.number}</span>
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  🚨 Emergency: Call 199 or 112 for immediate emergency services
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  If you're having thoughts of self-harm, please reach out immediately. You matter, and help is available.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                  <HelpCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 dark:text-slate-100">Help & Support</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Get help with using Mindflow
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium text-slate-800 dark:text-slate-100">Help Center</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Browse frequently asked questions</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium text-slate-800 dark:text-slate-100">Contact Support</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Get personalized help</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">Mindflow - Mental Health Companion</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Version 1.0.0 • Made with ❤️ for mental wellness</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <UserGuard>
      <SettingsInternal />
    </UserGuard>
  );
}


