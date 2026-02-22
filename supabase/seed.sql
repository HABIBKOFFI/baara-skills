-- BAARA Skills — Seed MVP (4 simulations)
-- Exécuter APRÈS migration.sql dans Supabase SQL Editor

INSERT INTO public.simulations (id,slug,titre,description,entreprise_partenaire,duree_heures,niveau,domaine,actif,ordre) VALUES
('a1000001-0000-0000-0000-000000000001','sim-dev','Développeur Web Freelance','Prends en charge un projet web de bout en bout dans l univers du freelance africain.','Freelance Afrique',8,'Débutant','Informatique & Tech',true,1),
('a1000001-0000-0000-0000-000000000002','sim-rh','Chargé de Recrutement','Gère un processus de recrutement complet pour un cabinet RH d Abidjan.','Cabinet RH Abidjan',4,'Débutant','Ressources Humaines',true,2),
('a1000001-0000-0000-0000-000000000003','sim-finance','Analyste Financier Junior','Analyse les performances financières d une filiale MTN CI.','MTN Côte d Ivoire',6,'Intermédiaire','Finance & Comptabilité',true,3),
('a1000001-0000-0000-0000-000000000004','sim-supply','Assistant Supply Chain','Optimise la chaîne logistique de CFAO Côte d Ivoire.','CFAO',5,'Intermédiaire','Supply Chain & Logistique',true,4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000001-0001-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001','Découverte du projet client','Analyser le besoin client et rédiger le brief.',1,'decouverte','Tu es contacté par Amara Koné, propriétaire d''une boutique de vêtements à Abidjan. Il veut un site vitrine pour "Amara Fashion".

Infos du premier appel :
- Budget : 150 000 FCFA, délai : 3 semaines
- Produits : boubous, robes wax, accessoires
- Aucun site internet, Instagram 2 400 abonnés
- Veut "quelque chose de beau comme les grandes marques"

Ta mission :
1. Reformulation du besoin réel du client
2. Fonctionnalités essentielles (liste priorisée)
3. Questions à poser avant de démarrer
4. Estimation réaliste délai + coût','[{"titre":"Guide brief client","url":"https://www.codeur.com/blog/brief-client/"}]','[{"nom":"Pertinence","poids":30,"description":"Le brief répond-il au besoin réel ?"},{"nom":"Analyse","poids":30,"description":"Les questions sont-elles pertinentes ?"},{"nom":"Clarté","poids":20,"description":"Le document est-il structuré ?"},{"nom":"Réalisme","poids":20,"description":"L estimation est-elle cohérente ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000001-0002-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001','Proposition technique','Concevoir l''architecture et la proposition technique.',2,'analyse','Amara a répondu. Infos complémentaires :
- Afficher produits avec photos et prix
- Formulaire contact WhatsApp (pas de paiement en ligne)
- Photos sur téléphone (qualité variable)
- Gestion simple, sans coder — 70% des clients sur mobile

Ta mission :
1. Choix de la stack technique (avec justification)
2. Architecture des pages du site
3. Contraintes techniques identifiées
4. Planning semaine par semaine
5. Livrables attendus à chaque étape','[{"titre":"Roadmap frontend","url":"https://roadmap.sh/frontend"}]','[{"nom":"Pertinence","poids":30,"description":"Le choix techno est-il adapté ?"},{"nom":"Analyse","poids":30,"description":"Les contraintes ont-elles été identifiées ?"},{"nom":"Clarté","poids":20,"description":"Le planning est-il clair ?"},{"nom":"Initiative","poids":20,"description":"Des solutions créatives sont-elles proposées ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000001-0003-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001','Livraison et rapport final','Préparer le dossier de livraison.',3,'production','Le site est développé (WordPress + Elementor, 3 pages, chargement mobile 2,8s). Amara est peu à l''aise avec l''informatique.

Ta mission :
1. Résumé du projet (livré vs prévu)
2. Guide de prise en main simplifié pour Amara
3. Recommandations pour les 30 premiers jours (SEO, réseaux sociaux)
4. Axes d''amélioration pour une version 2
5. Section "Garantie et support" ','[]','[{"nom":"Pertinence","poids":30,"description":"Le rapport couvre-t-il tous les aspects ?"},{"nom":"Clarté","poids":30,"description":"Le guide est-il compréhensible pour un non-technicien ?"},{"nom":"Analyse","poids":20,"description":"Les recommandations sont-elles actionnables ?"},{"nom":"Initiative","poids":20,"description":"L apprenant va-t-il au-delà du minimum ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000002-0001-0000-0000-000000000001','a1000001-0000-0000-0000-000000000002','Analyse du besoin de recrutement','Comprendre le poste et rédiger la fiche de poste.',1,'decouverte','Mission urgente : recruter 1 Développeur Full-Stack Junior pour SOGECI (45 salariés, services IT).
Délai : en poste dans 6 semaines.

Infos du DG :
- Stack : React + Node.js ou Python
- "Autonome rapidement, on n''a pas le temps de former"
- Budget : 350 000 – 450 000 FCFA
- Présence bureau obligatoire, Abidjan

Ta mission :
1. Fiche de poste complète
2. Canaux de diffusion adaptés au marché ivoirien (avec justification)
3. Calendrier de recrutement sur 6 semaines','[{"titre":"Rédiger une fiche de poste","url":"https://www.cadremploi.fr/editorial/conseils/conseils-recruteur/fiche-de-poste"}]','[{"nom":"Pertinence","poids":30,"description":"La fiche correspond-elle au besoin réel ?"},{"nom":"Analyse","poids":30,"description":"Les canaux sont-ils adaptés au marché ivoirien ?"},{"nom":"Clarté","poids":20,"description":"Le document est-il professionnel ?"},{"nom":"Initiative","poids":20,"description":"Des recommandations pertinentes sont-elles apportées ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000002-0002-0000-0000-000000000001','a1000001-0000-0000-0000-000000000002','Sélection des candidatures','Évaluer les CVs et sélectionner les candidats.',2,'analyse','6 profils intéressants sur 28 candidatures :

Kofi, 24 ans — BTS Info Abidjan, 1 an stage, HTML/CSS/JS, 2 sites PME.
Fatou, 26 ans — Licence Dakar, 2 ans React, veut s''installer à Abidjan. Demande 480 000 FCFA.
Jean-Marc, 28 ans — Master France, React + Node confirmé. Demande 600 000 FCFA.
Bintou, 23 ans — Bootcamp 3 mois, GitHub propre, très motivée. Demande 280 000 FCFA.
Moussa, 27 ans — Licence INPHB, 3 ans PHP/MySQL, veut se reconvertir React. Lettre générique.
Aïcha, 25 ans — BTS + autodidacte, React + Firebase, micro-startup échouée. Demande 380 000 FCFA.

Ta mission :
1. Tableau de scoring des 6 candidats
2. Sélectionne 3 à convoquer (avec justification)
3. Email de convocation pour les retenus
4. Email de refus bienveillant pour les autres','[]','[{"nom":"Pertinence","poids":30,"description":"La sélection est-elle cohérente avec le poste ?"},{"nom":"Analyse","poids":35,"description":"Le scoring est-il rigoureux ?"},{"nom":"Clarté","poids":20,"description":"Les emails sont-ils professionnels ?"},{"nom":"Initiative","poids":15,"description":"L analyse est-elle nuancée ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000002-0003-0000-0000-000000000001','a1000001-0000-0000-0000-000000000002','Rapport de recommandation finale','Synthétiser les entretiens et recommander.',3,'production','Notes d''entretiens :

Kofi : À l''aise à l''oral, test 60%, bonne logique, pas autonome sur projets complexes.
Bintou : Stressée au début, test 75%, GitHub très propre, aucune expérience entreprise.
Aïcha : Très sûre d''elle, test 70%, maturité entrepreneuriale. Demande 380 000 FCFA.

Ta mission — Rapport pour le DG de SOGECI :
1. Synthèse des 3 entretiens (forces / faiblesses)
2. Recommandation argumentée (qui et pourquoi)
3. Conditions de l''offre à proposer
4. Risques identifiés et comment les mitiger
5. Plan d''intégration sur 3 mois','[]','[{"nom":"Pertinence","poids":35,"description":"La recommandation est-elle justifiée ?"},{"nom":"Analyse","poids":30,"description":"Les risques et le plan sont-ils réalistes ?"},{"nom":"Clarté","poids":20,"description":"Le rapport est-il professionnel ?"},{"nom":"Initiative","poids":15,"description":"L apprenant va-t-il au-delà du compte-rendu ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000003-0001-0000-0000-000000000001','a1000001-0000-0000-0000-000000000003','Compréhension du contexte financier','Analyser le contexte macro et les enjeux de MTN CI.',1,'decouverte','Tu rejoins l''équipe Finance de MTN Côte d''Ivoire comme analyste junior.

Contexte macro CI (2024) :
- Croissance PIB : +6,5% | Inflation : 3,2%
- Pénétration mobile : 87% | Croissance mobile money : +34%
- Starlink commence à se déployer en CI

Rapport annuel MTN CI :
- CA : 487 Mds FCFA (+12%) | EBITDA : 198 Mds (marge 40,7%)
- Résultat net : 67 Mds | Dette nette : 145 Mds | CAPEX : 89 Mds
- Mobile Money = 28% du CA

Ta mission :
1. 3 opportunités et 3 risques majeurs pour MTN CI
2. Pourquoi le Mobile Money est-il stratégique ?
3. Calcule ratio Dette Nette/EBITDA et commente (benchmark sain : <2x)
4. Note de synthèse (1 page) pour la direction financière','[{"titre":"Analyse SWOT finance","url":"https://www.investopedia.com/terms/s/swot.asp"}]','[{"nom":"Pertinence","poids":30,"description":"L analyse couvre-t-elle les vrais enjeux ?"},{"nom":"Analyse","poids":35,"description":"Les calculs sont-ils corrects ?"},{"nom":"Clarté","poids":20,"description":"La note est-elle bien structurée ?"},{"nom":"Initiative","poids":15,"description":"L apprenant apporte-t-il un regard original ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000003-0002-0000-0000-000000000001','a1000001-0000-0000-0000-000000000003','Analyse des ratios financiers','Calculer et interpréter les indicateurs de performance.',2,'analyse','Données MTN CI (milliards FCFA) sur 3 ans :

              2022 / 2023 / 2024
CA          : 388  / 435  / 487
EBITDA      : 148  / 172  / 198
Résultat net:  41  /  54  /  67
Capitaux pr.: 189  / 218  / 251
Dette nette : 178  / 162  / 145
CAPEX       : 112  /  98  /  89
Free CF     :  36  /  74  / 109

Ta mission :
1. Rentabilité : Marge EBITDA, Marge nette, ROE
2. Endettement : Dette Nette/EBITDA, Gearing
3. Efficacité : Intensité capitalistique (CAPEX/CA), Conversion cash (FCF/EBITDA)

Pour chaque ratio : valeur sur 3 ans + tendance + comparaison benchmarks sectoriels (marge EBITDA télécom : 35-45%, ROE : 15-25%).
Conclus par une note globale sur la santé financière.','[{"titre":"Ratios financiers clés","url":"https://www.investopedia.com/financial-ratios-4689817"}]','[{"nom":"Pertinence","poids":25,"description":"Les ratios sont-ils adaptés au secteur télécom ?"},{"nom":"Analyse","poids":40,"description":"Les calculs et interprétations sont-ils corrects ?"},{"nom":"Clarté","poids":20,"description":"La présentation est-elle lisible ?"},{"nom":"Initiative","poids":15,"description":"L apprenant va-t-il au-delà des calculs ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000003-0003-0000-0000-000000000001','a1000001-0000-0000-0000-000000000003','Rapport et recommandations stratégiques','Rédiger le rapport pour le comité de direction.',3,'production','La Directrice Financière attend ton rapport final.

Question centrale : MTN CI est-elle en bonne santé financière et quelles sont les priorités pour les 12 prochains mois ?

Contraintes :
- Public non exclusivement financier
- 2 pages max + annexes
- Recommandations concrètes et chiffrées

Ta mission :
1. Executive Summary (5-6 lignes)
2. Analyse de la performance (ce qui va bien, ce qui préoccupe)
3. 3 risques financiers majeurs (probabilité + impact)
4. 3-4 recommandations stratégiques concrètes
5. Conclusion : ton verdict global','[]','[{"nom":"Pertinence","poids":30,"description":"Le rapport répond-il à la question posée ?"},{"nom":"Analyse","poids":35,"description":"Les recommandations sont-elles fondées sur les données ?"},{"nom":"Clarté","poids":20,"description":"Le rapport est-il accessible à un public non-financier ?"},{"nom":"Initiative","poids":15,"description":"Des idées pertinentes sont-elles proposées ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000004-0001-0000-0000-000000000001','a1000001-0000-0000-0000-000000000004','Diagnostic de la chaîne logistique','Analyser les dysfonctionnements et identifier les priorités.',1,'decouverte','Tu rejoins CFAO CI (distribution Toyota, Peugeot, Mitsubishi) comme assistant Supply Chain.

Problèmes remontés :
- Délai livraison véhicule : 87 jours (objectif : 60 jours)
- Ruptures pièces : 23% (objectif : <10%)
- 3 fournisseurs sur 8 : retards >30 jours ce trimestre
- Stock immobilisé : 890 millions FCFA
- Clients sans visibilité sur leurs commandes
- 2 techniciens démissionnés "à cause du désordre"

Activité trimestrielle :
- Véhicules commandés : 156 | Livrés dans délai : 89 (57%)
- Interventions atelier : 1 240 | Avec retard pièces : 287 (23%)

Ta mission :
1. Diagnostic 3 dysfonctionnements majeurs (cause racine, impact, urgence)
2. Matrice de priorisation (Impact × Urgence)
3. 2 quick wins à fort impact
4. Note de cadrage pour le directeur Supply Chain','[{"titre":"Méthode 5 pourquoi","url":"https://www.manager-go.com/gestion-de-projet/5-pourquoi.htm"}]','[{"nom":"Pertinence","poids":30,"description":"Le diagnostic identifie-t-il les vrais problèmes ?"},{"nom":"Analyse","poids":35,"description":"La priorisation est-elle rigoureuse ?"},{"nom":"Clarté","poids":20,"description":"La note est-elle bien structurée ?"},{"nom":"Initiative","poids":15,"description":"Les quick wins sont-ils réalistes ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000004-0002-0000-0000-000000000001','a1000001-0000-0000-0000-000000000004','Optimisation des stocks','Analyser les données et proposer un plan d''optimisation.',2,'analyse','Données stock top 10 (val. unit. en FCFA, délai fournisseur en jours) :

TOY-001 Filtre huile Toyota    stock:450 val:8500    conso:120/mois délai:15j
PEU-034 Plaquettes frein       stock:12  val:45000   conso:35/mois  délai:45j
MIT-017 Courroie distribution  stock:8   val:78000   conso:12/mois  délai:60j
TOY-089 Batterie 60Ah          stock:180 val:65000   conso:40/mois  délai:20j
PEU-102 Amortisseur AV         stock:3   val:125000  conso:18/mois  délai:45j
TOY-234 Kit embrayage          stock:25  val:185000  conso:8/mois   délai:30j
MIT-056 Radiateur complet      stock:2   val:320000  conso:4/mois   délai:75j
PEU-078 Alternateur            stock:6   val:195000  conso:10/mois  délai:50j
TOY-445 Pneu 205/55R16         stock:320 val:55000   conso:80/mois  délai:10j
MIT-023 Cardan complet         stock:1   val:285000  conso:5/mois   délai:65j

Ta mission :
1. Stock de sécurité pour chaque référence (formule : délai_jours × conso_journalière × 1,5)
2. Références en rupture imminente (stock < stock de sécurité)
3. Bons de commande prioritaires pour les 3 pièces les plus critiques
4. Classification ABC (A = 80% valeur, B = 15%, C = 5%)
5. Actions pour réduire le stock immobilisé de 20% sans risquer de ruptures','[{"titre":"Gestion stocks ABC","url":"https://www.manager-go.com/logistique/gestion-stocks-abc.htm"}]','[{"nom":"Pertinence","poids":25,"description":"Les calculs répondent-ils aux besoins opérationnels ?"},{"nom":"Analyse","poids":40,"description":"Les calculs et la classification ABC sont-ils corrects ?"},{"nom":"Clarté","poids":20,"description":"Les recommandations sont-elles claires ?"},{"nom":"Initiative","poids":15,"description":"Les optimisations sont-elles créatives ?"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id,simulation_id,titre,description,ordre,type,briefing_contenu,ressources,criteres_evaluation) VALUES
('b1000004-0003-0000-0000-000000000001','a1000001-0000-0000-0000-000000000004','Plan d''amélioration et rapport final','Proposer un plan d''action complet.',3,'production','Le Directeur Supply Chain attend ton plan d''action.

Objectifs : délai livraison 87→60 jours, ruptures 23%→<10%
Budget transformation : 15 millions FCFA max | Résultats en 3 mois
Contraintes : équipe de 6, système = Excel partagé, fournisseurs asiatiques inflexibles

Ta mission :
1. Synthèse : 3 problèmes prioritaires + coût estimé pour l''entreprise
2. Plan d''actions 3 mois : action / responsable / délai / budget / KPI
3. Outil recommandé pour remplacer Excel (coût + bénéfices)
4. Stratégie de négociation avec les fournisseurs défaillants
5. Budget et ROI du plan sur 6 mois
6. 2 risques principaux et comment les gérer','[]','[{"nom":"Pertinence","poids":30,"description":"Le plan répond-il aux objectifs fixés ?"},{"nom":"Analyse","poids":30,"description":"Le ROI et les KPIs sont-ils réalistes ?"},{"nom":"Clarté","poids":20,"description":"Le plan est-il actionnable ?"},{"nom":"Initiative","poids":20,"description":"Des solutions innovantes pour le contexte africain ?"}]')
ON CONFLICT (id) DO NOTHING;
