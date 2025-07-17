# Guide de Test - Fonctionnalités Utilisateurs

## Nouvelles Fonctionnalités Ajoutées

### 1. Recherche par Nom Complet
- **Champ de recherche** : Barre de recherche avec icône de loupe
- **Fonctionnalité** : Filtre en temps réel sur le nom complet des utilisateurs
- **Placeholder** : "Rechercher par nom complet..."

### 2. Filtrage par Rôle
- **Bouton Filtres** : Bouton avec icône entonnoir pour afficher/masquer les filtres
- **Sélecteur de rôle** : Dropdown avec tous les rôles disponibles
- **Options** : "Tous les rôles", "Manager", "Gestionnaire", "Station", "Fournisseur"

### 3. Affichage Utilisateurs Inactifs
- **Comportement modifié** : Le toggle "Utilisateurs inactifs seulement" affiche UNIQUEMENT les utilisateurs inactifs
- **Libellé clair** : "Utilisateurs inactifs seulement" au lieu de "Afficher les utilisateurs inactifs"

### 4. Compteur de Résultats
- **Affichage** : Nombre d'utilisateurs filtrés sur le total
- **Position** : À droite des contrôles
- **Format** : "X utilisateurs sur Y" quand des filtres sont actifs

## Comment Tester

### Prérequis
1. Serveur backend démarré avec les données de test (50 fournisseurs + autres utilisateurs)
2. Serveur frontend démarré (port 3005)
3. Navigateur ouvert sur `http://localhost:3005`

### Étapes de Test

#### 1. Accès à la Page Utilisateurs
- Aller sur `/users` ou cliquer sur "Utilisateurs" dans la navigation
- Vérifier que la page affiche tous les utilisateurs actifs par défaut

#### 2. Test de la Recherche
- Taper dans le champ de recherche : "Thomas"
- Vérifier que seuls les utilisateurs avec "Thomas" dans le nom sont affichés
- Taper "Fournisseur" → Devrait afficher les utilisateurs avec "Fournisseur" dans le nom
- Effacer le champ → Tous les utilisateurs actifs s'affichent

#### 3. Test du Filtrage par Rôle
- Cliquer sur le bouton "Filtres"
- Sélectionner "Fournisseur" dans le dropdown
- Vérifier que seuls les utilisateurs avec le rôle "Fournisseur" sont affichés
- Sélectionner "Manager" → Vérifier le filtrage
- Sélectionner "Tous les rôles" → Tous les utilisateurs s'affichent

#### 4. Test Utilisateurs Inactifs
- Cocher "Utilisateurs inactifs seulement"
- Vérifier que SEULS les utilisateurs inactifs sont affichés
- Décocher → Retour aux utilisateurs actifs

#### 5. Test Combiné
- Rechercher "Nicole" + Filtrer par "Gestionnaire"
- Vérifier que les filtres se combinent correctement
- Utiliser le bouton "Réinitialiser les filtres"
- Vérifier que tous les filtres sont remis à zéro

#### 6. Test Mobile
- Réduire la fenêtre ou utiliser les outils de développement en mode mobile
- Vérifier que les contrôles s'adaptent (texte plus court)
- Tester toutes les fonctionnalités en mode mobile

### Données de Test Disponibles

Avec les données générées, vous devriez avoir :
- **54 utilisateurs** au total
- **2 Managers** : Thomas Decoudun, Nicole Lang
- **2 Gestionnaires** : Nicole Lang
- **2 Stations** : Germain Vidil, Lucas Grard
- **50 Fournisseurs** : Un par fournisseur généré

### Résultats Attendus

#### Recherche
- ✅ Filtre en temps réel
- ✅ Insensible à la casse
- ✅ Fonctionne avec nom et prénom
- ✅ Affichage du nombre de résultats

#### Filtrage par Rôle
- ✅ Dropdown dynamique basé sur les rôles réels
- ✅ Option "Tous les rôles" pour reset
- ✅ Filtre exact sur le rôle

#### Utilisateurs Inactifs
- ✅ Toggle clair : "seulement" au lieu de "afficher"
- ✅ Affiche UNIQUEMENT les inactifs quand coché
- ✅ Affiche UNIQUEMENT les actifs quand décoché

#### Combinaison des Filtres
- ✅ Recherche + Rôle + Statut peuvent être combinés
- ✅ Bouton "Réinitialiser" remet tout à zéro
- ✅ Compteur de résultats mis à jour en temps réel

### Bugs Potentiels à Vérifier

1. **Performance** : Avec 50+ utilisateurs, le filtrage reste fluide
2. **Réactivité** : Les filtres se mettent à jour instantanément
3. **États vides** : Comportement correct quand aucun résultat
4. **Persistence** : Les filtres ne persistent pas entre les navigations (comportement voulu)

## Interface Utilisateur

### Disposition
```
[Filtres] [Champ de recherche.....................] [☑ Inactifs seulement] [X utilisateurs]
                                                                                           
[Filtres étendus si activés]
[Rôle: [Dropdown]                                                    [Réinitialiser]]
```

### Responsive
- **Desktop** : Tous les éléments sur une ligne
- **Mobile** : Disposition adaptée avec texte plus court
- **Filtres** : Panel qui s'étend correctement

La fonctionnalité suit exactement le même pattern que les articles pour une expérience utilisateur cohérente !