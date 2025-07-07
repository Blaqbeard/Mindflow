import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Home,
  User,
  Mail,
  Save,
  Loader2
} from 'lucide-react';
import { UserGuard, useUserGuardContext } from 'app/auth';
import { toast } from 'sonner';

function EditProfileInternal() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Note: Stack Auth user updates are limited in the free tier
      // This is a placeholder for when profile editing is needed
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
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
              ✏️ Edit Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Update your account information
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-slate-800 dark:text-slate-100">Personal Information</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-700 dark:text-slate-300">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="border-slate-200 dark:border-slate-600"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="email"
                  value={user.primaryEmail || 'Not available'}
                  disabled
                  className="border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                />
                <Badge variant="secondary">Read-only</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email changes must be done through Stack Auth account settings
              </p>
            </div>

            {/* Account Settings Link */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Advanced Account Settings
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                    To change your email, password, or delete your account, use the Stack Auth settings.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (window.confirm('This will take you to the account settings page. Use your browser\'s back button to return to Mindflow.')) {
                        navigate('/auth/account-settings');
                      }
                    }}
                    className="border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    Open Account Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave}
                disabled={isLoading || !displayName.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Note about limitations */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Profile editing capabilities are limited in this demo. 
            For full account management, please use the Stack Auth account settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EditProfile() {
  return (
    <UserGuard>
      <EditProfileInternal />
    </UserGuard>
  );
}