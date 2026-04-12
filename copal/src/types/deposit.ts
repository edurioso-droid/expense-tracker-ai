export type ModerationStatus = 'pending' | 'ok' | 'review' | 'rejected';

export type SkinId =
  | 'void'       // La Nada — gratis
  | 'dust'       // Polvo
  | 'drain'      // Drenarse
  | 'burn'       // Quemarse
  | 'static'     // Estática
  | 'float'      // Soltarse
  | 'erase'      // Borrarse
  | 'collapse';  // Colapsar

export interface Skin {
  id: SkinId;
  name: string;
  priceMXN: number;
  description: string;
  owned: boolean;
}

export interface Deposit {
  id: string;
  text: string;
  createdAt: number;         // timestamp ms
  status: ModerationStatus;
  resonances: number;
  trend: number;             // 0 = no trending, >0 = trending score
  skinId: SkinId;
  sessionId: string;
}

export interface UserSession {
  sessionId: string;         // UUID anonimo, persistido en SecureStore
  ownedSkins: SkinId[];
  unlockedFeatures: UnlockedFeature[];
  depositCount: number;
  lastDepositAt: number | null;
  isFounder: boolean;        // primeros 1,000 usuarios
}

export type UnlockedFeature =
  | 'archive'     // Mi Archivo
  | 'map'         // Tu Mapa
  | 'export'      // Exportar
  | 'noche'       // badge Noche
  | 'profundo'    // badge Profundo (100 depositos)
  | 'silencio';   // badge Silencio

export interface ModerationResult {
  status: 'ok' | 'rejected' | 'review';
  reason?: string;   // max 5 palabras si es rechazo
}

export interface ClusterCheckResult {
  status: 'safe' | 'review';
  reason?: string;
}

export type TrendLevel = 'none' | 'low' | 'mid' | 'high' | 'viral';

export function getTrendLevel(trend: number): TrendLevel {
  if (trend <= 0)       return 'none';
  if (trend < 3200)     return 'low';
  if (trend < 14000)    return 'mid';
  if (trend < 91000)    return 'high';
  return 'viral';
}

export function formatTrend(trend: number): string {
  if (trend < 1000) return String(trend);
  if (trend < 10000) return `${(trend / 1000).toFixed(1)}k`;
  return `${Math.round(trend / 1000)}k`;
}
