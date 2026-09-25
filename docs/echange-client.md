# Synthèse de l’échange client

Source : entretien vidéo avec le gérant de station-service (Côte d’Ivoire, enlèvement GESTOCI).

## Problème

Les volumes **empotés** (GESTOCI / camion) ne concordent pas avec les volumes **dépotés** (cuves de station). Exemple cité : jamais plus de **43 000 L** alors que le chargement annoncé est souvent **45 000 L**. Les écarts sont récurrents ; le gérant n’a **aucune visibilité** sur ce qui se passe entre le dépôt et la station.

## Processus actuel (100 % manuel)

1. Chargement GESTOCI : bon de chargement (plein théorique par compartiment).
2. Mesure camion avec le **T** (règle / jauge camion).
3. Transport vers la station.
4. Déversement dans les cuves.
5. Mesure cuve avec une **règle de jauge millimétrée** + **barémage** (ex. 10 mm → 200 L sur une cuve de 20 000 L).
6. Tout est **noté dans un cahier**. L’agent station suit le déversement et remonte un rapport. Le gérant ne contrôle pas chaque écriture.

Résultat : écarts à chaque étape (T, jauge cuve, conversions). Impossible de dire si c’est une erreur de mesure, une **freinte**, un **siphonnage**, ou un **chargement incomplet** à la GESTOCI.

## Attente principale

Chaîne de contrôle continue :

> Enlèvement GESTOCI → trajet → dépotage cuves → **rapprochement** empoté vs dépoté.

Si la quantité se conserve, il n’y a pas eu de fraude. Si elle varie **hors station**, c’est suspect.

## Ce qui existe aujourd’hui côté SI / IoT

Rien. Pas de sondes, pas de remontée de données. Uniquement jauges manuelles.

## Contraintes métier exprimées

| Sujet | Détail |
| --- | --- |
| Unités | Millimètres (règle) convertis en litres via barème. GESTOCI : volume nominal exact (ex. 45 000 L). |
| Citernes | 1 compartiment (monobloc) jusqu’à **12** aujourd’hui ; **7** et **12** sont les cas fréquents. Évolution possible vers 20 / 30 / 50. |
| Camions | **2** camions en rotation. |
| Fréquence | **2 à 3** ravitaillements / semaine (environ 1 tous les 2 jours). |
| Stations | **Plusieurs** stations. Chaque gérant voit **sa** station ; le propriétaire voit **toutes**. |
| Jauges station | Midi, minuit, ouverture (~5h–6h). Index pompes en début / fin de journée. |
| Documents | Bon de chargement GESTOCI, bon de livraison, etc. à lier à l’opération. |

## Rôles évoqués

- **Pompiste** : relève d’index de pompe (périmètre limité).
- **Agent superviseur** : commandes carburant, jauge des cuves, saisie des niveaux.
- **Gérant / propriétaire** : vue globale, santé de l’activité.
- **Adjoint** : mêmes accès que le gérant si délégué.
- **Chauffeur** : lié à chaque voyage (camion + personne).
- Identification avant empotage / dépotage / relevé : **souhaité** (plus, pas un prérequis initial).

## Fonctionnalités explicitement demandées

- Suivi de quantité **depuis l’enlèvement** jusqu’à la station.
- **Rapprochement** GESTOCI vs cuves.
- Visualisation **temps réel** des compartiments (camion) et des cuves (station).
- **Notifications** de suspicion / variation de volume **en cours de trajet** (hors station).
- Idéalement **localisation** de l’incident.
- Automatisation des jauges et de la vue d’activité (remplacer cahier + index manuels).
- Pièces jointes (bons) sur chaque chargement.
- Traçabilité chauffeur + camion.
- Sondes **précises** (responsabilité fournisseur : c’est « votre solution »).
