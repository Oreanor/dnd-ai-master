import "dotenv/config";
import { CohereClient } from "cohere-ai";

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
    console.log("[AI] Found JSON marker, extracted text length:", match[1].trim().length);
    return match[1].trim();
  }
  console.log("[AI] No JSON marker found, returning full text length:", text.length);
  return text;
}

export async function callAI(prompt: string): Promise<string> {
  if (!cohere) {
    console.warn("[AI] COHERE_API_KEY is not set; returning fallback text.");
    return "AI temporarily unavailable. Fallback narrative.";
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
        const response = await cohere.chat({ model, message: prompt });
        const raw = extractTextFromCohereResponse(response);
        const text = extractSceneSection(raw);
        console.log("[AI] Extracted text length:", text.length);
        if (text) return text;
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
          console.warn(`[AI] model ${model} unavailable, trying next.`, msg);
          continue;
        }
        // For rate limits/transient errors, bubble to outer catch
        throw err;
      }
    }
    return "AI temporarily unavailable. Fallback narrative. [All models unavailable]";
  } catch (err: unknown) {
    const msg = (err && typeof err === "object" && typeof (err as { message?: unknown }).message === "string")
      ? (err as { message: string }).message
      : String(err);
    console.error("[AI] call failed:", msg);
    return `AI temporarily unavailable. Fallback narrative. [${msg}]`;
  }
}