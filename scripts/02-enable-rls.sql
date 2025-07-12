-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Anyone can view active items" ON items
    FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can insert items" ON items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own items or admins can update any" ON items
    FOR UPDATE USING (
        auth.uid() = owner_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Users can delete their own items or admins can delete any" ON items
    FOR DELETE USING (
        auth.uid() = owner_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- Swaps policies
CREATE POLICY "Authenticated users can create swaps" ON swaps
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view swaps they're involved in" ON swaps
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Users can update swaps they're involved in" ON swaps
    FOR UPDATE USING (
        auth.uid() = requester_id OR 
        auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
    );

-- Points transactions policies
CREATE POLICY "Users can view their own transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON points_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Announcements policies
CREATE POLICY "Authenticated users can view announcements" ON announcements
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage announcements" ON announcements
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
