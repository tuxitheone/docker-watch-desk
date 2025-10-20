-- Remove profiles table (not needed for single admin user)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remove the trigger and function for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Update global_settings to not require user_id (single admin)
ALTER TABLE public.global_settings DROP CONSTRAINT IF EXISTS global_settings_user_id_fkey;
ALTER TABLE public.global_settings ALTER COLUMN user_id DROP NOT NULL;

-- Update container_settings to not require user_id
ALTER TABLE public.container_settings DROP CONSTRAINT IF EXISTS container_settings_user_id_fkey;
ALTER TABLE public.container_settings ALTER COLUMN user_id DROP NOT NULL;

-- Update audit_logs to not require user_id
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE public.audit_logs ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies for single admin
DROP POLICY IF EXISTS "Users can view their own settings" ON public.global_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.global_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.global_settings;

CREATE POLICY "Admin can manage global settings"
  ON public.global_settings FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own container settings" ON public.container_settings;
DROP POLICY IF EXISTS "Users can insert their own container settings" ON public.container_settings;
DROP POLICY IF EXISTS "Users can update their own container settings" ON public.container_settings;
DROP POLICY IF EXISTS "Users can delete their own container settings" ON public.container_settings;

CREATE POLICY "Admin can manage container settings"
  ON public.container_settings FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;

CREATE POLICY "Admin can view audit logs"
  ON public.audit_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to initialize admin settings on first login
CREATE OR REPLACE FUNCTION public.ensure_admin_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default global settings if they don't exist
  INSERT INTO public.global_settings (user_id)
  SELECT NEW.id
  WHERE NOT EXISTS (SELECT 1 FROM public.global_settings LIMIT 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to ensure settings exist when admin logs in
CREATE TRIGGER ensure_admin_settings_on_login
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_settings();