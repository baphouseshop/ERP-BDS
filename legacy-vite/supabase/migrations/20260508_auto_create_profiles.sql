-- Create function to handle new user registration automatically
-- This ensures every user created in auth.users gets a corresponding record in public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$ 
BEGIN 
  INSERT INTO public.profiles (id, full_name, role, employee_code) 
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
    'User', 
    null
  ); 
  RETURN new; 
END; 
$$;

-- Create trigger on auth.users table
-- This trigger fires every time a new user signs up or is created via the Supabase Auth API
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
