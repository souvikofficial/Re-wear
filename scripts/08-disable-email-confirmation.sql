-- Disable email confirmation for immediate signup
-- This should be configured in Supabase Dashboard under Authentication > Settings
-- Set "Enable email confirmations" to OFF
-- Set "Enable phone confirmations" to OFF

-- Update the user creation trigger to handle immediate signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
