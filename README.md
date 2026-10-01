# DataOps SNCF · Qualité des données

Prototype d’interface métier pour suivre la qualité des données d’un workspace Databricks.

## Ouvrir l’application

Aucun prérequis ni serveur n’est nécessaire. Ouvrez `index.html` dans un navigateur, ou exécutez depuis le terminal du projet :

```bash
"$BROWSER" "$PWD/index.html"
```

## Fonctionnalités

- Vue d’ensemble des scores, contrôles, anomalies et exécutions récentes.
- Navigation entre les jeux de données, les règles de qualité, les exécutions, les alertes et le catalogue Unity.
- Recherche et filtres par statut ou domaine dans les listes.
- Consultation des détails d’un jeu de données et lancement simulé de ses contrôles.
- Création, activation, désactivation et suppression de règles de qualité.
- Consultation des alertes et possibilité de les marquer comme résolues.
- Exploration des catalogues, schémas et tables présentés dans le prototype.
- Conservation locale des règles, exécutions et alertes modifiées via le stockage du navigateur (`localStorage`).
- Mise en page adaptée aux écrans mobiles.

## Limites du prototype

L’interface utilise des données d’exemple. Les exécutions, indicateurs de connexion et résultats affichés sont simulés : aucune connexion à Databricks ou à Unity Catalog n’est configurée. Les données conservées dans `localStorage` restent propres au navigateur utilisé et ne sont pas synchronisées avec un serveur.
