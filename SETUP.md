# Guide de mise en place BAARA — Supabase + Vercel

## Vue d'ensemble

```
GitHub (code) → Vercel (hébergement) → Supabase (BDD + Auth + Storage)
                                      → Anthropic API (feedback IA)
```

---

## ÉTAPE 1 — Créer le projet Supabase

1. Va sur **https://supabase.com** → "New project"
2. Remplis :
   - **Name** : `baara-skills`
   - **Database Password** : génère un mot de passe fort (note-le !)
   - **Region** : `West EU (Ireland)` — le plus proche de l'Afrique de l'Ouest
3. Attends ~2 minutes que le projet démarre

### Récupérer tes clés

Dans ton projet Supabase → **Settings → API** :

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role secret" ⚠️ ne jamais exposer |

---

## ÉTAPE 2 — Créer le schéma de base de données

Dans Supabase → **SQL Editor** → "New query" → colle et exécute ce SQL :

```sql
-- =============================================
-- SCHÉMA BAARA SKILLS
-- =============================================

-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------
-- TABLE : profiles (étend auth.users de Supabase)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'apprenant'
    CHECK (role IN ('apprenant', 'recruteur', 'admin')),
  prenom text,
  nom text,
  ville text DEFAULT 'Abidjan',
  domaine_etudes text,
  niveau_etudes text,
  photo_url text,
  linkedin_url text,
  visible_recruteurs boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- TABLE : simulations
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  titre text NOT NULL,
  description text,
  entreprise_partenaire text,
  logo_entreprise_url text,
  duree_heures int,
  niveau text CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé')),
  domaine text,
  actif boolean NOT NULL DEFAULT true,
  ordre int,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- TABLE : modules
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES simulations ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  ordre int NOT NULL,
  type text CHECK (type IN ('decouverte', 'analyse', 'production', 'presentation')),
  briefing_contenu text,
  ressources jsonb NOT NULL DEFAULT '[]',
  criteres_evaluation jsonb NOT NULL DEFAULT '[]'
);

-- -----------------------------------------------
-- TABLE : enrollments
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  simulation_id uuid NOT NULL REFERENCES simulations ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'en_cours'
    CHECK (statut IN ('en_cours', 'complete', 'abandonne')),
  module_actuel_id uuid REFERENCES modules,
  score_global int,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(apprenant_id, simulation_id)
);

-- -----------------------------------------------
-- TABLE : submissions
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments ON DELETE CASCADE,
  contenu_texte text,
  fichiers_urls jsonb NOT NULL DEFAULT '[]',
  statut text NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente', 'evalue')),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- TABLE : feedbacks
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions ON DELETE CASCADE,
  score_global int CHECK (score_global BETWEEN 0 AND 100),
  score_pertinence int CHECK (score_pertinence BETWEEN 0 AND 100),
  score_analyse int CHECK (score_analyse BETWEEN 0 AND 100),
  score_clarte int CHECK (score_clarte BETWEEN 0 AND 100),
  score_creativite int CHECK (score_creativite BETWEEN 0 AND 100),
  mention text CHECK (mention IN ('Insuffisant', 'Satisfaisant', 'Bien', 'Très bien', 'Excellent')),
  points_forts jsonb NOT NULL DEFAULT '[]',
  axes_amelioration jsonb NOT NULL DEFAULT '[]',
  commentaire_detaille text,
  generated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- TABLE : certificats
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS certificats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  simulation_id uuid NOT NULL REFERENCES simulations ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments ON DELETE CASCADE,
  score_final int,
  mention text CHECK (mention IN ('Insuffisant', 'Satisfaisant', 'Bien', 'Très bien', 'Excellent')),
  pdf_url text,
  numero_certificat text UNIQUE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------
-- TRIGGER : créer le profil automatiquement à l'inscription
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role, prenom, nom)
  VALUES (
    NEW.id,
    'apprenant',
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## ÉTAPE 3 — Activer le Row Level Security (RLS)

Dans **SQL Editor** → nouvelle query → exécute :

```sql
-- =============================================
-- ROW LEVEL SECURITY — BAARA
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificats ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------
-- PROFILES
-- -----------------------------------------------
-- Lecture : son propre profil
CREATE POLICY "profil_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Lecture : recruteurs voient les profils visibles
CREATE POLICY "profil_select_visible" ON profiles
  FOR SELECT USING (
    visible_recruteurs = true
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('recruteur', 'admin')
    )
  );

