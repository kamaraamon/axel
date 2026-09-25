# Stack technique — à valider avant le proto

Décision proposée pour le **prototype mockup cliquable** (démo client) et la **cible production**. Rien n’est codé tant que cette page n’est pas validée.

Objectif du proto : faire **vivre** le parcours propriétaire / gérant (cuves, citerne, trajet, rapprochement, alerte) avec des **données fictives**. Pas de sondes, pas de GESTOCI, pas de vrai GPS.

---

## Recommandation (une phrase)

**Next.js + TypeScript + Tailwind + shadcn/ui + ApexCharts**, fixtures JSON, carte Leaflet, **sans backend ni base** pour le mockup. Même stack web en production ; API **NestJS + PostgreSQL** et appli terrain **Flutter** plus tard.

---

## Pourquoi web d’abord (pas Flutter, pas Figma seul)

Le client valide d’abord **l’œil du propriétaire** : dashboard, citerne qui bouge, carte d’alerte, 3 barres de rapprochement. Ça se construit plus vite et plus proprement en web qu’en Flutter web.

Figma ne suffit pas : tu travailles dans le code, et un proto **cliquable + rôles** (proprio / superviseur / chauffeur) se vend mieux en réunion.

Le chauffeur / pompiste (photo, GPS, hors-ligne) n’est **pas** le premier écran de démo. On le simule par un **mode chauffeur** dans le même site (layout mobile). Flutter arrive quand le parcours web est figé.

---

## Couche 1 — Prototype mockup (à construire maintenant)

| Choix | Outil | Pourquoi |
| --- | --- | --- |
| App | **Next.js 15** (App Router) | Un repo, pages dashboard + voyage + démo mobile, déploiement simple. |
| Langage | **TypeScript** | Le modèle métier (compartiments N, mesures, rôles) casse vite sans types. |
| UI | **Tailwind CSS** + **shadcn/ui** | Écrans admin (tables, dialogs, tabs) sans designer dédié. |
| Graphiques dashboard | **ApexCharts** (`apexcharts` + `react-apexcharts`) | Look « ops / finance » (aires, barres, jauges, sparkline) sans Chart.js à styler à la main. |
| Icônes | **lucide-react** | Standard shadcn. |
| État | **Zustand** + fixtures | Switch de rôle et « replay » d’un voyage sans Redux. |
| Données | **JSON** dans `src/mocks/` | Stations, cuves, camion 7/12 compartiments, un voyage 45 000 → 43 000 L, alertes. |
| Carte | **Leaflet** + OpenStreetMap | Point de suspicion GPS **sans clé** Mapbox pour le proto. |
| Citerne / cuves | **SVG** + CSS / Framer Motion | Coupe 2D, niveaux animés — pas de Three.js. |
| Auth proto | **Sélecteur de rôle** (pas de login réel) | 4 clics : Proprio / Gérant / Superviseur / Chauffeur. |
| Temps réel proto | **Timer + jeu de mesures** | Simule la baisse en route ; assez pour la démo. |
| Hébergement proto | **Vercel** (ou preview GitHub) | Lien à envoyer au client. |

**Hors proto (volontairement) :** PostgreSQL, MQTT, Nest, capteurs, WhatsApp, vraie auth, PWA hors-ligne camion.

Arborescence cible du proto :

```text
apps/web/          # Next.js
  src/app/         # routes
  src/mocks/       # fixtures métier
  src/components/  # citerne, cuves, carte, rapprochement, charts
```

Monorepo léger (`apps/web` seulement pour l’instant). `apps/api` et `apps/mobile` quand la stack cible est lancée.

### ApexCharts — dashboard proprio

