// WC2026 venue + team-origin geodata.
//
// Two lookup tables that give any point on the map a real latitude/longitude:
//   - STADIUMS: the 16 official host venues, keyed by their common stadium name.
//   - TEAM_COORDINATES: an origin city for each of the 48 qualified teams.
//
// These are consumed by the globe's plane-flight animation (a great-circle arc
// needs a real origin and destination). This module is pure data - it renders
// nothing on its own, and is safe to import from any runtime (no Vite globals,
// no DOM). Country codes match the rest of the app: 'US' / 'CA' / 'MX', the same
// venue-country convention bracket.js keys the host bonus off (HOST_OF).
//
// SOURCES / VERIFICATION
//   Host list cross-checked against FIFA's official stadiums page and the app's
//   own fixtures.json (which already schedules matches at all 16). 11 venues in
//   the USA, 3 in Mexico, 2 in Canada = 16. Coordinates are stadium centroids to
//   ~4dp (≈11 m) - precise enough for a globe arc, not a survey. `image` is a
//   placeholder path under public/stadiums/; the art is not part of this session.
//   `city` is the physical locale (matching fixtures.json's venue.city style);
//   `hostCity` is FIFA's marketing host-city label.

export const STADIUMS = {
  // --- United States (11) ---------------------------------------------------
  'MetLife Stadium': {
    city: 'East Rutherford, NJ', hostCity: 'New York / New Jersey', country: 'US',
    capacity: 82500, lat: 40.8135, lng: -74.0745, image: '/stadiums/metlife.jpg',
  },
  'SoFi Stadium': {
    city: 'Inglewood, CA', hostCity: 'Los Angeles', country: 'US',
    capacity: 70240, lat: 33.9535, lng: -118.3392, image: '/stadiums/sofi.jpg',
  },
  'AT&T Stadium': {
    city: 'Arlington, TX', hostCity: 'Dallas', country: 'US',
    capacity: 80000, lat: 32.7473, lng: -97.0945, image: '/stadiums/att.jpg',
  },
  'Arrowhead Stadium': {
    city: 'Kansas City, MO', hostCity: 'Kansas City', country: 'US',
    capacity: 76416, lat: 39.0489, lng: -94.4839, image: '/stadiums/arrowhead.jpg',
  },
  'NRG Stadium': {
    city: 'Houston, TX', hostCity: 'Houston', country: 'US',
    capacity: 72220, lat: 29.6847, lng: -95.4107, image: '/stadiums/nrg.jpg',
  },
  'Mercedes-Benz Stadium': {
    city: 'Atlanta, GA', hostCity: 'Atlanta', country: 'US',
    capacity: 71000, lat: 33.7554, lng: -84.4008, image: '/stadiums/mercedes-benz.jpg',
  },
  'Hard Rock Stadium': {
    city: 'Miami Gardens, FL', hostCity: 'Miami', country: 'US',
    capacity: 65326, lat: 25.9580, lng: -80.2389, image: '/stadiums/hard-rock.jpg',
  },
  'Lincoln Financial Field': {
    city: 'Philadelphia, PA', hostCity: 'Philadelphia', country: 'US',
    capacity: 69596, lat: 39.9008, lng: -75.1675, image: '/stadiums/lincoln-financial.jpg',
  },
  'Gillette Stadium': {
    city: 'Foxborough, MA', hostCity: 'Boston', country: 'US',
    capacity: 65878, lat: 42.0909, lng: -71.2643, image: '/stadiums/gillette.jpg',
  },
  "Levi's Stadium": {
    city: 'Santa Clara, CA', hostCity: 'San Francisco Bay Area', country: 'US',
    capacity: 68500, lat: 37.4030, lng: -121.9700, image: '/stadiums/levis.jpg',
  },
  'Lumen Field': {
    city: 'Seattle, WA', hostCity: 'Seattle', country: 'US',
    capacity: 68740, lat: 47.5952, lng: -122.3316, image: '/stadiums/lumen.jpg',
  },

  // --- Mexico (3) -----------------------------------------------------------
  'Estadio Azteca': {
    city: 'Mexico City', hostCity: 'Mexico City', country: 'MX',
    capacity: 83264, lat: 19.3029, lng: -99.1505, image: '/stadiums/azteca.jpg',
  },
  'Estadio Akron': {
    city: 'Guadalajara', hostCity: 'Guadalajara', country: 'MX',
    capacity: 48071, lat: 20.6819, lng: -103.4626, image: '/stadiums/akron.jpg',
  },
  'Estadio BBVA': {
    city: 'Monterrey', hostCity: 'Monterrey', country: 'MX',
    capacity: 53500, lat: 25.6693, lng: -100.2444, image: '/stadiums/bbva.jpg',
  },

  // --- Canada (2) -----------------------------------------------------------
  'BC Place': {
    city: 'Vancouver, BC', hostCity: 'Vancouver', country: 'CA',
    capacity: 54500, lat: 49.2768, lng: -123.1120, image: '/stadiums/bc-place.jpg',
  },
  'BMO Field': {
    city: 'Toronto, ON', hostCity: 'Toronto', country: 'CA',
    capacity: 45000, lat: 43.6332, lng: -79.4185, image: '/stadiums/bmo-field.jpg',
  },
}