-- Lecture : admin voit tout
CREATE POLICY "profil_select_admin" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Modification : son propre profil seulement
CREATE POLICY "profil_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- -----------------------------------------------
-- SIMULATIONS (lecture publique pour les apprenants connectés)
-- -----------------------------------------------
CREATE POLICY "simulations_select_authenticated" ON simulations
  FOR SELECT USING (auth.role() = 'authenticated' AND actif = true);

CREATE POLICY "simulations_select_admin" ON simulations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "simulations_all_admin" ON simulations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- -----------------------------------------------
-- MODULES
-- -----------------------------------------------
CREATE POLICY "modules_select_authenticated" ON modules
  FOR SELECT USING (auth.role() = 'authenticated');

-- -----------------------------------------------
-- ENROLLMENTS
-- -----------------------------------------------
-- Apprenant voit ses propres inscriptions
CREATE POLICY "enrollments_select_own" ON enrollments
  FOR SELECT USING (auth.uid() = apprenant_id);

-- Apprenant peut s'inscrire
CREATE POLICY "enrollments_insert_own" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = apprenant_id);

-- Apprenant peut mettre à jour sa progression
CREATE POLICY "enrollments_update_own" ON enrollments
  FOR UPDATE USING (auth.uid() = apprenant_id);

-- Recruteur / admin voit tout
CREATE POLICY "enrollments_select_recruiter" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('recruteur', 'admin')
    )
  );

-- -----------------------------------------------
-- SUBMISSIONS
-- -----------------------------------------------
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (auth.uid() = apprenant_id);

CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = apprenant_id);

CREATE POLICY "submissions_update_own" ON submissions
  FOR UPDATE USING (auth.uid() = apprenant_id);

-- Recruteur voit les soumissions des profils visibles
CREATE POLICY "submissions_select_recruiter" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('recruteur', 'admin')
    )
    AND EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = submissions.apprenant_id AND pr.visible_recruteurs = true
    )
  );

-- -----------------------------------------------
-- FEEDBACKS
-- -----------------------------------------------
CREATE POLICY "feedbacks_select_own" ON feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = feedbacks.submission_id AND s.apprenant_id = auth.uid()
    )
  );

CREATE POLICY "feedbacks_insert_service" ON feedbacks
  FOR INSERT WITH CHECK (true); -- Géré par service_role via API route

-- -----------------------------------------------
-- CERTIFICATS
-- -----------------------------------------------
CREATE POLICY "certificats_select_own" ON certificats
  FOR SELECT USING (auth.uid() = apprenant_id);

CREATE POLICY "certificats_select_recruiter" ON certificats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('recruteur', 'admin')
    )
    AND EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = certificats.apprenant_id AND pr.visible_recruteurs = true
    )
  );

CREATE POLICY "certificats_insert_service" ON certificats
  FOR INSERT WITH CHECK (true); -- Géré par service_role via API route
```

---

## ÉTAPE 4 — Insérer les données de test (4 simulations MVP)

```sql
-- =============================================
-- SEED : 4 SIMULATIONS MVP
-- =============================================

-- Simulation 1 : Analyste Financier Junior
INSERT INTO simulations (slug, titre, description, entreprise_partenaire, duree_heures, niveau, domaine, ordre)
VALUES (
  'sim-finance',
  'Analyste Financier Junior',
  'Plonge dans le monde de la finance d''entreprise. Tu analyses les états financiers de MTN Côte d''Ivoire, identifies les tendances clés et produis un rapport d''analyse destiné à la direction.',
  'MTN Côte d''Ivoire',
  6,
  'Intermédiaire',
  'Finance',
  1
);

-- Récupérer l'ID pour insérer les modules
DO $$
DECLARE
  sim_finance_id uuid;
  sim_dev_id uuid;
  sim_rh_id uuid;
  sim_supply_id uuid;
BEGIN

SELECT id INTO sim_finance_id FROM simulations WHERE slug = 'sim-finance';

