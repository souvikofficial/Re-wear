-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('items', 'items', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'items');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'items' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own item images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'items' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own item images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'items' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
