# Seeder - Données de Test

Ce dossier contient les scripts et données nécessaires pour populer la base de données avec des données de test.

## Scripts Disponibles

### Génération des Données

```bash
# Générer 50 fournisseurs aléatoires
npm run data:generate-suppliers

# Générer 2000 articles aléatoires
npm run data:generate-articles

# Générer tous les données (fournisseurs + articles)
npm run data:generate-all
```

### Génération des Fournisseurs

Le script `generateSuppliers.js` génère 50 fournisseurs réalistes avec:
- **Noms d'entreprises** réels du secteur emballage
- **Adresses françaises** dans différentes villes
- **Contacts** avec noms, emails et téléphones
- **1 à 3 sites** par fournisseur
- **Spécialisations** variées (alimentaire, industriel, cosmétique, etc.)
- **Documents** de certification (ISO, FSC, BRC, etc.)
- **SIRET** générés automatiquement

### Génération des Articles

Le script `generateArticles.js` génère 2000 articles avec:
- **10 catégories** différentes (Barquette, Cagette, Plateau, Film Plastique, etc.)
- **Codes articles** uniques (ex: BAR0001, CAG0002, etc.)
- **Désignations** variées avec matériaux, dimensions, couleurs
- **1 à 3 fournisseurs** par article répartis sur les 50 fournisseurs
- **Prix réalistes** selon la catégorie
- **95% d'articles actifs** (comme dans la vraie vie)
- **Distribution équilibrée** entre tous les fournisseurs

### Import/Export des Données

```bash
# Importer toutes les données (utilisateurs, stations, fournisseurs, articles)
npm run data:import

# Supprimer toutes les données
npm run data:destroy
```

## Structure des Données Générées

### Articles (2000 articles)
- **Répartition équilibrée** : 200 articles par catégorie
- **Codes uniques** : Format CAT0001, CAT0002, etc.
- **Désignations réalistes** : "Barquette Plastique 20x15x7", "Film Transparent 50m", etc.
- **Prix variables** : Adaptés à chaque catégorie d'emballage
- **Liens fournisseurs** : 4500 liens au total (moyenne 2.25 fournisseurs/article)

### Fournisseurs (50 fournisseurs)
- **Entreprises réelles** : Smurfit Westrock, Raja, Antalis, Mondi, etc.
- **Spécialisations variées** : Alimentaire, industriel, cosmétique, pharmaceutique, etc.
- **Distribution géographique** : Répartis dans toute la France
- **Sites multiples** : Chaque fournisseur a 1 à 3 sites
- **Certifications** : Documents ISO, FSC, BRC selon la spécialisation

### Utilisateurs (54)
- **2 Managers** : Thomas Decoudun, Nicole Lang
- **2 Stations** : Germain Vidil (Stanor), Lucas Grard (3 Domaines)
- **50 Fournisseurs** : Un utilisateur par fournisseur avec entiteId correctement liée

## Statistiques Générées

```
Total d'articles: 2000
Articles actifs: 1914 (95.7%)
Articles inactifs: 86 (4.3%)
Total de liens fournisseurs: 4500
Moyenne fournisseurs par article: 2.25
Total de fournisseurs: 50
Fournisseurs actifs: 47 (94%)
Utilisateurs: 54 (dont 50 fournisseurs)
Sites: 102 (tous actifs)

Répartition par catégorie:
- Barquette: 200 articles
- Cagette: 200 articles
- Plateau: 200 articles
- Film Plastique: 200 articles
- Carton: 200 articles
- Sac Plastique: 200 articles
- Sac Papier: 200 articles
- Emballage Isotherme: 200 articles
- Etiquette: 200 articles
- Autre: 200 articles
```

## Utilisation

1. **Première fois** :
   ```bash
   npm run data:generate-all      # Génère 50 fournisseurs + 2000 articles
   npm run data:import            # Importe tout en base
   ```

2. **Régénérer toutes les données** :
   ```bash
   npm run data:generate-all      # Nouveaux fournisseurs + articles
   npm run data:destroy           # Vide la base
   npm run data:import            # Réimporte avec nouvelles données
   ```

3. **Régénérer seulement les articles** :
   ```bash
   npm run data:generate-articles  # Nouveaux articles avec mêmes fournisseurs
   npm run data:destroy           # Vide la base
   npm run data:import            # Réimporte
   ```

4. **Reset complet** :
   ```bash
   npm run data:destroy           # Vide tout
   npm run data:import            # Réimporte les données existantes
   ```

## Configuration

Le générateur d'articles utilise des données pseudo-aléatoires basées sur l'index pour garantir la reproductibilité. Vous pouvez modifier les paramètres dans `generateArticles.js` :

- **Nombre d'articles** : Modifier le paramètre `generateArticles(2000)`
- **Catégories** : Ajouter/modifier le tableau `categories`
- **Matériaux** : Modifier le tableau `materials`
- **Prix** : Ajuster les plages dans `basePrices`
- **Fournisseurs** : Modifier le nombre max dans `numSuppliers`

## Fonctionnalités Avancées

### Désactivation en Cascade
Le système implémente une désactivation en cascade automatique :
- **Fournisseur désactivé** → Tous ses sites sont désactivés
- **Fournisseur désactivé** → L'utilisateur associé est désactivé
- **Fonctionnement** : Via hooks Mongoose (pre-save, post-save, pre-findOneAndUpdate)

### Scripts de Test
```bash
# Tester la désactivation en cascade
npm run data:test-cascade

# Vérifier les liens utilisateur-fournisseur
npm run data:check-links
```

### Liaison Utilisateur-Fournisseur
- **Un utilisateur par fournisseur** avec entiteId correctement liée
- **Génération automatique** des comptes utilisateur depuis les contacts
- **Désactivation synchronisée** avec le fournisseur parent

## Performances

- **Génération** : ~2 secondes pour 2000 articles
- **Import** : ~10 secondes en batch de 100 articles
- **Optimisé** : Traitement par lots pour éviter les timeouts MongoDB