INSERT INTO modules (simulation_id, titre, description, ordre, type, briefing_contenu, criteres_evaluation) VALUES
(sim_finance_id, 'Découverte de l''environnement financier', 'Comprendre le secteur télécoms et MTN CI', 1, 'decouverte',
'Tu rejoins MTN Côte d''Ivoire en tant qu''analyste financier junior. Ta première mission est de te familiariser avec le secteur des télécommunications en Afrique de l''Ouest et le positionnement de MTN CI.

**Ta mission :**
Rédige une note de synthèse (400-600 mots) présentant :
1. Le marché des télécoms en Côte d''Ivoire (acteurs, parts de marché, tendances)
2. Le positionnement stratégique de MTN CI
3. Les 3 principaux défis financiers du secteur en 2024

**Ressources à exploiter :**
- Rapports annuels MTN Group (disponibles en ligne)
- Données ARTCI (Autorité de Régulation des Télécommunications)
- Actualités sectorielles',
'[{"nom": "Pertinence", "poids": 30, "description": "La note couvre bien les 3 points demandés"}, {"nom": "Analyse", "poids": 30, "description": "Les informations sont analysées, pas juste listées"}, {"nom": "Clarté", "poids": 20, "description": "La note est bien structurée et lisible"}, {"nom": "Créativité", "poids": 20, "description": "Des insights originaux ou des données récentes sont apportés"}]'),

(sim_finance_id, 'Analyse des états financiers', 'Lire et interpréter un bilan et compte de résultat', 2, 'analyse',
'On te fournit les données financières simplifiées de MTN CI pour l''exercice 2023 :

**Chiffre d''affaires :** 850 milliards FCFA (+8% vs 2022)
**EBITDA :** 340 milliards FCFA (marge 40%)
**Résultat net :** 95 milliards FCFA
**Dette nette :** 180 milliards FCFA
**Capex :** 120 milliards FCFA

**Ta mission :**
Produis une analyse financière structurée comprenant :
1. Calcul et interprétation des ratios clés (marge nette, ROE, ratio dette/EBITDA)
2. Comparaison avec les standards du secteur télécoms africain
3. Identification de 2 points forts et 2 points de vigilance
4. Une recommandation pour la direction (investir / maintenir / optimiser)

**Format attendu :** Rapport structuré avec tableaux de ratios',
'[{"nom": "Pertinence", "poids": 30, "description": "Les ratios sont correctement calculés et interprétés"}, {"nom": "Analyse", "poids": 30, "description": "La comparaison sectorielle est pertinente"}, {"nom": "Clarté", "poids": 20, "description": "Les tableaux sont lisibles et bien formatés"}, {"nom": "Créativité", "poids": 20, "description": "La recommandation finale est argumentée et originale"}]'),

(sim_finance_id, 'Rapport d''analyse pour la direction', 'Synthèse et recommandations stratégiques', 3, 'production',
'C''est le moment de livrer ton travail final. Tu dois produire un rapport complet destiné au Comité de Direction de MTN CI.

**Ta mission — Rapport de 800 à 1200 mots comprenant :**
1. **Executive Summary** (150 mots max) : les points essentiels pour un dirigeant pressé
2. **Analyse de la performance** : bilan de l''exercice 2023 avec les ratios calculés
3. **Analyse des risques** : 3 risques financiers identifiés avec leur impact potentiel
4. **Opportunités de croissance** : 2-3 leviers d''amélioration de la rentabilité
5. **Recommandations** : plan d''action prioritaire pour les 12 prochains mois

**Critères de qualité d''un bon rapport financier :**
- Chiffres précis et cohérents
- Langage professionnel et direct
- Recommandations actionnables
- Structure claire (titres, sous-titres, listes)',
'[{"nom": "Pertinence", "poids": 30, "description": "Le rapport répond au brief et couvre tous les points"}, {"nom": "Analyse", "poids": 30, "description": "Les analyses sont rigoureuses et les recommandations fondées"}, {"nom": "Clarté", "poids": 20, "description": "Le rapport est professionnel et bien structuré"}, {"nom": "Créativité", "poids": 20, "description": "Des recommandations innovantes et contextualisées à la CI"}]');

-- Simulation 2 : Développeur Web Freelance
INSERT INTO simulations (slug, titre, description, entreprise_partenaire, duree_heures, niveau, domaine, ordre)
VALUES (
  'sim-dev',
  'Développeur Web Freelance',
  'Lance-toi comme développeur freelance en Afrique. Tu crées une proposition commerciale, livres un mini-projet client et gères ta relation client de A à Z.',
  'Freelance Afrique',
  8,
  'Débutant',
  'Tech',
  2
);

