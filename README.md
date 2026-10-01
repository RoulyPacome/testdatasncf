# DataOps SNCF · Qualité des données

Prototype d’interface métier pour suivre la qualité des données d’un workspace Databricks.

## Ouvrir l’application

Aucun prérequis ni serveur n’est nécessaire. Ouvrez `index.html` dans un navigateur, ou exécutez depuis le terminal du projet :

```bash
"$BROWSER" "$PWD/index.html"
```

## Fonctionnalités

- Vue d’ensemble des scores, contrôles, anomalies et exécutions.
- Recherche et filtrage des jeux de données surveillés.
- Consultation des détails d’une table et lancement simulé de ses contrôles.
- Formulaire de création d’une règle de qualité.
- Mise en page adaptée aux écrans mobiles.

## Limites du prototype

L’interface utilise des données d’exemple. Les actions, indicateurs de connexion et résultats affichés sont simulés : aucune connexion à Databricks ou à Unity Catalog n’est configurée.
