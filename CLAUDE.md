# BAARA — Guide de Développement pour Claude Code
## 🎯 Contexte du Projet
**BAARA** est une plateforme panafricaine de simulations métiers orientée employabilité. Elle permet aux jeunes diplômés africains d'acquérir une expérience professionnelle vérifiable via des simulations réalistes co-créées avec des entreprises partenaires.
**Pitch en une phrase :** BAARA comble le fossé entre diplôme et emploi en donnant aux jeunes africains une expérience professionnelle réelle et certifiée avant même leur premier recrutement.
**Lancement pilote :** Côte d'Ivoire (Abidjan) — 500 apprenants beta, 5 entreprises partenaires.
---
## 🛠️ Stack Technique
| Couche | Technologie | Version |
|---|---|---|
| Framework Frontend | Next.js (App Router) | 15 |
| Langage | TypeScript | strict mode |
| UI Framework | Tailwind CSS + Shadcn/UI | latest |
| PWA | next-pwa + Workbox | — |
| Base de données | PostgreSQL via Supabase | — |
| Auth | Supabase Auth | — |
| Stockage fichiers | Supabase Storage | — |
| IA Feedback | Claude API (claude-haiku-4-5) | — |
| Génération PDF | React-PDF | — |
| Emails | Resend | — |
| Hébergement | Vercel | — |
| CI/CD | GitHub Actions | — |
| Monitoring | Vercel Analytics | — |
**Architecture :** PWA Next.js → API Routes Next.js → Supabase (PostgreSQL + Auth + Storage)
---
## 🎨 Design System BAARA
### Couleurs
```css
--color-primary: #1A2742;      /* Bleu marine — nav, headers, boutons primaires */
--color-accent: #E9A23B;       /* Orange — CTA, badges, accent */
--color-background: #F8F9FA;   /* Fond principal */
--color-surface: #FFFFFF;      /* Cards, modales */
--color-text-primary: #1A1A1A; /* Texte principal */
--color-text-secondary: #6B7280; /* Texte secondaire, labels */
--color-success: #10B981;      /* Validé, certifié */
--color-error: #EF4444;        /* Erreurs */
--color-border: #E5E7EB;       /* Bordures, séparateurs */
```
### Typographie
- **Police :** IBM Plex Sans (Google Fonts)
- **Taille minimum mobile :** 16px
- **Hiérarchie :**
  - H1 : 28px bold
  - H2 : 22px bold
  - H3 : 18px semibold
  - Body : 16px regular
  - Caption : 14px regular
