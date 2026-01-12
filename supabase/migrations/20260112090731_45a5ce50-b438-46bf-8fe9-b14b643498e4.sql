-- Fix Security Vulnerabilities in RLS Policies

-- 1. Fix profiles table - restrict public access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (user_id = auth.uid());

-- Staff (librarians and teachers) can view all profiles for administrative purposes
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
USING (
  has_role(auth.uid(), 'librarian'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- 2. Fix reader_spotlights table - restrict to authenticated users only
DROP POLICY IF EXISTS "Spotlights are viewable by everyone" ON reader_spotlights;

-- Only authenticated users can view spotlights (not anonymous/public)
CREATE POLICY "Authenticated users can view spotlights"
ON reader_spotlights FOR SELECT
TO authenticated
USING (true);

-- 3. Fix challenge_participants - add class-based filtering for teachers
DROP POLICY IF EXISTS "Participants can view their own progress" ON challenge_participants;

-- Users can view their own progress, librarians see all, teachers see their class only
CREATE POLICY "View challenge progress with class filtering"
ON challenge_participants FOR SELECT
USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'librarian'::app_role) OR
  (has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
    SELECT 1 FROM profiles p1, profiles p2
    WHERE p1.user_id = auth.uid()
    AND p2.user_id = challenge_participants.user_id
    AND p1.class_name IS NOT NULL
    AND p1.class_name = p2.class_name
  ))
);

-- 4. Add managed_class column to profiles for teachers to specify which class they manage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS managed_class text;