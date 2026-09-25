"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Database,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Play,
  Plus,
  RefreshCcw,
  Route,
  Save,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { ApexChart, baseChartOptions } from "@/components/apex-chart";
import { LoginScreen } from "@/components/login-screen";
import { TankVisual } from "@/components/tank-visual";
import { type AlertStatus, can, formatLiters, reconcile, STEP_LABELS, DRIVER_FLOW } from "@/lib/workflows";
import { FuelAlert, Station, Trip, useDemoStore, View } from "@/store/use-demo-store";

const RouteMap = dynamic(() => import("@/components/route-map"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Chargement de la carte…</div>,
});

const navItems: Array<{ view: View; label: string; icon: typeof LayoutDashboard }> = [
  { view: "dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
  { view: "trips", label: "Voyages", icon: Route },
  { view: "stations", label: "Stations & stocks", icon: Database },
  { view: "alerts", label: "Centre d’alertes", icon: ShieldAlert },
];

export function DashboardShell() {
  const store = useDemoStore();
  const [mobileNav, setMobileNav] = useState(false);
  const [newTrip, setNewTrip] = useState(false);

  useEffect(() => {
    if (!store.notification) return;
    const timer = window.setTimeout(store.clearNotification, 3500);
    return () => window.clearTimeout(timer);
  }, [store.notification, store.clearNotification]);

  if (!store.user) return <LoginScreen />;

  const allowedNav = navItems.filter((item) => can(store.role, item.view === "trip" ? "trips" : item.view, "read"));
  const canCreateTrip = can(store.role, "trips", "create");

  return (
    <div className="app-shell">
      <aside className={mobileNav ? "sidebar sidebar-open" : "sidebar"}>
        <Brand />
        <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Fermer le menu">
          <X size={20} />
        </button>
        <div className="product-pill"><Fuel size={16} /> Pro<span>Fuel Control</span></div>
        <nav>
          <p>Navigation</p>
          {allowedNav.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              className={store.view === view || (view === "trips" && store.view === "trip") ? "nav-active" : ""}
              onClick={() => {
                store.navigate(view);
                setMobileNav(false);
              }}
            >
              <Icon size={18} /> {label}
              {view === "alerts" && <b>1</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-status">
          <div><i /> Système opérationnel</div>
          <small>Dernière synchro · à l’instant</small>
        </div>
        <div className="sidebar-profile">
          <div className="avatar">AA</div>
          <div><strong>{store.user.name}</strong><span>{store.role}</span></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Ouvrir le menu"><Menu /></button>
          <div>
            <span className="eyebrow">Centre de contrôle carburant</span>
            <h1>{titleForView(store.view)}</h1>
          </div>
          <div className="header-actions">
            <span className="role-badge"><UserRound size={15} /> {store.role}</span>
            {can(store.role, "alerts") && <button className="icon-button" aria-label="Notifications" onClick={() => store.navigate("alerts")}>
              <Bell size={19} /><i />
            </button>}
            {canCreateTrip && <button className="primary-button" onClick={() => setNewTrip(true)}>
              <Plus size={17} /> Nouveau voyage
            </button>}
            <button className="icon-button logout-button" aria-label="Se déconnecter" title="Changer de profil" onClick={store.logout}><LogOut size={18} /></button>
          </div>
        </header>

        <div className="content">
          {store.view === "dashboard" && <Dashboard onTrip={() => store.navigate("trip")} />}
          {store.view === "trips" && <Trips onTrip={() => store.navigate("trip")} onNew={() => setNewTrip(true)} />}
          {store.view === "trip" && <TripDetail />}
          {store.view === "stations" && <Stations />}
          {store.view === "alerts" && <Alerts />}
          {store.view === "driver" && <DriverWorkflow />}
        </div>
      </main>

      {newTrip && <NewTripModal onClose={() => setNewTrip(false)} />}
      {store.notification && <div className="toast" role="status"><Check size={18} /> {store.notification}</div>}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <svg viewBox="0 0 100 80" aria-hidden="true">
        <path d="M42 28 C45 14,58 4,75 4 L98 4 C98 4,68 4,56 16 C48 24,44 32,42 28Z" fill="#F18313" />
        <path d="M12 4H42C58 4,68 14,68 28S54 52,42 54H12C6 54,2 50,2 44V14C2 8,6 4,12 4Z" fill="#2B62AC" />
        <rect x="2" y="60" width="96" height="12" rx="3" fill="#2B62AC" />
      </svg>
      <div><strong>SUD CONTRACTORS</strong><span>Maîtrisez vos opérations</span></div>
    </div>
  );
}

function Dashboard({ onTrip }: { onTrip: () => void }) {
  const { simulationActive, simulateTheft } = useDemoStore();
  const stockSeries = [{ name: "Stock total", data: [118, 116, 112, 109, 106, 103, 101, 98, 95, 92, 89, 86].map((x) => x * 1000) }];
  const reconciliation = simulationActive ? [45000, 45000, 43000] : [45000, 45000, 45000];

  return (
    <>
      <section className="hero-strip">
        <div>
          <span className="eyebrow light">Vendredi 25 septembre 2026 · 11:18</span>
          <h2>Maîtrisez vos <em>opérations,</em><br />réduisez vos pertes.</h2>
          <p>Supervision temps réel de 3 stations et 2 véhicules.</p>
        </div>
        <div className="live-badge"><i /> Données en direct</div>
      </section>

      <section className="kpi-grid">
        <Kpi icon={Database} label="Stock disponible" value="86 420 L" note="68 % de capacité" tone="orange" />
        <Kpi icon={Truck} label="Voyages en cours" value="01" note="CI 01 AB 4521 · En route" tone="blue" />
        <Kpi icon={CircleGauge} label="Écart moyen / 30 j" value="-0,42 %" note="Dans la tolérance cible" tone="green" />
        <Kpi icon={AlertTriangle} label="Alertes ouvertes" value={simulationActive ? "02" : "01"} note={simulationActive ? "1 critique · 1 technique" : "1 alerte technique"} tone="red" />
      </section>

      <section className="dashboard-grid">
        <article className="card chart-card wide">
          <CardHeader label="Tendance consolidée" title="Évolution du stock carburant" action="7 derniers jours" />
          <ApexChart
            type="area"
            height={285}
            series={stockSeries}
            options={{
              ...baseChartOptions,
              chart: { ...baseChartOptions.chart, id: "stock-area" },
              xaxis: { categories: ["00h", "02h", "04h", "06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"] },
              yaxis: { labels: { formatter: (v) => `${Math.round(v / 1000)}k L` } },
              stroke: { curve: "smooth", width: 3 },
              fill: { type: "gradient", gradient: { opacityFrom: 0.38, opacityTo: 0.04 } },
            }}
          />
        </article>

        <article className="card chart-card">
          <CardHeader label="Volume par étape" title="Rapprochement en cours" action="PF-2026-0925" />
          <ApexChart
            type="bar"
            height={285}
            series={[{ name: "Volume", data: reconciliation }]}
            options={{
              ...baseChartOptions,
              xaxis: { categories: ["Déclaré", "Départ", "Arrivée"] },
              yaxis: { min: 40000, labels: { formatter: (v) => `${Math.round(v / 1000)}k` } },
              plotOptions: { bar: { borderRadius: 7, distributed: true, columnWidth: "52%" } },
              colors: ["#2B62AC", "#16A34A", simulationActive ? "#DC2626" : "#FF7900"],
              legend: { show: false },
            }}
          />
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card wide live-trip">
          <CardHeader label="Mission en direct" title="GESTOCI → Station Cocody" action="Départ 09:12" />
          <div className="trip-live-content">
            <TankVisual critical={simulationActive} />
            <div className="trip-summary">
              <div><MapPin /><span>Position actuelle<strong>Boulevard de Vridi, Abidjan</strong></span></div>
              <div><Clock3 /><span>Arrivée estimée<strong>11:46 · dans 28 min</strong></span></div>
              <div><UserRound /><span>Chauffeur<strong>Yao Kouassi</strong></span></div>
              <button className="secondary-button" onClick={onTrip}>Ouvrir le voyage <ChevronRight size={16} /></button>
            </div>
          </div>
        </article>
        <article className={simulationActive ? "card alert-panel critical" : "card alert-panel"}>
          <span className="eyebrow">Démonstration workflow</span>
          <ShieldAlert size={34} />
          <h3>{simulationActive ? "Perte détectée !" : "Tester la détection"}</h3>
          <p>{simulationActive ? "Baisse de 2 000 L hors zone autorisée à 09:41." : "Simulez une variation de volume pendant le trajet."}</p>
          <button onClick={simulateTheft}><Play size={16} /> {simulationActive ? "Relancer la simulation" : "Simuler un siphonnage"}</button>
        </article>
      </section>
    </>
  );
}

function Kpi({ icon: Icon, label, value, note, tone }: { icon: typeof Fuel; label: string; value: string; note: string; tone: string }) {
  return (
    <article className="kpi-card">
      <div className={`kpi-icon ${tone}`}><Icon size={21} /></div>
      <span>{label}</span><strong>{value}</strong><small>{note}</small>
    </article>
  );
}

function CardHeader({ label, title, action }: { label: string; title: string; action: string }) {
  return <header className="card-header"><div><span className="eyebrow">{label}</span><h3>{title}</h3></div><b>{action}</b></header>;
}

function Trips({ onTrip, onNew }: { onTrip: () => void; onNew: () => void }) {
  const { trips, role, updateTrip, deleteTrip } = useDemoStore();
  const [editing, setEditing] = useState<Trip | null>(null);
  const canCreate = can(role, "trips", "create");
  const canUpdate = can(role, "trips", "update");
  const canDelete = can(role, "trips", "delete");
  return (
    <section className="page-section">
      <div className="page-intro"><div><span className="eyebrow">Traçabilité bout en bout</span><h2>Tous les voyages</h2><p>Du bon GESTOCI jusqu’au rapprochement de la cuve.</p></div>{canCreate && <button className="primary-button" onClick={onNew}><Plus /> Planifier</button>}</div>
      <div className="filter-row"><button className="filter-active">Tous · {trips.length}</button><button>En cours · {trips.filter((trip) => trip.status === "En route").length}</button><button>Clôturés · {trips.filter((trip) => trip.status === "Clôturé").length}</button></div>
      <div className="table-card">
        <table><thead><tr><th>Référence</th><th>Statut</th><th>Trajet</th><th>Chargement</th><th>Écart</th><th>Chauffeur</th><th>Actions</th></tr></thead>
          <tbody>{trips.map((trip, index) => <tr key={trip.id}><td><button className="table-link" onClick={index === 0 ? onTrip : undefined}><strong>{trip.id}</strong></button></td><td><span className={`status ${trip.status === "En route" ? "info" : "success"}`}>{trip.status}</span></td><td>{trip.route}</td><td>{formatLiters(trip.volume)}</td><td className={trip.delta && trip.delta < -500 ? "danger-text" : ""}>{trip.delta === null ? "—" : formatLiters(trip.delta)}</td><td>{trip.driver}</td><td><div className="row-actions">{canUpdate && <button aria-label={`Modifier ${trip.id}`} onClick={() => setEditing(trip)}><Pencil /></button>}{canDelete && <button className="delete-action" aria-label={`Supprimer ${trip.id}`} onClick={() => deleteTrip(trip.id)}><Trash2 /></button>}<button aria-label={`Voir ${trip.id}`} onClick={index === 0 ? onTrip : undefined}><ChevronRight /></button></div></td></tr>)}</tbody>
        </table>
      </div>
      {editing && <TripEditor trip={editing} onClose={() => setEditing(null)} onSave={(updates) => { updateTrip(editing.id, updates); setEditing(null); }} />}
    </section>
  );
}

function TripDetail() {
  const { simulationActive, simulateTheft, alertStatus, acknowledgeAlert, navigate } = useDemoStore();
  const delivered = simulationActive ? 43000 : 45000;
  const result = reconcile(45000, delivered);
  return (
    <section className="page-section">
      <button className="back-link" onClick={() => navigate("trips")}>← Retour aux voyages</button>
      <div className="page-intro"><div><span className="eyebrow">Voyage PF-2026-0925</span><h2>GESTOCI → Station Cocody</h2><p>Camion CI 01 AB 4521 · Chauffeur Yao Kouassi</p></div><span className="status info"><i /> En route</span></div>
      <div className="timeline">
        {["Chargement validé", "Départ GESTOCI", "En route", "Arrivée station", "Dépotage", "Rapprochement"].map((x, i) => <div className={i < 3 ? "done" : i === 3 ? "current" : ""} key={x}><i>{i < 2 ? <Check size={13} /> : i + 1}</i><span>{x}</span></div>)}
      </div>
      {simulationActive && <div className="critical-banner"><ShieldAlert /><div><strong>Variation critique détectée : −2 000 L</strong><span>Hors geofence autorisée · 09:41 · Boulevard de Vridi</span></div><button onClick={acknowledgeAlert}>{alertStatus === "acknowledged" ? "Prise en charge ✓" : "Prendre en charge"}</button></div>}
      <div className="trip-detail-grid">
        <article className="card"><CardHeader label="Télémétrie camion" title="Citerne en temps réel" action="Live" /><TankVisual critical={simulationActive} /></article>
        <article className="card map-card"><CardHeader label="Localisation" title="Trajet & événement" action="GPS · 4G" /><RouteMap critical={simulationActive} /></article>
      </div>
      <article className="card reconciliation">
        <CardHeader label="Contrôle d’intégrité" title="Rapprochement des volumes" action={`Tolérance ±0,5 %`} />
        <div className="reconciliation-steps">
          <VolumeStep label="Bon GESTOCI" value={45000} icon={FileText} />
          <ChevronRight />
          <VolumeStep label="Sonde au départ" value={45000} icon={Truck} />
          <ChevronRight />
          <VolumeStep label="Sonde à l’arrivée" value={delivered} icon={MapPin} danger={simulationActive} />
          <ChevronRight />
          <div className={result.isWithinTolerance ? "reconcile-result ok" : "reconcile-result bad"}><span>Écart calculé</span><strong>{formatLiters(result.delta)}</strong><small>{result.percentage} %</small></div>
        </div>
      </article>
      {!simulationActive && <button className="demo-floating" onClick={simulateTheft}><Play /> Simuler la baisse de volume</button>}
    </section>
  );
}

function VolumeStep({ label, value, icon: Icon, danger }: { label: string; value: number; icon: typeof Fuel; danger?: boolean }) {
  return <div className="volume-step"><Icon /><span>{label}</span><strong className={danger ? "danger-text" : ""}>{formatLiters(value)}</strong><small>{danger ? "Anomalie" : "Validé"}</small></div>;
}

function Alerts() {
  const { alerts, role, acknowledgeAlert, navigate, createAlert, updateAlert, deleteAlert } = useDemoStore();
  const [editing, setEditing] = useState<FuelAlert | null>(null);
  const [creating, setCreating] = useState(false);
  const canCreate = can(role, "alerts", "create");
  const canUpdate = can(role, "alerts", "update");
  const canDelete = can(role, "alerts", "delete");
  const critical = alerts.find((alert) => alert.severity === "Critique");
  return (
    <section className="page-section">
      <div className="page-intro"><div><span className="eyebrow">Vigilance opérationnelle</span><h2>Centre d’alertes</h2><p>Analysez, assignez et clôturez chaque événement terrain.</p></div>{canCreate && <button className="primary-button" onClick={() => setCreating(true)}><Plus /> Créer une alerte</button>}</div>
      <div className="alerts-layout">
        <div className="alert-list">
          {alerts.map((alert) => (
            <article className={alert.severity === "Critique" ? "alert-row critical-row" : "alert-row"} key={alert.id}>
              <div className={alert.severity === "Critique" ? "alert-symbol" : "alert-symbol warning"}>{alert.severity === "Critique" ? <ShieldAlert /> : <Bell />}</div>
              <div><span className="eyebrow">{alert.severity} · {alert.id}</span><h3>{alert.title}</h3><p>{alert.details}</p></div>
              <span className={`status ${alert.status === "acknowledged" ? "success" : alert.severity === "Critique" ? "danger" : "warning"}`}>{alert.status === "acknowledged" ? "Prise en charge" : "Ouverte"}</span>
              <div className="row-actions">
                {alert.id === "ALT-001" && <button aria-label="Voir le voyage lié" onClick={() => navigate("trip")}><ChevronRight /></button>}
                {canUpdate && <button aria-label={`Modifier ${alert.id}`} onClick={() => setEditing(alert)}><Pencil /></button>}
                {canDelete && <button className="delete-action" aria-label={`Supprimer ${alert.id}`} onClick={() => deleteAlert(alert.id)}><Trash2 /></button>}
              </div>
            </article>
          ))}
          {alerts.length === 0 && <EmptyState label="Aucune alerte" />}
        </div>
        <aside className="card action-card"><span className="eyebrow">Action rapide</span><ShieldAlert /><h3>{critical?.status === "acknowledged" ? "Alerte assignée" : "Une alerte critique attend"}</h3><p>{critical?.status === "acknowledged" ? "L’investigation est en cours." : "Confirmez la prise en charge pour lancer l’investigation."}</p><button className="primary-button" onClick={acknowledgeAlert} disabled={!critical || critical.status === "acknowledged"}>{critical?.status === "acknowledged" ? <><Check /> Prise en charge</> : "M’assigner l’alerte"}</button></aside>
      </div>
      {(editing || creating) && <AlertEditor alert={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={(data) => { if (editing) updateAlert(editing.id, data); else createAlert(data as Omit<FuelAlert, "id" | "status">); setEditing(null); setCreating(false); }} />}
    </section>
  );
}

function Stations() {
  const { stations, role, createStation, updateStation, deleteStation } = useDemoStore();
  const [editing, setEditing] = useState<Station | null>(null);
  const [creating, setCreating] = useState(false);
  const canCreate = can(role, "stations", "create");
  const canUpdate = can(role, "stations", "update");
  const canDelete = can(role, "stations", "delete");
  const totalStock = stations.reduce((sum, station) => sum + station.stock, 0);
  const totalCapacity = stations.reduce((sum, station) => sum + station.capacity, 0);
  return (
    <section className="page-section">
      <div className="page-intro"><div><span className="eyebrow">Réseau multi-sites</span><h2>Stations & stocks</h2><p>{formatLiters(totalStock)} disponibles sur {formatLiters(totalCapacity)} de capacité.</p></div>{canCreate && <button className="primary-button" onClick={() => setCreating(true)}><Plus /> Ajouter une station</button>}</div>
      <div className="station-grid">
        {stations.map((station) => <article className="station-card" key={station.id}><header><div className="station-icon"><Building2 /></div><div><h3>{station.name}</h3><span><i /> {station.status}</span></div><div className="row-actions">{canUpdate && <button aria-label={`Modifier ${station.name}`} onClick={() => setEditing(station)}><Pencil /></button>}{canDelete && <button className="delete-action" aria-label={`Supprimer ${station.name}`} onClick={() => deleteStation(station.id)}><Trash2 /></button>}</div></header><div className="station-stock"><span>Stock actuel</span><strong>{formatLiters(station.stock)}</strong><small>{Math.round((station.stock / station.capacity) * 100)} % de {formatLiters(station.capacity)}</small><div><i style={{ width: `${(station.stock / station.capacity) * 100}%`, background: station.color }} /></div></div><footer><span>Dernière jauge<strong>11:15</strong></span><span>Cuves actives<strong>3 / 3</strong></span><span>Alertes<strong>0</strong></span></footer></article>)}
      </div>
      {stations.length > 0 && <article className="card station-chart"><CardHeader label="Répartition réseau" title="Volume disponible par station" action="Temps réel" /><ApexChart type="bar" series={[{ name: "Stock", data: stations.map((s) => s.stock) }]} options={{...baseChartOptions, xaxis: { categories: stations.map((station) => station.name.replace("Station ", "")) }, plotOptions: { bar: { borderRadius: 7, distributed: true } }, colors: stations.map((s) => s.color), legend: { show: false }}} /></article>}
      {(editing || creating) && <StationEditor station={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={(data) => { if (editing) updateStation(editing.id, data); else createStation(data as Omit<Station, "id" | "color">); setEditing(null); setCreating(false); }} />}
    </section>
  );
}

function DriverWorkflow() {
  const { driverStep, advanceDriver, logout } = useDemoStore();
  const index = DRIVER_FLOW.indexOf(driverStep);
  const isDone = driverStep === "completed";
  return (
    <section className="driver-page">
      <div className="phone-frame">
        <header><Brand /><button onClick={logout} aria-label="Se déconnecter"><LogOut /></button></header>
        <div className="driver-greeting"><span>Bonjour Yao,</span><h2>Votre mission du jour</h2><p>Vendredi 25 septembre</p></div>
        <div className="mission-card">
          <span className="status info">{STEP_LABELS[driverStep]}</span>
          <strong>PF-2026-0925</strong>
          <div className="driver-route"><i><MapPin /></i><span>Départ<strong>GESTOCI Vridi</strong></span><ChevronRight /><i><Fuel /></i><span>Destination<strong>Station Cocody</strong></span></div>
          <div className="mission-meta"><span>Camion<strong>CI 01 AB 4521</strong></span><span>Volume<strong>45 000 L</strong></span></div>
        </div>
        <div className="driver-progress">
          {DRIVER_FLOW.map((step, i) => <div key={step} className={i < index ? "done" : i === index ? "current" : ""}><i>{i < index ? <Check /> : i + 1}</i><span>{STEP_LABELS[step]}</span></div>)}
        </div>
        <button className="driver-action" onClick={advanceDriver} disabled={isDone}>
          {isDone ? <><Check /> Mission terminée</> : <>{driverAction(driverStep)} <ChevronRight /></>}
        </button>
        <button className="driver-help">Signaler un incident</button>
      </div>
    </section>
  );
}

function NewTripModal({ onClose }: { onClose: () => void }) {
  const { navigate, createTrip } = useDemoStore();
  const [step, setStep] = useState(1);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Planifier un nouveau voyage">
      <div className="modal">
        <header><div><span className="eyebrow">Nouvelle opération</span><h2>Planifier un voyage</h2></div><button onClick={onClose}><X /></button></header>
        <div className="modal-progress"><i className={step >= 1 ? "active" : ""}>1</i><span /><i className={step >= 2 ? "active" : ""}>2</i><span /><i className={step >= 3 ? "active" : ""}>3</i></div>
        {step === 1 && <div className="form-grid"><label>Station destinataire<select defaultValue="cocody"><option value="cocody">Station Cocody</option><option>Station Marcory</option></select></label><label>Produit<select><option>Gasoil</option><option>Super sans plomb</option></select></label><label>Volume commandé<input defaultValue="45 000 L" /></label><label>Date d’enlèvement<input type="date" defaultValue="2026-09-25" /></label></div>}
        {step === 2 && <div className="selection-cards"><button className="selected"><Truck /><span>CI 01 AB 4521<small>7 compartiments · Disponible</small></span><Check /></button><button><Truck /><span>CI 02 BB 7480<small>12 compartiments · Disponible</small></span></button><button className="selected"><UserRound /><span>Yao Kouassi<small>Chauffeur · 128 voyages</small></span><Check /></button></div>}
        {step === 3 && <div className="summary-box"><Check /><h3>Prêt à planifier</h3><p>45 000 L de Gasoil · Station Cocody</p><dl><div><dt>Camion</dt><dd>CI 01 AB 4521</dd></div><div><dt>Chauffeur</dt><dd>Yao Kouassi</dd></div><div><dt>Enlèvement</dt><dd>25 sept. 2026</dd></div></dl></div>}
        <footer><button className="ghost-button" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? "Annuler" : "Retour"}</button><button className="primary-button" onClick={() => { if (step < 3) setStep(step + 1); else { createTrip({ status: "Planifié", route: "GESTOCI → Cocody", volume: 45000, delta: null, driver: "Yao Kouassi" }); onClose(); navigate("trips"); } }}>{step < 3 ? <>Continuer <ChevronRight /></> : <><Check /> Confirmer le voyage</>}</button></footer>
      </div>
    </div>
  );
}

function TripEditor({ trip, onClose, onSave }: { trip: Trip; onClose: () => void; onSave: (trip: Partial<Trip>) => void }) {
  const [route, setRoute] = useState(trip.route);
  const [status, setStatus] = useState(trip.status);
  const [volume, setVolume] = useState(trip.volume);
  const [driver, setDriver] = useState(trip.driver);
  return (
    <EntityModal title={`Modifier ${trip.id}`} eyebrow="Voyage" onClose={onClose} onSubmit={() => onSave({ route, status, volume, driver })}>
      <div className="form-grid">
        <label>Trajet<input aria-label="Trajet" value={route} onChange={(event) => setRoute(event.target.value)} /></label>
        <label>Statut<select aria-label="Statut du voyage" value={status} onChange={(event) => setStatus(event.target.value)}><option>Planifié</option><option>En route</option><option>À rapprocher</option><option>Clôturé</option></select></label>
        <label>Volume (L)<input aria-label="Volume du voyage" type="number" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
        <label>Chauffeur<input aria-label="Chauffeur" value={driver} onChange={(event) => setDriver(event.target.value)} /></label>
      </div>
    </EntityModal>
  );
}

function StationEditor({ station, onClose, onSave }: { station: Station | null; onClose: () => void; onSave: (station: Partial<Station>) => void }) {
  const [name, setName] = useState(station?.name ?? "");
  const [stock, setStock] = useState(station?.stock ?? 0);
  const [capacity, setCapacity] = useState(station?.capacity ?? 50000);
  const [status, setStatus] = useState(station?.status ?? "Opérationnelle");
  return (
    <EntityModal title={station ? `Modifier ${station.name}` : "Ajouter une station"} eyebrow="Station" onClose={onClose} onSubmit={() => onSave({ name, stock, capacity, status })}>
      <div className="form-grid">
        <label>Nom<input aria-label="Nom de la station" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Station Bingerville" /></label>
        <label>Statut<select aria-label="Statut de la station" value={status} onChange={(event) => setStatus(event.target.value)}><option>Opérationnelle</option><option>Niveau bas</option><option>Maintenance</option></select></label>
        <label>Stock actuel (L)<input aria-label="Stock actuel" type="number" min="0" value={stock} onChange={(event) => setStock(Number(event.target.value))} /></label>
        <label>Capacité (L)<input aria-label="Capacité" type="number" min="1" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} /></label>
      </div>
    </EntityModal>
  );
}

function AlertEditor({ alert, onClose, onSave }: { alert: FuelAlert | null; onClose: () => void; onSave: (alert: Partial<FuelAlert> & Pick<FuelAlert, "severity" | "title" | "details">) => void }) {
  const [severity, setSeverity] = useState<FuelAlert["severity"]>(alert?.severity ?? "Avertissement");
  const [title, setTitle] = useState(alert?.title ?? "");
  const [details, setDetails] = useState(alert?.details ?? "");
  const [status, setStatus] = useState<AlertStatus>(alert?.status ?? "open");
  return (
    <EntityModal title={alert ? `Modifier ${alert.id}` : "Créer une alerte"} eyebrow="Alerte" onClose={onClose} onSubmit={() => onSave({ severity, title, details, status })}>
      <div className="form-grid">
        <label>Niveau<select aria-label="Niveau de l'alerte" value={severity} onChange={(event) => setSeverity(event.target.value as FuelAlert["severity"])}><option>Critique</option><option>Technique</option><option>Avertissement</option></select></label>
        <label>Statut<select aria-label="Statut de l'alerte" value={status} onChange={(event) => setStatus(event.target.value as AlertStatus)}><option value="open">Ouverte</option><option value="acknowledged">Prise en charge</option></select></label>
        <label className="form-span">Titre<input aria-label="Titre de l'alerte" required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="form-span">Détails<input aria-label="Détails de l'alerte" required value={details} onChange={(event) => setDetails(event.target.value)} /></label>
      </div>
    </EntityModal>
  );
}

function EntityModal({ title, eyebrow, children, onClose, onSubmit }: { title: string; eyebrow: string; children: ReactNode; onClose: () => void; onSubmit: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <form className="modal entity-modal" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <header><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button type="button" onClick={onClose} aria-label="Fermer"><X /></button></header>
        <div className="entity-form-content">{children}</div>
        <footer><button type="button" className="ghost-button" onClick={onClose}>Annuler</button><button type="submit" className="primary-button"><Save /> Enregistrer</button></footer>
      </form>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="empty-state"><ShieldCheck /><strong>{label}</strong><span>Les nouveaux éléments apparaîtront ici.</span></div>;
}

function driverAction(step: string) {
  const actions: Record<string, string> = {
    assigned: "Commencer le chargement",
    loading: "Valider les 45 000 L",
    in_transit: "Confirmer l’arrivée",
    arrived: "Commencer le dépotage",
    unloading: "Clôturer la livraison",
  };
  return actions[step] ?? "Terminé";
}

function titleForView(view: View) {
  return {
    dashboard: "Vue d’ensemble",
    trips: "Gestion des voyages",
    trip: "Suivi du voyage",
    stations: "Stations & stocks",
    alerts: "Centre d’alertes",
    driver: "Mode chauffeur",
  }[view];
}
