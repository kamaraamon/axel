# Brainstorming — Contrôle de l’intégrité carburant (station + flotte)

Document de travail produit à partir de l’entretien client. Ce n’est pas un cahier des charges figé : c’est un cadre pour prioriser, prototyper, et challenger les hypothèses.

## 1. Phrase de vision

> Donner au propriétaire d’une (ou plusieurs) station(s) **un œil continu** sur le carburant : du bras de chargement GESTOCI jusqu’à la cuve, avec un **rapprochement chiffré**, des **alertes de variation en route**, et une **vue d’exploitation** (stocks, pompes, documents, équipes) à la place du cahier.

Nom de travail interne : **Axel** (repo). À valider avec le client (ex. « jauge connectée », « tour de contrôle carburant »).

## 2. Insights issus de l’échange

1. **Le client n’achète pas « une app »**, il achète la **fin des manquants inexpliqués**. La confiance va au **système de mesure**, pas au chauffeur / agent / GESTOCI.
2. Il **fait confiance a priori** à la solution : si la quantité change, c’est qu’il y a eu fraude ou incident. Il faudra **éduquer** sur les écarts physiques (température, mousse, pente, barème, tolérance légale) pour ne pas crier au vol à chaque litre.
3. **Trois boucles de fraude / erreur** distinctes :
   - chargement incomplet ou mal déclaré à la GESTOCI ;
   - siphonnage / vidange / fuite **en trajet** ;
   - écart au **dépotage** (cuve, règle, agent).
4. Le gérant **n’est pas sur site** pour les relevés. Toute saisie humaine sans identité = le même problème que le cahier.
5. Architecture existante : **zéro**. On livre **matériel + logiciel + process**, pas un plugin.
6. Volume opérationnel **faible** (2 camions, 2–3 voyages / semaine) : on peut viser un **MVP très soigné** plutôt qu’un big data. La valeur est la **preuve**, pas le débit.
7. Il parle déjà **multi-stations** : concevoir **tenant + sites** dès le départ, même si on équipe une station d’abord.

## 3. Hypothèses à valider (atelier suivant)

- Produits concernés : super, gasoil, pétrole lampant, lubrifiants ? Mélanges interdits entre compartiments ?
- Compensation **température 15 °C** (volume fiscal) vs volume observé ?
- Qui paie / assume la **freinte** contractuelle GESTOCI / transporteur ?
- Les citernes sont-elles **propriété** du client ou d’un affréteur ?
- Couverture réseau (2G/4G) sur les axes GESTOCI → stations ? Zones blanches ?
- Alimentation électrique des sondes camion (batterie véhicule, solaire) ?
- Homologation / métrologie légale (DMC, barèmes certifiés) exigée ou « indicative » suffit pour le MVP ?
- Combien de cuves et de pistolets par station ? Marques de pompes (possibilité de lire l’index automatiquement) ?

## 4. Utilisateurs et jobs-to-be-done

| Persona | Job | Succès |
| --- | --- | --- |
| Propriétaire | Voir toutes les stations, juger la santé, recevoir les alertes | « Je sais si on m’a volé, et où » |
| Gérant de station | Stock, réception, clôture de journée | Jauges et index fiables sans cahier |
| Superviseur | Commander, jauger, rattacher le voyage | Rapprochement GESTOCI / cuve en 1 écran |
| Pompiste | Relever (ou confirmer) les index | Saisie en 30 s, horodatée, nominative |
| Chauffeur | Empoter, rouler, dépoter | Parcours guidé, pas de paperasse parallèle |
| Adjoint | Même vue que le propriétaire (délégation) | Accès miroir, révocable |

**Non-utilisateur au MVP** : GESTOCI, douane, assureur — mais les **exports PDF** des voyages serviront plus tard d’argument.

## 5. Parcours cœur (à prototyper en premier)

```text
[Commande] Superviseur crée un besoin (produit, volume, station)
    → [Affectation] Camion + chauffeur + créneau
        → [GESTOCI] Photo / scan bon de chargement + volume sonde par compartiment
            → [Trajet] GPS + volumes ; alerte si ΔV hors tolérance hors geofence station
                → [Arrivée] Geofence station ; identification agent
                    → [Dépotage] Cuve cible par compartiment ; volumes avant / après
                        → [Rapprochement] GESTOCI vs T vs cuve vs documents
                            → [Clôture] Écart accepté / contesté + pièce jointe
```

La **simulation visuelle** demandée (citerne + cuves « qui bougent ») est le **fil rouge UX** de ce parcours, pas un gadget.

## 6. Idées de fonctionnalités (triées)

### 6.1 Must — MVP (preuve d’intégrité)

