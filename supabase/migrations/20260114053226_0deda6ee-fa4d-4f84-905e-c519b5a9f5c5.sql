-- Set managed_class for existing teachers
UPDATE profiles SET managed_class = 'Grade 7A' 
WHERE user_id = '78eaa937-418e-4f09-908b-50bbbf0970ea'
AND (managed_class IS NULL OR managed_class = '');

-- Set managed_class for the second teacher if exists
UPDATE profiles SET managed_class = 'Grade 8B' 
WHERE user_id = 'b022542e-bf07-4fc5-96d6-f3d36ac11439'
AND (managed_class IS NULL OR managed_class = '');