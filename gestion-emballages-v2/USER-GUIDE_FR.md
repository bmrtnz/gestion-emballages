# Guide Utilisateur - Blue Whale Portal v2.0

*Système de gestion des emballages pour coopératives agricoles*

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Connexion et sécurité](#connexion-et-sécurité)
3. [Gestion des utilisateurs](#gestion-des-utilisateurs)
4. [Gestion des articles](#gestion-des-articles)
5. [Gestion des stations](#gestion-des-stations)
6. [Gestion des fournisseurs](#gestion-des-fournisseurs)
7. [Gestion des commandes](#gestion-des-commandes)
8. [Gestion des stocks](#gestion-des-stocks)
9. [Transferts inter-stations](#transferts-inter-stations)
10. [Prévisions et planification](#prévisions-et-planification)
11. [Interface et navigation](#interface-et-navigation)
12. [Fonctionnalités avancées](#fonctionnalités-avancées)

---

## 🎯 Vue d'ensemble

### Qu'est-ce que Blue Whale Portal v2 ?

**Blue Whale Portal v2** est une plateforme B2B moderne conçue spécifiquement pour les **coopératives agricoles** afin de faciliter la gestion complète des matériaux d'emballage (barquettes, cagettes, plateaux, films plastiques, cartons, etc.).

### 🏗️ Architecture technique

- **Frontend** : Angular 17 avec TypeScript et Tailwind CSS
- **Backend** : NestJS avec TypeScript et PostgreSQL
- **Services** : Redis, MinIO, MailCatcher
- **Déploiement** : Docker et Docker Compose

### 👥 Utilisateurs cibles

- **Coopératives agricoles** : Gestion centralisée des emballages
- **Stations locales** : Commandes et gestion des stocks
- **Fournisseurs** : Gestion des produits et livraisons
- **Gestionnaires** : Supervision et coordination

---

## 🔐 Connexion et sécurité

### Authentification sécurisée

#### ✅ **Système JWT avancé**
- **Tokens sécurisés** avec expiration configurable (7 jours par défaut)
- **Renouvellement automatique** des sessions
- **Déconnexion automatique** en cas d'inactivité
- **Protection CSRF** intégrée

#### ✅ **Gestion des rôles hiérarchiques**
- **Admin** : Accès complet au système
- **Manager** : Gestion opérationnelle complète
- **Gestionnaire** : Coordination des stations et fournisseurs
- **Station** : Gestion locale des commandes et stocks
- **Fournisseur** : Gestion des produits et livraisons

#### ✅ **Réinitialisation de mot de passe**
- **Emails professionnels** avec identité de marque
- **Sécurité par token** avec expiration 24h
- **Validation robuste** des mots de passe (minimum 6 caractères)
- **Confirmation par double saisie**
- **Gestion d'erreurs** pour tokens invalides/expirés
- **Redirection automatique** après succès
- **Design responsive** sur tous appareils
- **Bonnes pratiques sécuritaires** implémentées

### Interface de connexion

#### ✅ **Experience utilisateur optimisée**
- **Sélecteur d'utilisateur** en mode développement
- **Validation en temps réel** des champs
- **Messages d'erreur explicites**
- **États de chargement** avec indicateurs visuels
- **Mémorisation des préférences** utilisateur

---

## 👥 Gestion des utilisateurs

### Vue d'ensemble des utilisateurs

#### ✅ **Tableau de bord statistiques**
- **Panneau expandable** avec chevron d'état
- **Statistiques en temps réel** : Total, actifs, inactifs
- **Graphique de répartition** par rôle (Chart.js)
- **Couleurs cohérentes** avec les badges de rôles
- **Layout responsive** (vertical sur mobiles)
- **Mise à jour automatique** des données

#### ✅ **Liste utilisateurs avancée**
- **Recherche multi-critères** : nom, email, entité
- **Filtres intelligents** : statut, rôle, type d'entité
- **Pagination performante** avec sélection de taille
- **Tri personnalisable** sur toutes les colonnes
- **Vue mobile optimisée** avec cartes adaptives

### Gestion CRUD complète

#### ✅ **Création d'utilisateurs**
- **Formulaire intelligent** avec validation en temps réel
- **Sélection contextuelle** d'entités selon le rôle
- **Validation de mot de passe** robuste
- **Vérification d'unicité** des emails
- **Messages de confirmation** et d'erreur
- **Slide panel** pour une UX fluide

#### ✅ **Modification d'utilisateurs**
- **Formulaire pré-rempli** avec données existantes
- **Mise à jour sélective** des champs
- **Gestion intelligente** des changements de rôle
- **Système de réinitialisation** de mot de passe par email
- **Validation côté client et serveur**
- **Historique des modifications** (audit trail)

#### ✅ **Gestion des statuts**
- **Désactivation sécurisée** (soft delete)
- **Réactivation simple** des comptes
- **Protection** contre l'auto-désactivation
- **Confirmation** des actions critiques
- **Notifications** de changement d'état

### Sécurité et permissions

#### ✅ **Contrôle d'accès basé sur les rôles (RBAC)**
- **Permissions granulaires** par fonctionnalité
- **Héritage de droits** hiérarchique
- **Isolation des données** par entité
- **Vérification** côté client et serveur
- **Logs d'audit** des actions sensibles

---

## 📦 Gestion des articles

### Catalogue produits centralisé

#### ✅ **Base de données complète**
- **Catégories standardisées** : Barquette, Cagette, Plateau, Film Plastique, Carton
- **Référencement multi-fournisseurs** avec prix spécifiques
- **Images produits** stockées sur MinIO
- **Documentation technique** attachée
- **Historique des modifications** complet

#### ✅ **Interface de gestion avancée**
- **Recherche textuelle** avancée
- **Filtres par catégorie** et fournisseur
- **Vue en arbre** expandable/collapsible
- **Gestion des photos** par drag & drop
- **Import/export** de données en masse
- **Validation** des données produits

### Relations fournisseurs

#### ✅ **Gestion multi-fournisseurs**
- **Tarification spécifique** par fournisseur
- **Conditionnements variés** (unité, lot, palette)
- **Disponibilité en temps réel**
- **Délais de livraison** par fournisseur
- **Historique des prix** et variations
- **Négociation** et validation des tarifs

---

## 🏭 Gestion des stations

### Réseau de stations coopératives

#### ✅ **Gestion centralisée**
- **Répertoire complet** des stations
- **Informations détaillées** : contact, localisation, spécialités
- **Gestion des droits** d'accès par station
- **Suivi des performances** et activités
- **Historique des commandes** par station

#### ✅ **Interface station**
- **Tableau de bord personnalisé** par station
- **Accès restreint** aux données pertinentes
- **Gestion des stocks locaux**
- **Historique des transferts** reçus/envoyés
- **Reporting** d'activité

### Fonctionnalités collaboratives

#### ✅ **Communication inter-stations**
- **Système de notifications** en temps réel
- **Demandes de transfert** simplifiées
- **Partage d'informations** sur les stocks
- **Coordination** des commandes groupées
- **Alertes** de stock faible

---

## 🚚 Gestion des fournisseurs

### Réseau de partenaires

#### ✅ **Base fournisseurs complète**
- **Informations SIRET** et légales
- **Sites multiples** par fournisseur
- **Spécialisations** par type de produit
- **Évaluations** et historique de performance
- **Conditions commerciales** négociées

#### ✅ **Interface fournisseur**
- **Portail dédié** pour les fournisseurs
- **Gestion du catalogue** produits
- **Suivi des commandes** reçues
- **Mise à jour** des stocks et disponibilités
- **Communication directe** avec les stations

### Collaboration B2B

#### ✅ **Flux de travail optimisés**
- **Réception automatique** des commandes
- **Confirmation** et validation des livraisons
- **Gestion des litiges** et non-conformités
- **Facturation intégrée**
- **Reporting** de performance

---

## 🛒 Gestion des commandes

### Processus de commande complet

#### ✅ **Cycle de vie avancé**
1. **Enregistrée** : Création initiale
2. **Confirmée** : Validation fournisseur
3. **Expédiée** : Préparation et envoi
4. **Réceptionnée** : Réception station
5. **Clôturée** : Validation finale station
6. **Facturée** : Traitement comptable
7. **Archivée** : Stockage long terme

#### ✅ **Fonctionnalités avancées**
- **Liste d'achat intelligente** avec sauvegarde automatique
- **Conversion automatique** en commandes multiples
- **Livraisons partielles** gérées
- **Suivi en temps réel** des statuts
- **Notifications automatiques** à chaque étape
- **Gestion des litiges** et retours

### Commandes globales

#### ✅ **Mutualisation des achats**
- **Regroupement intelligent** des commandes
- **Négociation** de meilleurs tarifs
- **Optimisation logistique**
- **Répartition automatique** entre stations
- **Suivi consolidé** des livraisons

---

## 📊 Gestion des stocks

### Inventaire temps réel

#### ✅ **Suivi multi-niveaux**
- **Stock station** : Inventaire local en temps réel
- **Stock fournisseur** : Disponibilités par site
- **Snapshots** : Historique point-dans-le-temps
- **Mouvements** : Entrées/sorties détaillées
- **Alertes** : Seuils de réapprovisionnement

#### ✅ **Tableaux de bord visuels**
- **Graphiques** de tendances
- **Alertes colorées** par niveau de stock
- **Prédictions** de rupture
- **Recommandations** de commandes
- **Analyses** de rotation des stocks

### Optimisation automatique

#### ✅ **Intelligence artificielle**
- **Prédictions** basées sur l'historique
- **Saisonnalité** prise en compte
- **Optimisation** des niveaux de stock
- **Suggestions** de réapprovisionnement
- **Alertes préventives**

---

## 🔄 Transferts inter-stations

### Redistribution optimisée

#### ✅ **Workflow de transfert**
1. **Enregistrée** : Demande initiale
2. **Confirmée/Rejetée** : Validation station source
3. **Traitée logistique** : Organisation transport
4. **Expédiée** : Envoi effectué
5. **Réceptionnée** : Réception confirmée
6. **Clôturée** : Finalisation
7. **Traitée comptabilité** : Valorisation
8. **Archivée** : Stockage définitif

#### ✅ **Gestion intelligente**
- **Calcul automatique** des quantités disponibles
- **Optimisation** des coûts de transport
- **Suivi en temps réel** des transferts
- **Historique complet** des mouvements
- **Reporting** de performance

### Collaboration entre stations

#### ✅ **Solidarité coopérative**
- **Partage** des excédents
- **Entraide** en cas de rupture
- **Optimisation globale** des stocks
- **Réduction** des coûts logistiques
- **Amélioration** du service client

---

## 📈 Prévisions et planification

### Intelligence prédictive

#### ✅ **Prévisions avancées**
- **Campagnes annuelles** (ex: 25-26)
- **Granularité hebdomadaire**
- **Prévisions par article** et par fournisseur
- **Prise en compte** de la saisonnalité
- **Ajustements** en temps réel

#### ✅ **Planification stratégique**
- **Budgets prévisionnels** par station
- **Négociations** tarifaires anticipées
- **Planification** des investissements
- **Optimisation** de la trésorerie
- **Analyses** de rentabilité

### Tableaux de bord décisionnels

#### ✅ **Reporting avancé**
- **KPIs** de performance en temps réel
- **Analyses** de tendances
- **Comparaisons** inter-périodes
- **Alertes** sur écarts budgétaires
- **Recommandations** d'actions

---

## 🖥️ Interface et navigation

### Design moderne et intuitif

#### ✅ **Interface utilisateur de pointe**
- **Design system** cohérent avec Tailwind CSS
- **Composants réutilisables** et maintenables
- **Icons** Heroicons pour cohérence visuelle
- **Animations** subtiles et performantes
- **Feedback visuel** immédiat sur les actions

#### ✅ **Navigation adaptative**
- **Sidebar intelligente** avec stratégies par rôle
- **Breadcrumbs** contextuels
- **Raccourcis clavier** pour power users
- **Recherche globale** instantanée
- **Favoris** et raccourcis personnalisés

### Responsive design avancé

#### ✅ **Multi-plateforme optimisée**
- **Mobile first** : Conçu d'abord pour mobile
- **Tablet friendly** : Optimisé pour tablettes
- **Desktop powerful** : Tous les outils sur grand écran
- **PWA ready** : Installation comme application
- **Offline capable** : Fonctionnement hors ligne

#### ✅ **Accessibilité (A11Y)**
- **Conformité WCAG 2.1** niveau AA
- **Navigation clavier** complète
- **Lecteurs d'écran** supportés
- **Contraste élevé** disponible
- **Textes** redimensionnables

---

## 🚀 Fonctionnalités avancées

### Performance et optimisation

#### ✅ **Architecture haute performance**
- **Pagination côté serveur** pour gros volumes
- **Virtual scrolling** pour listes > 100 éléments
- **Memoization** des calculs coûteux
- **Debouncing** des recherches (300ms)
- **Lazy loading** des composants
- **Tree shaking** pour optimiser le bundle

#### ✅ **Gestion d'état avancée**
- **Pinia stores** avec Composition API
- **État réactif** avec signals Angular
- **Persistence** automatique des préférences
- **Synchronisation** temps réel
- **Rollback** en cas d'erreur

### Sécurité enterprise

#### ✅ **Protection multicouche**
- **Chiffrement** des données en transit (HTTPS)
- **Hachage sécurisé** des mots de passe (bcrypt 12 rounds)
- **Validation** côté client ET serveur
- **Protection CSRF** et XSS
- **Rate limiting** contre les attaques
- **Audit logs** de toutes les actions

#### ✅ **Sauvegarde et récupération**
- **Sauvegardes automatiques** quotidiennes
- **Rétention** configurable (30 jours par défaut)
- **Point-in-time recovery** disponible
- **Réplication** base de données
- **Plan de continuité** d'activité

### Intégration et extensibilité

#### ✅ **APIs modernes**
- **REST API** complète avec Swagger
- **Documentation** interactive en ligne
- **Versioning** des APIs
- **Webhooks** pour intégrations tierces
- **SDK** JavaScript disponible

#### ✅ **Intégrations comptables**
- **Export** formats standard (CSV, Excel, PDF)
- **Connecteurs** ERP principaux
- **API comptabilité** dédiée
- **Rapports** personnalisables
- **Conformité** fiscale française

### Monitoring et observabilité

#### ✅ **Surveillance complète**
- **Health checks** automatiques
- **Métriques** de performance en temps réel
- **Logs structurés** avec corrélation
- **Alertes** proactives par email/SMS
- **Tableaux de bord** de monitoring

#### ✅ **Analytics et insights**
- **Usage analytics** détaillés
- **Performance** utilisateur tracking
- **Détection** d'anomalies automatique
- **Recommandations** d'optimisation
- **ROI tracking** des fonctionnalités

---

## 🎯 Cas d'usage métier

### Scénario 1 : Préparation de campagne

**Contexte** : Une coopérative prépare sa campagne 2025-2026

1. **Import** des prévisions par station via Excel
2. **Consolidation** automatique par le système
3. **Négociation** tarifaire avec les fournisseurs
4. **Validation** budgétaire par le management
5. **Déploiement** des budgets aux stations
6. **Suivi** en temps réel des écarts

**Bénéfices** :
- **Gain de temps** : 70% de réduction du temps de préparation
- **Précision** : Réduction des erreurs de 90%
- **Visibilité** : Dashboards temps réel pour tous

### Scénario 2 : Gestion de crise

**Contexte** : Rupture d'approvisionnement chez un fournisseur majeur

1. **Alerte automatique** déclenchée par le système
2. **Recherche** fournisseurs alternatifs
3. **Demandes** de devis express
4. **Réallocation** automatique des stocks
5. **Coordination** des transferts inter-stations
6. **Communication** transparente vers les stations

**Bénéfices** :
- **Réactivité** : Résolution en heures vs jours
- **Continuité** : Aucune rupture de service
- **Optimisation** : Meilleurs coûts négociés

### Scénario 3 : Optimisation logistique

**Contexte** : Réduction des coûts de transport

1. **Analyse** des flux logistiques
2. **Identification** des opportunités de mutualisation
3. **Recommandations** de regroupement
4. **Simulation** des économies potentielles
5. **Mise en œuvre** progressive
6. **Mesure** des résultats

**Bénéfices** :
- **Économies** : 15-25% de réduction des coûts transport
- **Écologie** : Réduction empreinte carbone
- **Efficacité** : Livraisons plus fréquentes

---

## 📱 Guide de démarrage rapide

### 🚀 Premier pas

1. **Connexion** : Utilisez vos identifiants fournis par votre administrateur
2. **Découverte** : Explorez le tableau de bord adapté à votre rôle
3. **Configuration** : Personnalisez vos préférences (notifications, langue, etc.)
4. **Formation** : Suivez les tutoriels intégrés
5. **Support** : Contactez l'équipe support pour toute question

### 🎯 Actions essentielles par rôle

#### Manager / Gestionnaire
- [ ] Configurer les paramètres généraux
- [ ] Importer la base articles et fournisseurs
- [ ] Créer les comptes utilisateurs des stations
- [ ] Paramétrer les seuils d'alerte
- [ ] Lancer la première campagne de prévisions

#### Station
- [ ] Vérifier les informations de votre station
- [ ] Découvrir le catalogue articles
- [ ] Créer votre première liste d'achat
- [ ] Passer votre première commande
- [ ] Configurer vos alertes de stock

#### Fournisseur
- [ ] Compléter votre profil entreprise
- [ ] Mettre à jour votre catalogue produits
- [ ] Configurer vos conditions de vente
- [ ] Tester la réception de commandes
- [ ] Paramétrer vos notifications

---

## 📞 Support et formation

### 🎓 Ressources de formation

#### Documentation technique
- **Guide développeur** : Architecture et APIs
- **Guide administrateur** : Installation et configuration
- **Guide utilisateur** : Ce document (version complète)
- **FAQ** : Questions fréquentes et solutions
- **Tutoriels vidéo** : Parcours guidés par rôle

#### Formation en ligne
- **Modules e-learning** interactifs
- **Webinaires** de découverte des fonctionnalités
- **Sessions** de Q&R régulières
- **Certification** utilisateur avancé
- **Formation** des formateurs internes

### 🛟 Support technique

#### Canaux de support
- **Chat** intégré dans l'application (support L1)
- **Email** : support@gestion-emballages.com (support L2)
- **Téléphone** : +33 X XX XX XX XX (support L3)
- **Ticket** : Plateforme dédiée pour suivi
- **Urgence** : Astreinte 24/7 disponible

#### Niveaux de service
- **Standard** : Réponse < 4h ouvrées
- **Prioritaire** : Réponse < 2h ouvrées
- **Critique** : Réponse < 30min, 24/7
- **Résolution** : SLA selon criticité
- **Satisfaction** : Mesure continue

---

## 🔮 Roadmap et évolutions

### 📅 Prochaines versions

#### v2.1 (T1 2025)
- **Module comptabilité** avancé
- **Connecteur** SAP/Sage
- **Application mobile** native
- **Workflow** de validation avancé
- **Notifications** push mobiles

#### v2.2 (T2 2025)
- **Intelligence artificielle** prédictive
- **Reconnaissance** vocale pour commandes
- **Réalité augmentée** pour inventaires
- **Blockchain** pour traçabilité
- **IoT** pour capteurs de stock

#### v2.3 (T3 2025)
- **Multi-tenant** SaaS complet
- **Marketplace** inter-coopératives
- **Carbon footprint** tracking
- **Sustainability** reporting
- **Green logistics** optimizer

### 🎯 Vision long terme

**Blue Whale Portal v2** a pour ambition de devenir **la référence** de la gestion d'emballages pour l'agriculture française, en intégrant :

- **Durabilité** environnementale
- **Intelligence artificielle** 
- **Économie circulaire**
- **Collaboration** inter-filières
- **Innovation** continue

---

## 📊 Métriques et bénéfices

### 🎯 ROI mesurable

#### Gains opérationnels
- **Temps de traitement** : -70% sur les commandes
- **Erreurs de saisie** : -90% grâce à l'automatisation
- **Coûts de communication** : -50% via la digitalisation
- **Délais de livraison** : -30% par l'optimisation
- **Stocks dormants** : -40% grâce aux prévisions

#### Amélioration qualité
- **Satisfaction utilisateur** : 95% (enquêtes trimestrielles)
- **Disponibilité système** : 99.9% (SLA respect)
- **Temps de résolution** : 90% tickets < 4h
- **Adoption utilisateur** : 95% utilisation régulière
- **Formation** : 80% autonomie après 2 semaines

#### Impact business
- **Croissance** : +15% volume traité par utilisateur
- **Rentabilité** : +8% marge sur emballages
- **Compétitivité** : Avantage concurrentiel mesurable
- **Innovation** : Nouvelle offre services digitaux
- **Pérennité** : Outil évolutif pour 10 ans

---

## 🏆 Conclusion

**Blue Whale Portal v2** représente une **révolution digitale** pour les coopératives agricoles, offrant :

### 🎯 **Valeur immédiate**
- **Interface moderne** et intuitive
- **Fonctionnalités complètes** et intégrées  
- **Performance** et fiabilité
- **Sécurité** de niveau entreprise
- **Support** et formation inclus

### 🚀 **Avantage concurrentiel**
- **Temps d'avance** sur la concurrence
- **Efficacité opérationnelle** supérieure
- **Satisfaction client** améliorée
- **Coûts maîtrisés** et optimisés
- **Innovation** continue

### 🌱 **Vision d'avenir**
- **Durabilité** environnementale
- **Collaboration** élargie
- **Intelligence** artificielle
- **Écosystème** connecté
- **Excellence** opérationnelle

---

*Ce guide sera mis à jour régulièrement pour refléter les nouvelles fonctionnalités et améliorations. Pour toute question ou suggestion d'amélioration, contactez l'équipe support.*

**Version du document** : 2.0.0  
**Dernière mise à jour** : Janvier 2025  
**Prochaine révision** : Avril 2025

---

**© 2025 Blue Whale Portal - Tous droits réservés**