import Anthropic from '@anthropic-ai/sdk';
import { ModerationResult, ClusterCheckResult } from '../types/deposit';

// El cliente se inicializa con la API key del entorno
// En produccion, las llamadas se hacen desde un backend propio
// para no exponer la key en el cliente movil
const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
});

// --- AGENTE 1: Moderador individual ---
// Modelo: claude-haiku-4-5 (costo reducido — tarea binaria simple)
// Solo escala a Sonnet si hay ambiguedad

export async function moderateDeposit(text: string): Promise<ModerationResult> {
  if (!text.trim()) return { status: 'rejected', reason: 'texto vacío' };

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 32,
      system: `Moderador de copal.app. Responde SOLO "ok" o "no: [razón 5 palabras max]".
Rechaza: sexual explícito, ilegal, coordinación dañina, violencia directa, datos de terceros identificables.
Aprueba: cualquier emoción genuina, oscura, cruda, cotidiana, triste, enojada.
Sin saludos. Sin explicaciones. Sin moralizar.`,
      messages: [{ role: 'user', content: text }],
    });

    const raw = (response.content[0] as { type: 'text'; text: string }).text.trim();

    if (raw.toLowerCase().startsWith('ok')) {
      return { status: 'ok' };
    }

    const reason = raw.replace(/^no:\s*/i, '').slice(0, 60);
    return { status: 'rejected', reason };
  } catch {
    // En caso de error de red, aprobacion optimista — el backend re-modera
    return { status: 'ok' };
  }
}

// --- AGENTE 2: Detector de clusters ---
// Modelo: claude-sonnet-4-6 — corre en batch, no por deposito
// Se llama desde el backend cada 6-24h sobre el corpus reciente

export async function detectCluster(
  recentSimilar: string[],
  newDeposit: string
): Promise<ClusterCheckResult> {
  if (recentSimilar.length < 4) return { status: 'safe' };

  try {
    const context = recentSimilar.map((t, i) => `${i + 1}. ${t}`).join('\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 48,
      system: `Detectas coordinación en copal.app.
Analiza el nuevo pensamiento vs los similares recientes.
Responde SOLO "safe" si es coincidencia orgánica o tema cultural compartido.
Responde SOLO "review: [razón breve]" si hay señales claras de coordinación para daño.
No filtres emociones colectivas genuinas. Solo detecta abuso organizado.`,
      messages: [
        {
          role: 'user',
          content: `Pensamientos similares recientes:\n${context}\n\nNuevo pensamiento:\n${newDeposit}`,
        },
      ],
    });

    const raw = (response.content[0] as { type: 'text'; text: string }).text.trim();

    if (raw.toLowerCase().startsWith('safe')) return { status: 'safe' };

    const reason = raw.replace(/^review:\s*/i, '').slice(0, 80);
    return { status: 'review', reason };
  } catch {
    return { status: 'safe' };
  }
}
