export interface F1Race {
  round: number;
  name: string;
  country: string;
  countryCode: string;
  circuit: string;
  raceDate: string;
}

// 2026 F1 Calendar — race day (Sunday) for each round.
// Race "week" runs from Monday to Sunday of the race weekend.
export const F1_CALENDAR_2026: F1Race[] = [
  { round: 1,  name: 'Australian Grand Prix',    country: 'Australia',     countryCode: 'AU', circuit: 'Albert Park',         raceDate: '2026-03-08' },
  { round: 2,  name: 'Chinese Grand Prix',       country: 'China',         countryCode: 'CN', circuit: 'Shanghai Intl.',      raceDate: '2026-03-15' },
  { round: 3,  name: 'Japanese Grand Prix',      country: 'Japan',         countryCode: 'JP', circuit: 'Suzuka',              raceDate: '2026-03-29' },
  { round: 4,  name: 'Bahrain Grand Prix',       country: 'Bahrain',       countryCode: 'BH', circuit: 'Bahrain Intl.',       raceDate: '2026-04-12' },
  { round: 5,  name: 'Saudi Arabian Grand Prix', country: 'Saudi Arabia',  countryCode: 'SA', circuit: 'Jeddah Corniche',     raceDate: '2026-04-19' },
  { round: 6,  name: 'Miami Grand Prix',         country: 'USA',           countryCode: 'US', circuit: 'Miami Intl.',         raceDate: '2026-05-03' },
  { round: 7,  name: 'Canadian Grand Prix',      country: 'Canada',        countryCode: 'CA', circuit: 'Gilles Villeneuve',   raceDate: '2026-05-24' },
  { round: 8,  name: 'Monaco Grand Prix',        country: 'Monaco',        countryCode: 'MC', circuit: 'Circuit de Monaco',   raceDate: '2026-06-07' },
  { round: 9,  name: 'Spanish Grand Prix',       country: 'Spain',         countryCode: 'ES', circuit: 'Catalunya',           raceDate: '2026-06-14' },
  { round: 10, name: 'Austrian Grand Prix',      country: 'Austria',       countryCode: 'AT', circuit: 'Red Bull Ring',       raceDate: '2026-06-28' },
  { round: 11, name: 'British Grand Prix',       country: 'Great Britain', countryCode: 'GB', circuit: 'Silverstone',         raceDate: '2026-07-05' },
  { round: 12, name: 'Hungarian Grand Prix',     country: 'Hungary',       countryCode: 'HU', circuit: 'Hungaroring',         raceDate: '2026-07-19' },
  { round: 13, name: 'Belgian Grand Prix',       country: 'Belgium',       countryCode: 'BE', circuit: 'Spa-Francorchamps',   raceDate: '2026-07-26' },
  { round: 14, name: 'Dutch Grand Prix',         country: 'Netherlands',   countryCode: 'NL', circuit: 'Zandvoort',           raceDate: '2026-08-23' },
  { round: 15, name: 'Italian Grand Prix',       country: 'Italy',         countryCode: 'IT', circuit: 'Monza',               raceDate: '2026-09-06' },
  { round: 16, name: 'Azerbaijan Grand Prix',    country: 'Azerbaijan',    countryCode: 'AZ', circuit: 'Baku City',           raceDate: '2026-09-13' },
  { round: 17, name: 'Singapore Grand Prix',     country: 'Singapore',     countryCode: 'SG', circuit: 'Marina Bay',          raceDate: '2026-09-27' },
  { round: 18, name: 'United States Grand Prix', country: 'USA',           countryCode: 'US', circuit: 'Circuit of the Americas', raceDate: '2026-10-25' },
  { round: 19, name: 'Mexico City Grand Prix',   country: 'Mexico',        countryCode: 'MX', circuit: 'Hermanos Rodríguez',  raceDate: '2026-11-01' },
  { round: 20, name: 'São Paulo Grand Prix',     country: 'Brazil',        countryCode: 'BR', circuit: 'Interlagos',          raceDate: '2026-11-08' },
  { round: 21, name: 'Las Vegas Grand Prix',     country: 'USA',           countryCode: 'US', circuit: 'Las Vegas Strip',     raceDate: '2026-11-21' },
  { round: 22, name: 'Qatar Grand Prix',         country: 'Qatar',         countryCode: 'QA', circuit: 'Lusail Intl.',        raceDate: '2026-11-29' },
  { round: 23, name: 'Abu Dhabi Grand Prix',     country: 'UAE',           countryCode: 'AE', circuit: 'Yas Marina',          raceDate: '2026-12-06' },
];

// Returns the race for the current week — the next race whose race day is today or in the future.
// If the season is over, returns the final race.
// If the season hasn't started, returns the first race.
export function getCurrentRaceWeek(now: Date = new Date()): F1Race {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const race of F1_CALENDAR_2026) {
    const raceDay = new Date(race.raceDate + 'T00:00:00');
    if (raceDay.getTime() >= today.getTime()) return race;
  }
  return F1_CALENDAR_2026[F1_CALENDAR_2026.length - 1];
}

export function daysUntilRace(race: F1Race, now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const raceDay = new Date(race.raceDate + 'T00:00:00');
  return Math.round((raceDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
