-- ============================================================
-- Migration: Add roles, auto-profile trigger, and RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add role column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'support'
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'support'));

-- 2. Helper function to get current user role
--    SECURITY DEFINER bypasses RLS so it can read profiles without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'support'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "admin view all"     ON public.profiles;
DROP POLICY IF EXISTS "admin update any"   ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;

CREATE POLICY "view own profile"    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin view all"      ON public.profiles FOR SELECT USING (get_my_role() = 'admin');
CREATE POLICY "admin update any"    ON public.profiles FOR UPDATE USING (get_my_role() = 'admin');
CREATE POLICY "update own profile"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. RLS on core tables — require authenticated session
--    (replaces the previous USING(true) permissive policies)

ALTER TABLE public.sim_cards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_burden_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.sim_cards;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.devices;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.installations;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.status_history;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.daily_burden_log;

CREATE POLICY "auth sim_cards"        ON public.sim_cards        FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth devices"          ON public.devices          FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth customers"        ON public.customers        FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth installations"    ON public.installations    FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth status_history"   ON public.status_history   FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth daily_burden_log" ON public.daily_burden_log FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- POST-MIGRATION: Set luhurguanteng@gmail.com as admin
-- Run this AFTER the user has signed up for the first time:
--
--   UPDATE public.profiles SET role = 'admin'
--   WHERE email = 'luhurguanteng@gmail.com';
--
-- ============================================================
