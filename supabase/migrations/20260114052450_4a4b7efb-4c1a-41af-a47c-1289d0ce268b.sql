-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role during signup"
ON user_roles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Insert roles for existing users who signed up but didn't get roles assigned
INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 'librarian'::app_role
FROM profiles p
WHERE p.user_id = '230ae2b5-de72-4cca-8991-fa29b8dd23d5'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id)
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 'teacher'::app_role
FROM profiles p
WHERE p.user_id = '78eaa937-418e-4f09-908b-50bbbf0970ea'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id)
ON CONFLICT DO NOTHING;