// Iterable form, each entry carrying its own name - convenient for markers.
export const STADIUM_LIST = Object.entries(STADIUMS).map(([name, s]) => ({ name, ...s }))

// Lookup by stadium name; null when we don't carry it. Mirrors the accessor
// style of the rest of lib/ (teamMeta, getOdds).
export function getStadium(name) {
  return STADIUMS[name] || null
}

// --- Team origins ----------------------------------------------------------
// One [lat, lng] origin per qualified team, keyed by the exact canonical name in
// lib/teams.js so a fixture's team name resolves directly. Default rule: the
// national capital. Three exceptions use the primary football metro where the
// administrative capital is a minor or purpose-built city - noted inline - since
// the plane should launch from where the team actually plays, not a formality.
export const TEAM_COORDINATES = {
  Argentina: [-34.6037, -58.3816], // Buenos Aires
  France: [48.8566, 2.3522], // Paris
  Brazil: [-15.7939, -47.8828], // Brasília
  England: [51.5074, -0.1278], // London
  Spain: [40.4168, -3.7038], // Madrid
  Portugal: [38.7223, -9.1393], // Lisbon
  Colombia: [4.7110, -74.0721], // Bogotá
  Netherlands: [52.3676, 4.9041], // Amsterdam
  Switzerland: [46.9480, 7.4474], // Bern
  Norway: [59.9139, 10.7522], // Oslo
  Japan: [35.6762, 139.6503], // Tokyo
  Belgium: [50.8503, 4.3517], // Brussels
  Ecuador: [-0.1807, -78.4678], // Quito
  Germany: [52.5200, 13.4050], // Berlin
  Mexico: [19.4326, -99.1332], // Mexico City
  Turkey: [39.9334, 32.8597], // Ankara
  Croatia: [45.8150, 15.9819], // Zagreb
  Senegal: [14.7167, -17.4677], // Dakar
  Uruguay: [-34.9011, -56.1645], // Montevideo
  Canada: [45.4215, -75.6972], // Ottawa
  Morocco: [34.0209, -6.8416], // Rabat
  Austria: [48.2082, 16.3738], // Vienna
  Paraguay: [-25.2637, -57.5759], // Asunción
  'United States': [38.9072, -77.0369], // Washington, D.C.
  Australia: [-35.2809, 149.1300], // Canberra
  'South Korea': [37.5665, 126.9780], // Seoul
  Scotland: [55.9533, -3.1883], // Edinburgh
  Algeria: [36.7538, 3.0588], // Algiers
  Czechia: [50.0755, 14.4378], // Prague
  Iran: [35.6892, 51.3890], // Tehran
  Panama: [8.9824, -79.5199], // Panama City
  Egypt: [30.0444, 31.2357], // Cairo
  Uzbekistan: [41.2995, 69.2401], // Tashkent
  'DR Congo': [-4.4419, 15.2663], // Kinshasa
  Jordan: [31.9454, 35.9284], // Amman
  'Bosnia and Herzegovina': [43.8563, 18.4131], // Sarajevo
  'Ivory Coast': [5.3600, -4.0083], // Abidjan (economic hub; capital Yamoussoukro is minor)
  'New Zealand': [-41.2865, 174.7762], // Wellington
  Sweden: [59.3293, 18.0686], // Stockholm
  'Cape Verde': [14.9330, -23.5133], // Praia
  'Curaçao': [12.1091, -68.9316], // Willemstad
  Ghana: [5.6037, -0.1870], // Accra
  Haiti: [18.5944, -72.3074], // Port-au-Prince
  Iraq: [33.3152, 44.3661], // Baghdad
  Qatar: [25.2854, 51.5310], // Doha
  'Saudi Arabia': [24.7136, 46.6753], // Riyadh
  'South Africa': [-26.2041, 28.0473], // Johannesburg (football hub; capitals split three ways)
  Tunisia: [36.8065, 10.1815], // Tunis
}

// [lat, lng] origin for a team name, or null if unknown.
export function teamOrigin(name) {
  return TEAM_COORDINATES[name] || null
}
