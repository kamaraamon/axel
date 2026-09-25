# Axel

Outil de **contrôle d’intégrité du carburant** : de l’enlèvement (GESTOCI) jusqu’aux cuves de station, avec rapprochement des volumes, alertes de variation en trajet, et remplacement progressif des jauges / index manuscrits.

Le projet part d’un entretien client (station-service, process 100 % manuel, écarts récurrents à la réception).

## Documents

- [Synthèse de l’échange](docs/echange-client.md)
- [Brainstorming produit / technique](docs/brainstorming.md)
- [Backlog MVP](docs/mvp-backlog.md)
- [Stack technique (à valider)](docs/stack.md)

## Statut

Prototype cliquable SUD CONTRACTORS en cours : dashboard professionnel, suivi de voyage, alertes, stations et mode chauffeur.

```bash
npm install
npm run dev
```

## Comptes de démonstration

Mot de passe commun : `ProFuel#Demo2026!`.

| Niveau | Identifiant | Périmètre |
| --- | --- | --- |
| Propriétaire | `proprietaire@sud.ci` | Toutes les stations, CRUD complet |
| Gérant | `gerant@sud.ci` | Sa station, voyages et alertes, sans suppression |
| Superviseur | `superviseur@sud.ci` | Opérations terrain, accès limité |
| Chauffeur | `chauffeur@sud.ci` | Mission affectée uniquement |

Le changement de niveau nécessite une déconnexion puis une connexion avec l’autre compte.