SELECT id INTO sim_dev_id FROM simulations WHERE slug = 'sim-dev';

INSERT INTO modules (simulation_id, titre, description, ordre, type, briefing_contenu, criteres_evaluation) VALUES
(sim_dev_id, 'Comprendre le marché freelance tech en CI', 'Explorer l''écosystème tech ivoirien', 1, 'decouverte',
'Tu veux te lancer comme développeur web freelance à Abidjan. Avant de chercher des clients, tu dois comprendre le marché.

**Ta mission :**
Rédige une analyse de marché (350-500 mots) couvrant :
1. L''état du marché tech en Côte d''Ivoire (startups, PME qui recrutent des freelances)
2. Les compétences les plus demandées et les tarifs pratiqués (en FCFA/heure ou par projet)
3. Les 3 plateformes ou canaux principaux pour trouver des clients à Abidjan
4. Ton positionnement : quelle niche viser en tant que débutant ?

**Conseil :** Pense à des plateformes comme Upwork, mais aussi aux réseaux locaux (WhatsApp pros, LinkedIn CI, communautés tech).',
'[{"nom": "Pertinence", "poids": 30, "description": "L analyse couvre bien le marché local ivoirien"}, {"nom": "Analyse", "poids": 30, "description": "Les données sont sourcées et analysées"}, {"nom": "Clarté", "poids": 20, "description": "La structure est logique et lisible"}, {"nom": "Créativité", "poids": 20, "description": "Des insights originaux sur le marché local"}]'),

(sim_dev_id, 'Répondre à un appel d''offre client', 'Rédiger une proposition commerciale professionnelle', 2, 'analyse',
'Un restaurant à Abidjan (Le Délice du Plateau) te contacte. Il veut un site web simple pour présenter son menu et permettre les réservations en ligne. Budget : 350 000 FCFA. Délai : 3 semaines.

**Ta mission :**
Rédige une proposition commerciale professionnelle comprenant :
1. **Présentation de toi** (3-4 lignes, ton expérience et tes compétences)
2. **Compréhension du besoin** : reformulation de ce que le client veut
3. **Solution proposée** : les pages du site, les fonctionnalités incluses
4. **Planning** : découpage en 3 semaines avec les livrables de chaque semaine
5. **Tarification détaillée** : comment tu arrives à 350 000 FCFA (ou tu proposes un autre montant avec justification)
6. **Conditions** : acompte, révisions incluses, maintenance',
'[{"nom": "Pertinence", "poids": 30, "description": "La proposition répond précisément au besoin du client"}, {"nom": "Analyse", "poids": 30, "description": "Le planning et la tarification sont réalistes et détaillés"}, {"nom": "Clarté", "poids": 20, "description": "La proposition est professionnelle et convaincante"}, {"nom": "Créativité", "poids": 20, "description": "Des idées de valeur ajoutée pour le client (SEO local, Google Maps...)"}]'),

(sim_dev_id, 'Livrer le projet et gérer le feedback client', 'Relation client et livraison professionnelle', 3, 'production',
'Tu as livré le site au restaurant. Le client te répond :

*"Bonjour, j''ai vu le site. Le design est bien mais j''ai quelques retours : 1) Le menu n''est pas à jour (il manque nos nouveaux plats) 2) Sur mobile le bouton de réservation ne s''affiche pas bien 3) Je voudrais ajouter une galerie photos. Est-ce que c''est possible dans le budget ?"*

**Ta mission :**
1. **Réponse email professionnelle** au client : gérer les retours avec tact, clarifier ce qui est inclus vs ce qui est en supplément
2. **Rapport de livraison** (300-400 mots) : récapitulatif de ce qui a été livré, guide d''utilisation simplifié pour le client, prochaines étapes suggérées
3. **Leçon apprise** : qu''aurais-tu fait différemment dans le cahier des charges initial pour éviter ces malentendus ?',
'[{"nom": "Pertinence", "poids": 30, "description": "La réponse gère bien chaque point du feedback client"}, {"nom": "Analyse", "poids": 30, "description": "La distinction inclus/supplément est claire et justifiée"}, {"nom": "Clarté", "poids": 20, "description": "L email est professionnel et le rapport est bien structuré"}, {"nom": "Créativité", "poids": 20, "description": "Des suggestions proactives pour fidéliser le client"}]');

