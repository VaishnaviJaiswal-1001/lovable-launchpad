
-- Create storage bucket for event banners
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true);

-- Allow authenticated users to upload to event-banners
CREATE POLICY "Admins can upload event banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-banners' AND public.has_role(auth.uid(), 'admin'));

-- Allow public read access
CREATE POLICY "Anyone can view event banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-banners');

-- Allow admins to delete their banners
CREATE POLICY "Admins can delete event banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-banners' AND public.has_role(auth.uid(), 'admin'));
