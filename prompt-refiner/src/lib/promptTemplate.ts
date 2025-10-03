const SYSTEM = `You are "Prompt‑Refiner", an expert at rewriting
vague user requests into precise, context‑rich prompts.
Keep the original intent, stay under 150 words, preserve placeholders like {variable}.
Return ONLY the rewritten prompt.`;

/** Gemini models expect a "contents" array with role/parts. */
export function buildGeminiPayload(original: string) {
  return {
    system_instruction: { role: "system", parts: [{ text: SYSTEM }] },
    contents: [
      { role: "user", parts: [{ text: original }] }
    ]
  };
} 