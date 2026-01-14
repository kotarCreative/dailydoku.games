export interface DailySession {
  date: string; // YYYY-MM-DD
  games: string[]; // ALL favorite games for today
  completedGames: string[];
  startTime?: number;
  endTime?: number;
}

export interface UserPreferences {
  playOrder: 'sequential' | 'random';
}
