// Rate limit: max 3 depositos en 2 minutos por sesion
// Estado en memoria — se resetea al reiniciar la app (por diseno)

const WINDOW_MS = 2 * 60 * 1000;  // 2 minutos
const MAX_DEPOSITS = 3;

const deposits: number[] = [];

export function canDeposit(): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Limpiar depositos fuera de la ventana
  while (deposits.length > 0 && deposits[0] < windowStart) {
    deposits.shift();
  }

  return deposits.length < MAX_DEPOSITS;
}

export function recordDeposit(): void {
  deposits.push(Date.now());
}

export function timeUntilNextSlot(): number {
  if (deposits.length < MAX_DEPOSITS) return 0;
  const oldest = deposits[deposits.length - MAX_DEPOSITS];
  return Math.max(0, oldest + WINDOW_MS - Date.now());
}
