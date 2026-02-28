import { Flight, FlightSample } from '../types';

let flights: Flight[] = [];

export async function initDatabase(): Promise<void> {
  console.log('Database initialized (in-memory)');
}

export async function saveFlight(flight: Flight): Promise<void> {
  flights.unshift(flight);
}

export async function getAllFlights(): Promise<Flight[]> {
  return flights;
}

export async function getFlight(id: string): Promise<Flight | null> {
  return flights.find(f => f.id === id) || null;
}

export async function deleteFlight(id: string): Promise<void> {
  flights = flights.filter(f => f.id !== id);
}