- Fiche **camion** : N compartiments dynamiques (1 → 12, extensible), capacité nominale, barème mm → L.
- Fiche **cuve station** : même principe, liée aux pompes.
- **Sondes de niveau** (camion + cuves) + horodatage + identifiant capteur.
- **GPS** véhicule + geofences (GESTOCI, stations, « hors site »).
- **Seuil d’alerte** : baisse de volume hors geofence de dépotage autorisé.
- **Notification** push / SMS / WhatsApp (à trancher) : suspicion + **position**.
- **Rapprochement** d’un voyage : volumes A / B / C + écart % et litres.
- Rôles : propriétaire, gérant, superviseur, pompiste, chauffeur.
- **Pièces** : bon de chargement, bon de livraison, photos scellés / plombs.
- Lien **voyage ↔ camion ↔ chauffeur**.
- Dashboard **par station** + **rollup** propriétaire.

### 6.2 Should — dès que le MVP « mesure » est crédible

- Identification avant opération (PIN, QR badge, NFC).
- Vue 3D / schéma **temps réel** compartiments et cuves (niveaux, produit, alarmes).
- Jauges automatiques aux heures métier (ouverture, midi, minuit) + rapport PDF.
- Index pompes : saisie assistée puis, plus tard, **lecture automate** si API / pulser.
- Historique des alertes (acquittement, commentaire, pièce).
- Tolérances **par produit** et **par saison** (température).
- Multi-stations, invitations, adjoint.

### 6.3 Could — différenciation

- Température + densité → volume à 15 °C (fin des faux positifs).
- Accéléromètre / ouverture trappe / capteur de vanne (vol « intelligent »).
- Caméra sur dôme / plomb connecté.
- Scoring chauffeur / voyage.
- Prévision de rupture de stock et suggestion de commande GESTOCI.
- Mode **dégradé** : saisie manuelle de secours si sonde HS, **flaguée** (pas mélangée aux données capteur).
- Export comptable / rapprochement caisse vs litres vendus.

### 6.4 Won’t (pour l’instant)

- Marketplace transporteurs.
- Intégration native GESTOCI (sauf si API publique un jour).
- 50 compartiments en UI complexe : le modèle de données le permet, l’UI reste simple (liste + schéma).

## 7. Détection de fraude — brainstorming « signaux »

Ne pas se fier à un seul capteur. Combiner :

| Signal | Interprétation |
| --- | --- |
| Δ volume camion alors que GPS ≠ station / GESTOCI | Vidange / siphonage / fuite |
| Δ volume **sans** mouvement GPS (arrêt prolongé) | Point de vol probable → carte |
| Volume GESTOCI saisi (bon) ≠ volume sonde au départ | Sous-chargement ou bon falsifié |
| Volume camion à l’arrivée ≠ baisse cuve | Mauvaise cuve, dérivation, erreur barème |
| Baisse cuve **sans** index pompe | Fuite cuve ou vente non enregistrée |
| Sonde muette / batterie / out-of-range | Sabotage ou panne → alarme technique, pas « vol » |
| Température en forte hausse + volume en hausse | Dilatation, pas un ajout |

**Règle produit** : toute alerte a un **type** (`fraude_suspectee` | `fuite` | `mesure` | `technique` | `hors_tolerance_legale`) et un **niveau de confiance**.

Le client a dit : « si votre sonde ne marche pas, vous me dites ». Donc **supervision matérielle** (heartbeat, batterie, calibration) est un livrable, pas un à-côté.

## 8. Architecture (proposition de discussion)

Trois couches, volontairement séparées : le logiciel ne doit pas mourir si on change de marque de sonde.

```text
[Capteurs]  niveau, temp., GPS, (plus tard : vanne, trappe)
     │  LoRa / 4G / BLE passerelle camion
[Edge]  boîtier véhicule + concentrateur station
     │  MQTT / HTTPS, buffer offline
[Cloud] ingestion, règles, stockage, auth
     │
[Apps]  mobile chauffeur / pompiste  |  web gérant / propriétaire
```

**Principes :**

- **Offline-first** sur le camion (zones blanches) : file d’événements, sync à la reconnexion, alerte locale sonore si vidange.
- **Barèmes** versionnés (un changement de table ne réécrit pas l’historique).
- **Compartiments en N**, pas 7 ou 12 en dur.
- **Multi-tenant** : organisation → stations → cuves / pompes ; flotte partagée ou par station.
- Un **voyage** est l’agrégat métier (documents, points de mesure, alertes, acteurs).

**Stack :** proposition détaillée et checklist de validation dans [`docs/stack.md`](stack.md) (Next.js pour le proto, NestJS + Flutter + MQTT en cible). Rien n’est scaffoldé tant que cette page n’est pas validée.

