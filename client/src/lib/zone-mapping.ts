export const ZONE_STATES: Record<string, string[]> = {
  Sureste: ["Quintana Roo", "Yucatán", "Campeche"],
  Sur: ["Veracruz", "Tabasco", "Chiapas", "Oaxaca"],
  Centro: ["Ciudad de México", "México", "Puebla", "Tlaxcala", "Hidalgo", "Morelos"],
  Bajío: ["Querétaro", "Guanajuato", "Aguascalientes", "Zacatecas", "San Luis Potosí"],
  Norte: ["Tamaulipas", "Nuevo León", "Coahuila", "Coahuila de Zaragoza", "Durango"],
  Pacífico: ["Guerrero", "Michoacán", "Michoacán de Ocampo", "Colima", "Jalisco", "Nayarit", "Sinaloa"],
  Noroeste: ["Baja California", "Baja California Sur", "Sonora", "Chihuahua"],
};

export const ZONE_LABELS: Record<string, string> = {
  Sureste: "Quintana Roo, Yucatán, Campeche",
  Sur: "Veracruz, Tabasco, Chiapas, Oaxaca",
  Centro: "CDMX, Edo. México, Puebla, Tlaxcala, Hidalgo, Morelos",
  Bajío: "Querétaro, Guanajuato, Aguascalientes, Zacatecas, SLP",
  Norte: "Nuevo León, Coahuila, Tamaulipas, Durango",
  Pacífico: "Guerrero, Michoacán, Colima, Jalisco, Nayarit, Sinaloa",
  Noroeste: "BC Norte, BC Sur, Sonora, Chihuahua",
};

export function getStatesForZone(zone: string): string[] {
  return ZONE_STATES[zone] || [];
}

export function getZoneForState(state: string): string | null {
  for (const [zone, states] of Object.entries(ZONE_STATES)) {
    if (states.some(s => s.toLowerCase() === state.toLowerCase())) return zone;
  }
  return null;
}

export const ALL_ZONES = Object.keys(ZONE_STATES);
