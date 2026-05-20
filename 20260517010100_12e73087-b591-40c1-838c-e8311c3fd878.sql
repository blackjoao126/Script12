
-- App role enum + user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Key type enum
CREATE TYPE public.key_type AS ENUM ('free', 'premium', 'admin');

-- Keys table
CREATE TABLE public.keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  type key_type NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  used boolean NOT NULL DEFAULT false,
  blacklisted boolean NOT NULL DEFAULT false,
  hwid text,
  ip text,
  redeemed_by text
);

CREATE INDEX idx_keys_key ON public.keys(key);

ALTER TABLE public.keys ENABLE ROW LEVEL SECURITY;

-- Only admins can see/manage keys directly via PostgREST.
-- All public validation/redeem flows go through server functions using the admin client.
CREATE POLICY "Admins can view keys"
  ON public.keys FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert keys"
  ON public.keys FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update keys"
  ON public.keys FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete keys"
  ON public.keys FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