Le volume de données est petit ; investir dans la **fiabilité capteur** et le **modèle d’écarts**, pas dans Kafka « pour la scale ».

## 9. UX — « citerne vivante »

Le client a dit oui tout de suite à la simulation. Proposition :

- **Camion** : coupe latérale, 1 bande par compartiment, remplissage animé, pastille produit, alerte rouge si baisse hors contexte.
- **Station** : plan simplifié cuves + pompes, niveaux, tendance 24 h.
- **Voyage** : timeline (GESTOCI → route → station) avec curseur temps et replay.
- **Rapprochement** : 3 barres côte à côte (déclaré / sonde départ / cuve) + delta.

Éviter le réalisme 3D lourd au MVP : un **schéma 2D lisible au soleil** (tablette cour de station) vaut mieux.

## 10. Métrologie — le vrai risque projet

Si on affiche « 44 812 L » et que la règle dit « 43 000 L », le client croira **l’un des deux** et rejettera l’autre. Il faut :

1. Caler chaque cuve / compartiment avec **son** barème officiel.
2. Afficher **mm + litres** (comme lui pense).
3. Afficher une **bande de tolérance** (ex. ±0,5 % ou valeur légale locale).
4. Distinguer **volume observé** et **volume à 15 °C**.
5. Campagne de **double mesure** (sonde vs règle) pendant 2–4 semaines avant d’accuser quiconque.

Sans cette phase, le logiciel sera accusé d’être « encore un écart ».

## 11. Découpage de livraison suggéré

**Vague 0 — Spike terrain (1 station, 1 camion)**  
Sonde cuve + sonde 1 compartiment + GPS + dashboard brut. Objectif : corrélation mm / L / trajet.

**Vague 1 — Voyage complet**  
Bon de chargement, rapprochement, alertes hors geofence, rôles gérant / chauffeur.

**Vague 2 — Exploitation station**  
Jauges planifiées, index pompes, documents, identification.

**Vague 3 — Réseau**  
Multi-stations, adjoint, rapports consolidés, SLA capteurs.

**Vague 4 — Intelligence**  
Température 15 °C, scoring, prévision stock, automate pompes.

## 12. Modèle de données (esquisse)

- `Organization`, `User`, `Role`, `Station`
- `Tank` (cuve), `CalibrationTable` (mm → L)
- `Pump`, `PumpIndexReading`
- `Truck`, `Compartment`, `Probe`
- `Driver`
- `Trip` (voyage) : statut, documents, acteurs
- `Measurement` (source: probe | manual, mm, liters, temp, lat/lng)
- `Alert` (type, confiance, position, acquittement)
- `Reconciliation` (declared, loaded, delivered, sold)

## 13. Questions ouvertes pour le prochain échange client

1. Liste exacte des stations, cuves, produits, pompes.
2. Photos des règles, T, bons GESTOCI, cahier actuel (pour calquer les rapports).
3. Canal d’alerte préféré (appel, SMS, WhatsApp, app).
4. Qui intervient **sur le terrain** quand une alerte part à 2 h du matin ?
5. Budget / contrainte d’installation (soudure, ATEX zone explosive — **critique**).
6. Faut-il un mode « preuve juridique » (sceau numérique) ou seulement un outil interne ?

## 14. Risques

| Risque | Mitigation |
| --- | --- |
| Zone ATEX / explosion (capteurs non certifiés) | Matériel certifié zone 0/1, installateur habilité |
| Faux positifs (freinte, chaleur) | Tolérances + température |
| Sabotage sonde | Heartbeat, plomb visuel, alerte silence |
| Réseau | Buffer edge, SMS fallback |
| Rejet humain (agents) | Identification, UX simple, pas de double saisie cahier + app |
| Scope creep (50 compartiments, 3D, IA) | MVP = 1 voyage prouvé |

## 15. Proposition d’atelier interne (90 min)

1. 15 min — Relire le problème en 1 slide (manquants + zéro visibilité trajet).
2. 20 min — Sketch du parcours voyage (tableau blanc).
3. 20 min — Choisir **Vague 0** matériel (marque sonde, ATEX, GPS).
4. 20 min — Wireframe basique : dashboard propriétaire + écran chauffeur.
5. 15 min — Backlog MVP vs plus tard (cette doc, §6 et §11).

## 16. Critère de succès client (à lui faire valider)

> Sur 10 voyages consécutifs, le gérant peut expliquer **chaque écart > tolérance** (lieu, heure, litres, acteur) sans ouvrir le cahier.

C’est la métrique, pas « une app avec des graphes ».
