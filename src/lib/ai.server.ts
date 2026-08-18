import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.5-flash";

export class AiServiceError extends Error {
  constructor(
    message: string,
    readonly retryable = true,
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

export const SAFETY_RULES = [
  "Do not invent facts, companies, people, salaries, sources, achievements or events.",
  "Only use information supplied in the context below. If something required is missing, say so explicitly instead of guessing.",
  "Never claim an event happened unless it appears in the provided context.",
  "Clearly hedge interpretation ('based on your notes…') rather than asserting it as verified fact.",
].join("\n");

export type PromptSection = { label: string; body: string | null | undefined };

/** Builds a structured prompt. Empty sections are omitted so we never leak noise. */
export function buildPrompt(sections: PromptSection[]): string {
  return sections
    .filter((s) => s.body != null && String(s.body).trim() !== "")
    .map((s) => `${s.label}:\n${String(s.body).trim()}`)
    .join("\n\n");
}

type CallOptions = {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  json?: boolean;
};

async function callGateway({ system, user, model, temperature, json }: CallOptions) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiServiceError("The AI service is not configured.", false);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        temperature: temperature ?? 0.4,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (response.status === 429) {
      throw new AiServiceError("The AI service is busy right now. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new AiServiceError("The AI workspace has run out of credits.", false);
    }
    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text().catch(() => ""));
      throw new AiServiceError("The AI service couldn't complete this request. Please try again.");
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AiServiceError("The AI service returned an empty response.");
    return content;
  } catch (error) {
    if (error instanceof AiServiceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiServiceError("The AI request timed out. Please try again.");
    }
    console.error("AI gateway failure", error);
    throw new AiServiceError("The AI service couldn't complete this request. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateText(options: CallOptions): Promise<string> {
  return callGateway(options);
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const candidate = start > 0 ? cleaned.slice(start) : cleaned;
  try {
    return JSON.parse(candidate);
  } catch {
    throw new AiServiceError("The AI returned an unexpected format. Please try again.");
  }
}

/** Calls the model and validates the JSON payload against a strict schema. */
export async function generateStructured<T extends z.ZodTypeAny>(
  options: CallOptions,
  schema: T,
): Promise<z.infer<T>> {
  const raw = await callGateway({ ...options, json: true });
  const parsed = schema.safeParse(extractJson(raw));
  if (!parsed.success) {
    console.error("AI schema validation failed", parsed.error.issues);
    throw new AiServiceError("The AI returned an unexpected format. Please try again.");
  }
  return parsed.data;
}