-- Simulation 3 : Chargé de Recrutement
INSERT INTO simulations (slug, titre, description, entreprise_partenaire, duree_heures, niveau, domaine, ordre)
VALUES (
  'sim-rh',
  'Chargé de Recrutement',
  'Prends en main un processus de recrutement complet : rédaction de l''offre, tri des CV, conduite d''entretien et sélection du candidat final.',
  'Cabinet RH Abidjan',
  4,
  'Débutant',
  'Ressources Humaines',
  3
);

SELECT id INTO sim_rh_id FROM simulations WHERE slug = 'sim-rh';

INSERT INTO modules (simulation_id, titre, description, ordre, type, briefing_contenu, criteres_evaluation) VALUES
(sim_rh_id, 'Rédiger une offre d''emploi attractive', 'Attirer les bons candidats avec une offre bien rédigée', 1, 'decouverte',
'Le Cabinet RH Abidjan vient de recevoir une mission : recruter un(e) Chargé(e) Marketing Digital pour une startup fintech ivoirienne (AppliPay). L''entreprise cible des profils juniors avec 0-2 ans d''expérience.

**Informations sur le poste :**
- Lieu : Abidjan, Plateau
- Salaire : 250 000 - 350 000 FCFA selon profil
- Avantages : assurance, formation, télétravail partiel possible
- Missions : gestion des réseaux sociaux, création de contenu, campagnes digitales

**Ta mission :**
Rédige l''offre d''emploi complète qui sera publiée sur LinkedIn et Emploi-CI. Elle doit inclure :
1. Titre du poste accrocheur
2. Présentation de l''entreprise (2-3 lignes attractives)
3. Description des missions (5-7 bullet points)
4. Profil recherché (compétences, formation, qualités)
5. Conditions du poste
6. Comment postuler (processus clair)',
'[{"nom": "Pertinence", "poids": 30, "description": "L offre couvre tous les éléments essentiels"}, {"nom": "Analyse", "poids": 30, "description": "Le profil recherché est bien calibré pour un junior"}, {"nom": "Clarté", "poids": 20, "description": "L offre est attractive et bien rédigée"}, {"nom": "Créativité", "poids": 20, "description": "L offre se démarque et donne envie de postuler"}]'),

(sim_rh_id, 'Sélectionner les meilleurs candidats', 'Trier les CV et choisir qui inviter en entretien', 2, 'analyse',
'Tu as reçu 4 candidatures pour le poste de Chargé Marketing Digital chez AppliPay :

**Candidat A — Konan Adjoua, 23 ans**
Licence Marketing, Université FHB. Stage de 3 mois en agence de com. Maîtrise Instagram, Canva, bases de Facebook Ads. Français courant, anglais scolaire.

**Candidat B — Traoré Moussa, 26 ans**
BTS Communication, ISTC Abidjan. 1 an d''expérience en marketing digital (PME textile). Certifié Google Ads. Gère une page Instagram perso de 8000 abonnés. Anglais professionnel.

**Candidat C — Bamba Aminata, 24 ans**
Master Marketing Digital, IAM Dakar. Aucune expérience professionnelle. A créé une boutique en ligne de wax qui fait 500K FCFA/mois. Maîtrise TikTok, Instagram Reels. Très bonne présentation.

**Candidat D — Kouassi Jean-Pierre, 28 ans**
Licence Économie reconverti. Formation courte en digital (3 mois). Expérience commerciale terrain 2 ans. Connaissance basique des outils digitaux.

**Ta mission :**
1. Créer un tableau comparatif des 4 candidats selon les critères du poste
2. Sélectionner 2 candidats à inviter en entretien (avec justification)
3. Rédiger l''email de convocation pour l''un des candidats retenus
4. Rédiger l''email de refus professionnel et bienveillant pour les non-retenus',
'[{"nom": "Pertinence", "poids": 30, "description": "Les critères de sélection sont alignés avec le poste"}, {"nom": "Analyse", "poids": 30, "description": "La comparaison est objective et bien argumentée"}, {"nom": "Clarté", "poids": 20, "description": "Les emails sont professionnels et bien rédigés"}, {"nom": "Créativité", "poids": 20, "description": "Des critères pertinents au-delà du CV classique"}]');

