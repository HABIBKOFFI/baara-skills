-- ============================================================
-- BAARA Skills — Migration initiale
-- À exécuter dans l'éditeur SQL Supabase (une seule fois)
-- ============================================================

-- ----------------------------
-- 1. TABLES
-- ----------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'apprenant' CHECK (role IN ('apprenant', 'recruteur', 'admin')),
  prenom text,
  nom text,
  ville text DEFAULT 'Abidjan',
  domaine_etudes text,
  niveau_etudes text,
  photo_url text,
  linkedin_url text,
  visible_recruteurs boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  titre text NOT NULL,
  description text,
  entreprise_partenaire text,
  logo_entreprise_url text,
  duree_heures int,
  niveau text CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé')),
  domaine text,
  actif boolean DEFAULT true,
  ordre int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid REFERENCES public.simulations ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  ordre int DEFAULT 0,
  type text CHECK (type IN ('decouverte', 'analyse', 'production', 'presentation')),
  briefing_contenu text,
  ressources jsonb DEFAULT '[]',
  criteres_evaluation jsonb DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  simulation_id uuid REFERENCES public.simulations ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'complete', 'abandonne')),
  module_actuel_id uuid REFERENCES public.modules,
  score_global int,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(apprenant_id, simulation_id)
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments ON DELETE CASCADE,
  contenu_texte text,
  fichiers_urls jsonb DEFAULT '[]',
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'evalue')),
  submitted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.submissions ON DELETE CASCADE,
  score_global int CHECK (score_global BETWEEN 0 AND 100),
  score_pertinence int CHECK (score_pertinence BETWEEN 0 AND 100),
  score_analyse int CHECK (score_analyse BETWEEN 0 AND 100),
  score_clarte int CHECK (score_clarte BETWEEN 0 AND 100),
  score_creativite int CHECK (score_creativite BETWEEN 0 AND 100),
  mention text CHECK (mention IN ('Insuffisant', 'Satisfaisant', 'Bien', 'Très bien', 'Excellent')),
  points_forts jsonb DEFAULT '[]',
  axes_amelioration jsonb DEFAULT '[]',
  commentaire_detaille text,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  simulation_id uuid REFERENCES public.simulations ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments ON DELETE CASCADE,
  score_final int,
  mention text,
  pdf_url text,
  numero_certificat text UNIQUE,
  issued_at timestamptz DEFAULT now()
);

-- ----------------------------
-- 2. TRIGGER — auto-créer un profil à l'inscription
-- ----------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    -- Lire le rôle depuis les métadonnées si défini (recruteur, admin), sinon 'apprenant'
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('recruteur', 'admin')
      THEN NEW.raw_user_meta_data->>'role'
      ELSE 'apprenant'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------
-- 3. RLS — Row Level Security
-- ----------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificats ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Lecture propre profil" ON public.profiles;
CREATE POLICY "Lecture propre profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Lecture profils visibles recruteurs" ON public.profiles;
CREATE POLICY "Lecture profils visibles recruteurs"
  ON public.profiles FOR SELECT
  USING (visible_recruteurs = true AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Modification propre profil" ON public.profiles;
CREATE POLICY "Modification propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Insertion propre profil" ON public.profiles;
CREATE POLICY "Insertion propre profil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- SIMULATIONS (lecture pour tous les authentifiés)
DROP POLICY IF EXISTS "Lecture simulations actives" ON public.simulations;
CREATE POLICY "Lecture simulations actives"
  ON public.simulations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- MODULES (lecture pour tous les authentifiés)
DROP POLICY IF EXISTS "Lecture modules" ON public.modules;
CREATE POLICY "Lecture modules"
  ON public.modules FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ENROLLMENTS
DROP POLICY IF EXISTS "Lecture propres enrollments" ON public.enrollments;
CREATE POLICY "Lecture propres enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = apprenant_id);

DROP POLICY IF EXISTS "Insertion propre enrollment" ON public.enrollments;
CREATE POLICY "Insertion propre enrollment"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = apprenant_id);

DROP POLICY IF EXISTS "Mise à jour propre enrollment" ON public.enrollments;
CREATE POLICY "Mise à jour propre enrollment"
  ON public.enrollments FOR UPDATE
  USING (auth.uid() = apprenant_id);

-- Service role peut tout modifier (pour les API routes)
DROP POLICY IF EXISTS "Service role enrollments" ON public.enrollments;
CREATE POLICY "Service role enrollments"
  ON public.enrollments FOR ALL
  USING (auth.role() = 'service_role');

-- SUBMISSIONS
DROP POLICY IF EXISTS "Lecture propres submissions" ON public.submissions;
CREATE POLICY "Lecture propres submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = apprenant_id);

DROP POLICY IF EXISTS "Insertion propre submission" ON public.submissions;
CREATE POLICY "Insertion propre submission"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = apprenant_id);

DROP POLICY IF EXISTS "Mise à jour propre submission" ON public.submissions;
CREATE POLICY "Mise à jour propre submission"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = apprenant_id);

DROP POLICY IF EXISTS "Service role submissions" ON public.submissions;
CREATE POLICY "Service role submissions"
  ON public.submissions FOR ALL
  USING (auth.role() = 'service_role');

-- FEEDBACKS (lecture pour le propriétaire de la submission)
DROP POLICY IF EXISTS "Lecture feedback via submission" ON public.feedbacks;
CREATE POLICY "Lecture feedback via submission"
  ON public.feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id
      AND s.apprenant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role feedbacks" ON public.feedbacks;
CREATE POLICY "Service role feedbacks"
  ON public.feedbacks FOR ALL
  USING (auth.role() = 'service_role');

-- CERTIFICATS
DROP POLICY IF EXISTS "Lecture propres certificats" ON public.certificats;
CREATE POLICY "Lecture propres certificats"
  ON public.certificats FOR SELECT
  USING (auth.uid() = apprenant_id);

DROP POLICY IF EXISTS "Lecture certificats via profil visible" ON public.certificats;
CREATE POLICY "Lecture certificats via profil visible"
  ON public.certificats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = apprenant_id
      AND p.visible_recruteurs = true
      AND auth.uid() IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Service role certificats" ON public.certificats;
CREATE POLICY "Service role certificats"
  ON public.certificats FOR ALL
  USING (auth.role() = 'service_role');
