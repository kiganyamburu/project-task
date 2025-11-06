export async function callGemini(
  prompt: string,
  options?: { maxTokens?: number }
) {
  const url = process.env.GEMINI_API_URL;
  const key = process.env.GEMINI_API_KEY;

  if (!url || !key) {
    // No configured Gemini endpoint/key — caller should handle null
    return null;
  }

  const body: any = {
    // We keep this generic so the project owner can point to an OpenAI-compatible
    // proxy or Google's Vertex AI endpoint. Minimal defaults are provided.
    model: process.env.GEMINI_MODEL || "gemini",
    max_tokens: options?.maxTokens ?? 512,
    // For OpenAI-compatible endpoints a top-level `prompt` may be expected.
    // For chat-style endpoints, callers can include full message structure in the prompt string.
    prompt,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    // Flexible parsing: handle OpenAI-compatible `choices` with `message` or `text`,
    // Google's Vertex AI responses (`candidates` / `output_text`), or other shapes.
    let text: string | null = null;
    if (json?.choices && Array.isArray(json.choices) && json.choices[0]) {
      const choice = json.choices[0];
      if (choice.message?.content) text = choice.message.content;
      else if (typeof choice.text === "string") text = choice.text;
    } else if (
      json?.candidates &&
      Array.isArray(json.candidates) &&
      json.candidates[0]
    ) {
      // Vertex AI-like
      text = json.candidates[0].content || json.candidates[0].output || null;
    } else if (typeof json?.output_text === "string") {
      text = json.output_text;
    }

    return text;
  } catch (err) {
    // Swallow errors here and let callers fallback to rule-based recommendations
    // but log to server console for debugging.
    // eslint-disable-next-line no-console
    console.error("callGemini error:", err);
    return null;
  }
}
