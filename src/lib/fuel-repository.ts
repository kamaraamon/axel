import { getSql } from "@/lib/db";
import {
  INITIAL_ALERTS,
  INITIAL_STATIONS,
  INITIAL_TRIPS,
  type FuelAlert,
  type FuelSnapshot,
  type Station,
  type Trip,
} from "@/lib/fuel-data";

let ready: Promise<void> | null = null;

async function createTables() {
  const sql = getSql();
  await sql`
    create table if not exists fuel_trips (
      ord integer not null,
      id text primary key,
      status text not null,
      route text not null,
      volume integer not null,
      delta integer,
      driver text not null
    )
  `;
  await sql`
    create table if not exists fuel_stations (
      ord integer not null,
      id text primary key,
      name text not null,
      stock integer not null,
      capacity integer not null,
      status text not null,
      color text not null
    )
  `;
  await sql`
    create table if not exists fuel_alerts (
      ord integer not null,
      id text primary key,
      severity text not null,
      title text not null,
      details text not null,
      status text not null
    )
  `;
  const counts = await sql`select
    (select count(*)::int from fuel_trips) as trips,
    (select count(*)::int from fuel_stations) as stations,
    (select count(*)::int from fuel_alerts) as alerts
  `;
  const count = counts[0] as { trips: number; stations: number; alerts: number };
  if (Number(count.trips) === 0 && Number(count.stations) === 0 && Number(count.alerts) === 0) {
    await replaceFuelSnapshot({
      trips: INITIAL_TRIPS,
      stations: INITIAL_STATIONS,
      alerts: INITIAL_ALERTS,
    });
  }
}

export function ensureFuelSchema() {
  ready ??= createTables().catch((error: unknown) => {
    ready = null;
    throw error;
  });
  return ready;
}

export async function readFuelSnapshot(): Promise<FuelSnapshot> {
  await ensureFuelSchema();
  const sql = getSql();
  const trips = await sql`select id, status, route, volume, delta, driver from fuel_trips order by ord`;
  const stations = await sql`select id, name, stock, capacity, status, color from fuel_stations order by ord`;
  const alerts = await sql`select id, severity, title, details, status from fuel_alerts order by ord`;
  return {
    trips: trips as Trip[],
    stations: stations as Station[],
    alerts: alerts as FuelAlert[],
  };
}

export async function replaceFuelSnapshot(snapshot: FuelSnapshot) {
  const sql = getSql();
  await sql`delete from fuel_trips`;
  await sql`delete from fuel_stations`;
  await sql`delete from fuel_alerts`;
  for (const [ord, trip] of snapshot.trips.entries()) {
    await sql`
      insert into fuel_trips (ord, id, status, route, volume, delta, driver)
      values (${ord}, ${trip.id}, ${trip.status}, ${trip.route}, ${trip.volume}, ${trip.delta}, ${trip.driver})
    `;
  }
  for (const [ord, station] of snapshot.stations.entries()) {
    await sql`
      insert into fuel_stations (ord, id, name, stock, capacity, status, color)
      values (${ord}, ${station.id}, ${station.name}, ${station.stock}, ${station.capacity}, ${station.status}, ${station.color})
    `;
  }
  for (const [ord, alert] of snapshot.alerts.entries()) {
    await sql`
      insert into fuel_alerts (ord, id, severity, title, details, status)
      values (${ord}, ${alert.id}, ${alert.severity}, ${alert.title}, ${alert.details}, ${alert.status})
    `;
  }
}