Librairie : [ApexCharts](https://apexcharts.com/) via `react-apexcharts`. Licence MIT.

**Contrainte Next.js :** le canvas utilise `window`. Tous les charts sont des Client Components chargés avec `next/dynamic` et `{ ssr: false }` (un wrapper `ApexChart` unique, pas un import dans chaque page serveur).

Thème : palette sombre ou claire alignée Tailwind (CSS variables), tooltips FR, unités **L** et **mm**.

Graphiques du proto (fixtures) :

| Widget | Type Apex | Données mock |
| --- | --- | --- |
| Stock cuves 24 h / 7 j | `area` | Niveaux L dans le temps |
| Rapprochement voyage | `bar` groupé | Déclaré GESTOCI / sonde / cuve |
| Manquants par voyage | `bar` horizontal | Écart en L (ex. −2 000 L) |
| Index pompes (journée) | `line` | Ouverture vs clôture |
| Santé flotte | `radialBar` / `sparkline` | Remplissage camion, alertes ouvertes |
| Mix stations (proprio) | `donut` | Volume reçu / vendu par site |

La **citerne 2D** reste en SVG (pas un chart) : Apex sert le **pilotage**, pas la coupe du camion.

---

## Couche 2 — Cible production (direction, pas le proto)

À valider comme **cap**, pas à installer maintenant.

```text
Capteurs (niveau, temp, GPS)
    → boîtier 4G / MQTT (buffer offline)
        → API NestJS
            → PostgreSQL
            → règles d’alerte (geofence + ΔV)
                → WebSocket vers Next.js
                → (plus tard) push / SMS

Flutter  : chauffeur + pompiste (photo bon, GPS, sync)
Next.js  : gérant + propriétaire (même UI que le proto, **ApexCharts** conservé)
```

| Couche | Choix | Pourquoi | Alternative écartée |
| --- | --- | --- | --- |
| API | **NestJS + TypeScript** | Même langage que le front, modules (trips, tanks, alerts), WebSocket natif. | FastAPI : très bien si l’équipe est Python-first. Laravel : OK CI, moins naturel pour le temps réel capteurs. |
| ORM | **Prisma** | Schéma lisible, migrations, types partagés. | TypeORM : plus verbeux. |
| Base | **PostgreSQL** | JSON des barèmes, geospatial plus tard (`PostGIS` si besoin). | Firebase : lock-in, trop faible pour le rapprochement métier. |
| Auth | **Better Auth** ou **Auth.js** | Sessions, rôles, multi-stations. | Keycloak : trop lourd au début. |
| Temps réel cloud | **WebSocket** (Nest gateway) | Dashboard live. | Pas Kafka : 2 camions, 3 voyages / semaine. |
| IoT | **MQTT** (Mosquitto / EMQX) | Standard capteurs, QoS, buffer. | HTTP polling depuis le camion : fragile réseau. |
| Mobile terrain | **Flutter** | Android (chauffeurs), caméra, GPS, mode dégradé. | React Native : possible si l’équipe est 100 % JS ; Flutter gagne souvent hors-ligne + perf. |
| Cartes prod | **Mapbox** ou **Google Maps** | Geofences, replay trajet. | OSM/Leaflet reste OK si budget carte = 0. |
| Fichiers | **S3 compatible** (bons PDF/photos) | Bons GESTOCI. | Disque local : non. |
| Hosting API | **Fly.io / Railway / VPS Abidjan** | Latence + 4G CI. | À trancher selon ops. |

Matériel (hors software, à valider avec un installateur ATEX) : sondes de niveau homologuées zone explosive, GPS véhicule, passerelle 4G. **Pas dans le repo proto.**

---

## Ce qu’on ne choisit pas (et pourquoi)

| Écarté pour le proto | Raison |
| --- | --- |
| Flutter web comme dashboard | Tables, docs, multi-pages admin plus lents à peaufiner. |
| Recharts / Chart.js comme lib principale | Demandé **ApexCharts** pour un dashboard plus « pro » (jauges, sparklines, animations). Recharts reste possible en secours si un composant shadcn l’impose. |
| Three.js / citerne 3D | Le client a demandé le mouvement ; le 2D lisible en plein soleil gagne. |
| Supabase « pour aller vite » | Auth + Postgres trop tôt ; le mockup n’a pas besoin d’auth. |
| Microservices / Kafka | 2 camions. |
| Native iOS | Parc chauffeur = Android en pratique ; Flutter couvrira iOS plus tard si besoin. |

---

## Checklist de validation

Coche ou amende **avant** `create-next-app` :

- [ ] **Proto = Next.js 15 + TS + Tailwind + shadcn + ApexCharts** (pas Flutter, pas Figma seul)
- [ ] **Charts = ApexCharts** (`react-apexcharts`, import client `ssr: false`)
- [ ] **Pas de backend** sur le mockup (fixtures JSON + Zustand)
- [ ] **Carte = Leaflet / OSM** pour le proto
- [ ] **Citerne = SVG 2D animé**, pas de 3D
- [ ] **Démo rôles** par sélecteur, pas de vrai login
- [ ] **Cible API = NestJS + Prisma + PostgreSQL**
- [ ] **Cible mobile terrain = Flutter**
- [ ] **Cible IoT = MQTT**, hors proto
- [ ] **Monorepo** `apps/web` maintenant, `apps/api` / `apps/mobile` plus tard

Si un item est non : le remplacer ici, puis seulement scaffolder.

---

## Ordre une fois la stack validée

1. Scaffolder `apps/web` (Next.js) + shadcn + `apexcharts` / `react-apexcharts`.
2. Fixtures : 1 organisation, 2 stations, 2 camions, 1 voyage avec manquant + séries temporelles pour les charts.
3. Écrans : dashboard proprio (KPI + ApexCharts) → détail voyage (citerne + carte + barres rapprochement) → mode chauffeur (mobile).
4. Replay : bouton « simuler siphonnage » pour la réunion client.
