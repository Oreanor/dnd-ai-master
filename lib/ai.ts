import "dotenv/config";
import { CohereClient } from "cohere-ai";
import { CONFIG } from '../config/constants';
import { AIError } from './errors';

const cohereApiKey = process.env.COHERE_API_KEY;
const cohere = cohereApiKey ? new CohereClient({ token: cohereApiKey }) : null;

function extractTextFromCohereResponse(response: unknown): string {
  if (response && typeof response === "object") {
    const maybeText = (response as { text?: unknown }).text;
    if (typeof maybeText === "string") {
      const t = maybeText.trim();
      if (t) return t;
    }

    const maybeMessage = (response as { message?: { content?: unknown } }).message;
    const content = maybeMessage?.content;
    if (Array.isArray(content) && content.length > 0 && content[0] && typeof content[0] === "object") {
      const firstText = (content[0] as { text?: unknown }).text;
      if (typeof firstText === "string") {
        const t = firstText.trim();
        if (t) return t;
      }
    }
  }
  return "";
}

function extractSceneSection(text: string): string {
  const re = /([\s\S]*?)\*\*JSON-предложение для мира:\*\*/;
  const match = re.exec(text);
  if (match && typeof match[1] === "string") {
    return match[1].trim();
  }
  return text;
}

export function generateWelcomeContext(worldState: any): string {
  const { context, locations } = worldState;
  const currentLocation = locations[context.currentLocation];
  
  return `
Вы находитесь в ${currentLocation.name}.
${currentLocation.desc}

Опиши эту локацию кратко и атмосферно (максимум 3-4 предложения). Создай погружение в мир D&D. Опиши что видит игрок, какие звуки слышит, какие запахи чувствует. Будь конкретным и лаконичным.
  `.trim();
}

export function generateAIContext(playerName: string, action: string, worldState: any): string {
  const { context, locations } = worldState;
  const currentLocation = locations[context.currentLocation];
  
  // Создаем краткий контекст только с последними изменениями
  const recentEvents = context.recentEvents.slice(-3); // Только последние 3 события
  const recentEventsText = recentEvents.length > 0 
    ? `Последние действия: ${recentEvents.map((e: any) => `${e.player}: ${e.action} (${e.success ? 'успех' : 'неудача'})`).join(', ')}`
    : '';
  
  // Текущее состояние НПС
  const npcState = currentLocation.npcs.map((npc: any) => 
    `${npc.name}: HP ${npc.hp}/${npc.hp + (12 - npc.hp)}`
  ).join(', ');
  
  return `
Текущая сцена: ${context.currentScene}
${recentEventsText}
Состояние НПС: ${npcState}

Игрок ${playerName} делает действие: "${action}".

Развивай ситуацию на основе этого действия (максимум 2-3 предложения). Не повторяй описание сцены, а покажи что происходит дальше. Будь кратким, динамичным и конкретным. Избегай длинных описаний.
  `.trim();
}

function truncateResponse(text: string, maxLength: number = CONFIG.AI_MAX_RESPONSE_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Обрезаем до последнего полного предложения
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

export async function callAI(prompt: string): Promise<string> {
  if (!cohere) {
    throw new AIError("COHERE_API_KEY is not set");
  }

  try {
    const preferred = process.env.COHERE_MODEL;
    const candidates = Array.from(new Set([
      preferred,
      "command-r-plus",
      "command-r-plus-latest",
      "command-r7b-12-2024",
      "command-r7b",
      "command",
      "command-light"
    ].filter(Boolean))) as string[];

    for (const model of candidates) {
      try {
        const response = await cohere.chat({ 
          model, 
          message: prompt,
          maxTokens: CONFIG.MAX_TOKENS,
          temperature: CONFIG.AI_TEMPERATURE
        });
        const raw = extractTextFromCohereResponse(response);
        const text = extractSceneSection(raw);
        if (text) {
          return truncateResponse(text);
        }
      } catch (err: unknown) {
        let status: number | string | undefined;
        let msg: string;
        if (err && typeof err === "object") {
          const e = err as { status?: number; code?: number | string; message?: unknown };
          status = e.status ?? e.code;
          msg = typeof e.message === "string" ? e.message : String(err);
        } else {
          msg = String(err);
        }
        // If model not found/removed, try next candidate
        if (status === 404 || /not\s*found|removed/i.test(msg)) {
          continue;
        }
        // For rate limits/transient errors, bubble to outer catch
        throw err;
      }
    }
    throw new AIError("All AI models unavailable");
  } catch (err: unknown) {
    if (err instanceof AIError) {
      throw err;
    }
    const msg = (err && typeof err === "object" && typeof (err as { message?: unknown }).message === "string")
      ? (err as { message: string }).message
      : String(err);
    throw new AIError(`AI call failed: ${msg}`, err as Error);
  }
}