-- Simulation 4 : Assistant Supply Chain
INSERT INTO simulations (slug, titre, description, entreprise_partenaire, duree_heures, niveau, domaine, ordre)
VALUES (
  'sim-supply',
  'Assistant Supply Chain',
  'Optimise la chaîne logistique de CFAO : gestion des stocks, analyse des fournisseurs et plan d''approvisionnement pour le marché ivoirien.',
  'CFAO',
  5,
  'Intermédiaire',
  'Logistique',
  4
);

SELECT id INTO sim_supply_id FROM simulations WHERE slug = 'sim-supply';

INSERT INTO modules (simulation_id, titre, description, ordre, type, briefing_contenu, criteres_evaluation) VALUES
(sim_supply_id, 'Analyser les stocks et identifier les ruptures', 'Lire et interpréter un tableau de bord stock', 1, 'decouverte',
'Tu débutes chez CFAO Côte d''Ivoire en tant qu''assistant supply chain. On te confie l''analyse du stock de pièces automobiles pour le mois de mars.

**Données de stock (extraits) :**
| Référence | Désignation | Stock actuel | Stock mini | Ventes mois -1 | Délai fournisseur |
|---|---|---|---|---|---|
| FR-001 | Filtre à huile Toyota | 45 unités | 20 | 38 | 15 jours |
| PL-034 | Plaquettes frein Renault | 8 unités | 15 | 22 | 21 jours |
| BA-012 | Batterie 60Ah | 3 unités | 10 | 18 | 30 jours |
| AM-056 | Amortisseur avant | 67 unités | 10 | 5 | 14 jours |
| CL-089 | Kit embrayage | 12 unités | 8 | 15 | 25 jours |

**Ta mission :**
1. Identifier les articles en rupture de stock ou en risque de rupture imminente
2. Calculer le niveau de stock en jours pour chaque article (stock / ventes quotidiennes)
3. Classer les urgences : quel article commander EN PRIORITÉ et pourquoi ?
4. Rédiger un mémo d''alerte à ton responsable (150-200 mots)',
'[{"nom": "Pertinence", "poids": 30, "description": "Les ruptures sont correctement identifiées"}, {"nom": "Analyse", "poids": 30, "description": "Les calculs sont corrects et les priorités bien justifiées"}, {"nom": "Clarté", "poids": 20, "description": "Le mémo est clair et actionnable"}, {"nom": "Créativité", "poids": 20, "description": "Des recommandations proactives pour éviter les ruptures futures"}]'),

(sim_supply_id, 'Comparer les fournisseurs et négocier', 'Évaluer des offres fournisseurs et choisir', 2, 'analyse',
'Tu dois commander les pièces en rupture. Tu as reçu des offres de 3 fournisseurs pour les plaquettes de frein (commande de 100 unités) :

**Fournisseur A — AutoParts Lagos (Nigeria)**
- Prix unitaire : 8 500 FCFA
- Délai : 18 jours
- Qualité : certifié ISO, référence Toyota et Renault
- Transport : inclus, livraison Abidjan port
- Minimum de commande : 50 unités
- Conditions paiement : 30 jours

**Fournisseur B — MaghrebAuto (Maroc)**
- Prix unitaire : 7 200 FCFA
- Délai : 25 jours
- Qualité : norme CE, pas de certification africaine
- Transport : en sus (150 000 FCFA forfait)
- Minimum de commande : 100 unités
- Conditions paiement : 50% avance

**Fournisseur C — Local CI — GarageEquip Abidjan**
- Prix unitaire : 11 000 FCFA
- Délai : 3 jours
- Qualité : produits d''occasion remis en état
- Transport : livraison gratuite 24h Abidjan
- Minimum de commande : 10 unités
- Conditions paiement : comptant

**Ta mission :**
1. Créer un tableau comparatif multicritères (prix total, délai, qualité, risque)
2. Calculer le coût total réel pour 100 unités chez chaque fournisseur
3. Recommander un fournisseur en argumentant ton choix
4. Rédiger l''email de commande au fournisseur choisi',
'[{"nom": "Pertinence", "poids": 30, "description": "Tous les critères pertinents sont comparés"}, {"nom": "Analyse", "poids": 30, "description": "Le coût total est bien calculé et la décision justifiée"}, {"nom": "Clarté", "poids": 20, "description": "Le tableau et l email sont professionnels"}, {"nom": "Créativité", "poids": 20, "description": "Des critères de risque innovants (géopolitique, change FCFA...)"}]');

