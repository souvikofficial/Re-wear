-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;

-- Updated RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- Allow the trigger function to insert user profiles
CREATE POLICY "Enable insert for authenticated users during signup" ON users
    FOR INSERT WITH CHECK (true);

-- Update items policies to allow viewing owner information
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
CREATE POLICY "Anyone can view active items" ON items
    FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);

-- Allow users to view other users' basic info for items
CREATE POLICY "Users can view basic profile info" ON users
    FOR SELECT USING (true);