### Composants
- **Border radius :** 12px cards, 8px boutons, 6px inputs
- **Boutons tactiles :** minimum 44px de hauteur (accessibilité mobile)
- **Padding cards :** 16px mobile, 24px desktop
- **Padding latéral page :** 16px mobile, 24px desktop, auto desktop large
- **Ombres cards :** `shadow-sm` en repos, `shadow-md` au hover
### Tokens Tailwind à utiliser
```
bg-[#1A2742]   → primaire
bg-[#E9A23B]   → accent
text-[#1A2742] → texte primaire fort
text-[#6B7280] → texte secondaire
rounded-xl     → cards (12px)
rounded-lg     → boutons (8px)
min-h-[44px]   → tous les éléments cliquables
```
---
## 👥 Types d'Utilisateurs & Rôles
| Rôle | Description | Accès |
|---|---|---|
| `apprenant` | Jeune diplômé cherchant de l'expérience | Simulations, profil, certificats |
| `recruteur` | RH ou manager d'entreprise partenaire | Dashboard recruteur, profils certifiés |
| `admin` | Équipe BAARA | Back-office complet |
---
## 📚 Les 4 Simulations MVP
| ID | Titre | Entreprise partenaire | Durée | Niveau |
|---|---|---|---|---|
| `sim-finance` | Analyste Financier Junior | MTN Côte d'Ivoire | 6h | Intermédiaire |
| `sim-dev` | Développeur Web Freelance | Freelance Afrique | 8h | Débutant |
| `sim-rh` | Chargé de Recrutement | Cabinet RH Abidjan | 4h | Débutant |
| `sim-supply` | Assistant Supply Chain | CFAO | 5h | Intermédiaire |
Chaque simulation = 4 modules : Découverte → Analyse → Production → (Présentation optionnel)
---
## 🗄️ Schéma Base de Données (Supabase)
```sql
-- Utilisateurs (étend auth.users de Supabase)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  role text CHECK (role IN ('apprenant', 'recruteur', 'admin')),
  prenom text,
  nom text,
  ville text DEFAULT 'Abidjan',
  domaine_etudes text,
  niveau_etudes text,
  photo_url text,
  linkedin_url text,
  visible_recruteurs boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)
-- Simulations
simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  titre text,
  description text,
  entreprise_partenaire text,
  logo_entreprise_url text,
  duree_heures int,
  niveau text CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé')),
  domaine text,
  actif boolean DEFAULT true,
  ordre int,
  created_at timestamptz DEFAULT now()
)
-- Modules d'une simulation
modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid REFERENCES simulations,
  titre text,
  description text,
  ordre int,
  type text CHECK (type IN ('decouverte', 'analyse', 'production', 'presentation')),
  briefing_contenu text,
  ressources jsonb DEFAULT '[]',
  criteres_evaluation jsonb DEFAULT '[]'
)
-- Progression d'un apprenant sur une simulation
enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid REFERENCES profiles,
  simulation_id uuid REFERENCES simulations,
  statut text CHECK (statut IN ('en_cours', 'complete', 'abandonne')) DEFAULT 'en_cours',
  module_actuel_id uuid REFERENCES modules,
  score_global int,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(apprenant_id, simulation_id)
)
-- Livrables soumis par les apprenants
submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid REFERENCES profiles,
  module_id uuid REFERENCES modules,
  enrollment_id uuid REFERENCES enrollments,
  contenu_texte text,
  fichiers_urls jsonb DEFAULT '[]',
  statut text CHECK (statut IN ('en_attente', 'evalue')) DEFAULT 'en_attente',
  submitted_at timestamptz DEFAULT now()
)
-- Feedbacks générés par l'IA
feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions,
  score_global int CHECK (score_global BETWEEN 0 AND 100),
  score_pertinence int,
  score_analyse int,
  score_clarte int,
  score_creativite int,
  mention text CHECK (mention IN ('Insuffisant', 'Satisfaisant', 'Bien', 'Très bien', 'Excellent')),
  points_forts jsonb DEFAULT '[]',
  axes_amelioration jsonb DEFAULT '[]',
  commentaire_detaille text,
  generated_at timestamptz DEFAULT now()
)
-- Certificats générés
certificats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid REFERENCES profiles,
  simulation_id uuid REFERENCES simulations,
  enrollment_id uuid REFERENCES enrollments,
  score_final int,
  mention text,
  pdf_url text,
  numero_certificat text UNIQUE,
  issued_at timestamptz DEFAULT now()
)
```
---
## 📱 Écrans à Développer (Priorité P0 → P2)
### P0 — Parcours Apprenant (priorité absolue)
- `/(auth)/auth` — Inscription / Connexion
- `/(apprenant)/onboarding` — Onboarding 3 étapes
- `/(apprenant)/catalogue` — Catalogue des simulations
- `/(apprenant)/simulation/[id]` — Page détail simulation
- `/(apprenant)/simulation/[id]/module/[moduleId]` — Module de travail
- `/(apprenant)/simulation/[id]/feedback/[submissionId]` — Feedback IA
- `/(apprenant)/certificat/[id]` — Certificat de complétion
### P1 — Profil & Recruteur
- `/(apprenant)/profil` — Profil apprenant + CV généré
- `/(recruteur)/dashboard` — Dashboard recruteur
- `/(recruteur)/candidats` — Recherche / filtrage profils
- `/(recruteur)/candidats/[id]` — Fiche candidat détaillée
### P2 — Administration
- `/(admin)/simulations` — Gestion des simulations
- `/(admin)/utilisateurs` — Gestion des utilisateurs
- `/(admin)/metriques` — Dashboard métriques
---
## ⚡ Règles de Développement
### Performance (marché africain)
- Bundle JS initial < 200 Ko (gzippé)
- Images : format WebP obligatoire, lazy loading systématique
- Temps de chargement cible < 3s en 3G
- PWA : mode offline pour lecture briefing et rédaction livrable
### Mobile-First
- Concevoir toujours pour 375px en premier
- Tous les éléments cliquables : min 44px hauteur et largeur
- Padding latéral : 16px sur mobile
- Police minimum : 16px sur mobile
- Pas d'overflow horizontal autorisé
### TypeScript
- Strict mode activé
- Typage explicite sur tous les props de composants
- Interfaces dans `/types/` pour les entités métier
- Pas de `any` sauf cas absolument nécessaire
### Composants
- Toujours créer des composants réutilisables dans `/components/`
- Gestion obligatoire des états : `loading`, `error`, `empty`, `success`
- Skeleton loaders sur tous les composants qui fetchent des données
- Messages d'erreur en français, clairs et actionnables
### Appels API (Claude pour le feedback)
- Jamais d'appel direct client → API Claude (sécurité)
- Toujours passer par une API Route Next.js `/api/feedback`
- Rate limiting : max 5 soumissions par jour par apprenant
- Timeout : 30 secondes max par requête Claude
### Sécurité
- RLS (Row Level Security) activé sur toutes les tables Supabase
- Vérification du rôle sur chaque API Route sensible
- Livrables visibles aux recruteurs seulement si `visible_recruteurs = true`
---
## 🤖 Prompt Système Claude API (Feedback IA)
Utiliser ce prompt système pour les appels de feedback :
```
Tu es un évaluateur expert et bienveillant pour BAARA, une plateforme
de simulations métiers africaine.
Tu évalues le travail d'un jeune diplômé sur une simulation professionnelle.
Sois encourageant mais honnête. Adapte ton langage à un public francophone
africain (Côte d'Ivoire).
Évalue selon ces 4 critères (chacun sur 100) :
1. Pertinence (30%) : Le livrable répond-il au briefing et aux objectifs ?
2. Qualité d'analyse (30%) : La réflexion est-elle structurée et argumentée ?
3. Clarté et présentation (20%) : Le livrable est-il professionnel et lisible ?
4. Créativité et initiative (20%) : L'apprenant a-t-il apporté de la valeur ajoutée ?
Retourne UNIQUEMENT un objet JSON valide avec cette structure :
{
  "score_global": number (0-100),
  "score_pertinence": number (0-100),
  "score_analyse": number (0-100),
  "score_clarte": number (0-100),
  "score_creativite": number (0-100),
  "mention": "Insuffisant" | "Satisfaisant" | "Bien" | "Très bien" | "Excellent",
  "points_forts": string[] (2-3 points concrets),
  "axes_amelioration": string[] (2-3 suggestions concrètes),
  "commentaire_detaille": string (3-4 phrases encourageantes et constructives)
}
Barème mention : 0-49 → Insuffisant, 50-64 → Satisfaisant,
65-74 → Bien, 75-89 → Très bien, 90-100 → Excellent
```
---
## 📁 Structure de Fichiers Recommandée
```
baara/
├── app/
│   ├── (auth)/
│   │   └── auth/page.tsx
│   ├── (apprenant)/
│   │   ├── layout.tsx              # Layout avec nav apprenant
│   │   ├── onboarding/page.tsx
│   │   ├── catalogue/page.tsx
│   │   └── simulation/
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── module/[moduleId]/page.tsx
│   │           ├── feedback/[submissionId]/page.tsx
│   │           └── certificat/page.tsx
│   ├── (recruteur)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   └── candidats/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── (admin)/
│   │   └── ...
│   └── api/
│       ├── feedback/route.ts       # Appel Claude API
│       ├── certificat/route.ts     # Génération PDF
│       └── submit/route.ts         # Soumission livrable
├── components/
│   ├── ui/                         # Shadcn/UI (auto-généré)
│   ├── simulation/
│   │   ├── SimulationCard.tsx
│   │   ├── ModuleNav.tsx
│   │   └── FeedbackDisplay.tsx
│   ├── profil/
│   │   └── ProfilCard.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── SkeletonCard.tsx
│       └── ErrorState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client côté browser
│   │   └── server.ts               # Client côté serveur
│   ├── claude.ts                   # Wrapper Claude API
│   └── utils.ts
├── types/
│   ├── simulation.ts
│   ├── profile.ts
│   └── submission.ts
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/
└── CLAUDE.md                       # CE FICHIER
```
---
## ✅ Checklist avant chaque commit
- [ ] Composant testé sur mobile 375px
- [ ] États loading / error / empty gérés
- [ ] Textes en français
- [ ] Couleurs conformes au design system BAARA
- [ ] Pas de `console.log` oubliés
- [ ] Types TypeScript corrects (pas de `any`)
---
## 🚀 Commandes Utiles
```bash
# Développement
npm run dev
# Build de production (test avant deploy)
npm run build
# Linter
npm run lint
# Générer un composant Shadcn
npx shadcn@latest add [composant]
# Vérifier le bundle size
npm run build && npx @next/bundle-analyzer
```
---
*Dernière mise à jour : Février 2026 — MVP Phase*