END $$;
```

---

## ÉTAPE 5 — Configurer l'authentification Supabase

Dans Supabase → **Authentication → Settings** :

1. **Email Auth** : activer "Enable email confirmations" = **OFF** pour le développement (ON en production)
2. **Site URL** : mettre `http://localhost:3000` (dev) ou ton URL Vercel (prod)
3. **Redirect URLs** : ajouter `http://localhost:3000/**` et `https://ton-app.vercel.app/**`

---

## ÉTAPE 6 — Récupérer la clé Anthropic

1. Va sur **https://console.anthropic.com**
2. **API Keys** → "Create Key"
3. Copie la clé (commence par `sk-ant-...`)

---

## ÉTAPE 7 — Configurer les variables d'environnement en local

Copie le fichier exemple et remplis avec tes vraies clés :

```bash
copy .env.local.example .env.local
```

Ouvre `.env.local` et remplis :

```env
NEXT_PUBLIC_SUPABASE_URL=https://cqfklzsvjbmpmtvawsen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_LGWm-ilZqwGtqCjrNzZjLg_ojStA34Z
SUPABASE_SERVICE_ROLE_KEY=sb_secret_IUP0y2CxE45ZLrfqELcvJA_GG1qujoq
ANTHROPIC_API_KEY=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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Puis lance l'app :

```bash
npm install
npm run dev
```

L'app tourne sur **http://localhost:3000**

---

## ÉTAPE 8 — Déployer sur Vercel

### 8.1 Créer le projet Vercel

1. Va sur **https://vercel.com** → "Add New Project"
2. **Import Git Repository** → sélectionne `HABIBKOFFI/baara-skills`
3. **Framework Preset** : Next.js (auto-détecté)
4. **Root Directory** : laisser vide (le repo est à la racine)
5. **Branch** : `claude/setup-baara-guide-LKVkp`

### 8.2 Ajouter les variables d'environnement dans Vercel

Avant de déployer, dans la section **Environment Variables** de Vercel :

| Clé | Valeur | Environnement |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ton URL Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ta clé anon | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | ta clé service_role | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | ta clé Anthropic | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://ton-app.vercel.app` | Production |

### 8.3 Déployer

Clique "Deploy" → attends ~2 minutes → ton app est en ligne !

### 8.4 Mettre à jour Supabase avec l'URL de production

Dans Supabase → **Authentication → Settings** :
- **Site URL** : remplace par `https://ton-app.vercel.app`
- **Redirect URLs** : ajoute `https://ton-app.vercel.app/**`

---

## ÉTAPE 9 — Créer le premier compte admin

1. Va sur ton app déployée → `/auth` → crée un compte
2. Dans Supabase → **Table Editor → profiles**
3. Trouve ton utilisateur et change `role` de `apprenant` à `admin`
4. Tu as maintenant accès à `/admin/simulations`, `/admin/utilisateurs`, `/admin/metriques`

---

## Vérification finale

Teste ces parcours dans l'ordre :

- [ ] `/auth` — Inscription avec email/mot de passe
- [ ] `/onboarding` — Remplir le profil en 3 étapes
- [ ] `/catalogue` — Voir les 4 simulations
- [ ] `/simulation/sim-finance` — Détail d'une simulation + bouton "Commencer"
- [ ] Module 1 — Rédiger un livrable + soumettre → feedback IA en ~10s
- [ ] `/simulation/sim-finance/feedback/[id]` — Lire le feedback IA
- [ ] `/profil` — Voir son profil et ses certificats

---

## Problèmes fréquents

| Problème | Solution |
|---|---|
| `Invalid API key` Supabase | Vérifier que les clés dans `.env.local` correspondent bien au bon projet Supabase |
| `Failed to fetch` sur le feedback | Vérifier que `ANTHROPIC_API_KEY` est bien configurée dans Vercel |
| Redirection infinie vers `/auth` | Vérifier la **Site URL** dans Supabase Auth Settings |
| RLS bloquant les requêtes | Vérifier que les policies RLS sont bien créées (Étape 3) |
| Build échoue sur Vercel | Vérifier que toutes les variables d'environnement sont configurées |
