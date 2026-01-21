-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'brf_admin', 'brf_user');

-- 2. Create organizations table (BRF/föreningar)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_number TEXT UNIQUE,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create user_profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 5. Create vendors table (leverantörer)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  org_number TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  bankgiro TEXT,
  plusgiro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create invoice_status enum
CREATE TYPE public.invoice_status AS ENUM ('new', 'pending_attestation', 'attested', 'rejected', 'paid');

-- 7. Create invoices table (fakturor)
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  invoice_number TEXT,
  ocr_number TEXT,
  amount DECIMAL(12,2) NOT NULL,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'SEK',
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'new',
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create invoice_lines table (konteringsrader)
CREATE TABLE public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  account_code TEXT,
  cost_center TEXT,
  project TEXT,
  vat_code TEXT,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create invoice_attachments table (bilagor)
CREATE TABLE public.invoice_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create invoice_event_type enum
CREATE TYPE public.invoice_event_type AS ENUM ('created', 'sent', 'attested', 'rejected', 'paid', 'comment', 'updated');

-- 11. Create invoice_events table (audit log)
CREATE TABLE public.invoice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  event_type invoice_event_type NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Create user_invitations table
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'brf_user',
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 14. Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 16. Create function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.user_profiles
  WHERE user_id = _user_id
$$;

-- 17. Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- 18. RLS Policies for organizations
CREATE POLICY "Superadmins can do everything with organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id = public.get_user_organization_id(auth.uid()));

-- 19. RLS Policies for user_profiles
CREATE POLICY "Superadmins can do everything with profiles"
  ON public.user_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view profiles in their organization"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 20. RLS Policies for user_roles
CREATE POLICY "Superadmins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 21. RLS Policies for vendors
CREATE POLICY "Superadmins can do everything with vendors"
  ON public.vendors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view vendors in their organization"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "BRF admins can manage vendors in their organization"
  ON public.vendors FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'brf_admin')
  )
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'brf_admin')
  );

-- 22. RLS Policies for invoices
CREATE POLICY "Superadmins can do everything with invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view invoices in their organization"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "BRF admins can manage invoices in their organization"
  ON public.invoices FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'brf_admin')
  )
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'brf_admin')
  );

CREATE POLICY "BRF users can update invoice status"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'brf_user')
  )
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid()) 
    AND public.has_role(auth.uid(), 'brf_user')
  );

-- 23. RLS Policies for invoice_lines
CREATE POLICY "Superadmins can do everything with invoice_lines"
  ON public.invoice_lines FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view invoice_lines for their organization invoices"
  ON public.invoice_lines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_lines.invoice_id 
      AND invoices.organization_id = public.get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "BRF admins can manage invoice_lines"
  ON public.invoice_lines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_lines.invoice_id 
      AND invoices.organization_id = public.get_user_organization_id(auth.uid())
    )
    AND public.has_role(auth.uid(), 'brf_admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_lines.invoice_id 
      AND invoices.organization_id = public.get_user_organization_id(auth.uid())
    )
    AND public.has_role(auth.uid(), 'brf_admin')
  );

-- 24. RLS Policies for invoice_attachments
CREATE POLICY "Superadmins can do everything with attachments"
  ON public.invoice_attachments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view attachments for their organization invoices"
  ON public.invoice_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_attachments.invoice_id 
      AND invoices.organization_id = public.get_user_organization_id(auth.uid())
    )
  );

-- 25. RLS Policies for invoice_events
CREATE POLICY "Superadmins can do everything with events"
  ON public.invoice_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view events for their organization invoices"
  ON public.invoice_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_events.invoice_id 
      AND invoices.organization_id = public.get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "Users can create events for their organization invoices"
  ON public.invoice_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_events.invoice_id 
      AND invoices.organization_id = public.get_user_organization_id(auth.uid())
    )
  );

-- 26. RLS Policies for user_invitations
CREATE POLICY "Superadmins can manage all invitations"
  ON public.user_invitations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anyone can view invitation by token"
  ON public.user_invitations FOR SELECT
  TO anon, authenticated
  USING (accepted_at IS NULL AND expires_at > now());

-- 27. Create storage bucket for invoice attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('invoice-attachments', 'invoice-attachments', false);

-- 28. Storage policies for invoice attachments
CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoice-attachments');

CREATE POLICY "Users can view attachments from their organization"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoice-attachments'
    AND EXISTS (
      SELECT 1 FROM public.invoice_attachments ia
      JOIN public.invoices i ON ia.invoice_id = i.id
      WHERE ia.file_path = name
      AND i.organization_id = public.get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "Superadmins can access all attachments"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'invoice-attachments' AND public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (bucket_id = 'invoice-attachments' AND public.has_role(auth.uid(), 'superadmin'));