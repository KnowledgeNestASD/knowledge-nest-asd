import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { User, Mail, Save, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, profile, roles, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [className, setClassName] = useState(profile?.class_name || '');
  const [houseName, setHouseName] = useState(profile?.house_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <User className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view and edit your profile.
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In to Continue
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast({
        title: 'Avatar updated!',
        description: 'Your profile picture has been changed.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Unable to upload avatar. Please try again.',
        variant: 'destructive',
      });
    }

    setIsUploadingAvatar(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        class_name: className || null,
        house_name: houseName || null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update your profile. Please try again.',
        variant: 'destructive',
      });
    } else {
      await refreshProfile();
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
      });
    }

    setIsUpdating(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'librarian':
        return 'bg-primary text-primary-foreground';
      case 'teacher':
        return 'bg-accent-green text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mt-4">
              {profile?.full_name || 'Your Profile'}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              {roles.map((role) => (
                <Badge key={role} className={getRoleBadgeColor(role)}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 lg:p-8"
          >
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="class-name">Class</Label>
                  <Input
                    id="class-name"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Grade 8A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="house-name">House</Label>
                  <Input
                    id="house-name"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    placeholder="e.g., Phoenix"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-muted/50 rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Click the camera icon to upload a profile picture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Keep your class and house updated for challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Your reading stats are visible on your dashboard</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;