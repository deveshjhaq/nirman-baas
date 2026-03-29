import type { IntegrationProvider } from '../../registry/providers';

export const GeminiProvider: IntegrationProvider = {
  name: 'gemini',
  category: 'ai',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const apiKey = credentials['api_key'];
    if (!apiKey) throw new Error('Google Gemini API key not configured');

    const model = params.model || 'gemini-2.0-flash';

    if (action === 'generate') {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: params.prompt }] }],
            generationConfig: {
              maxOutputTokens: params.max_tokens || 1024,
              temperature: params.temperature ?? 0.7,
            },
          }),
        }
      );
      const data = await resp.json();
      return {
        success: true,
        text: data.candidates?.[0]?.content?.parts?.[0]?.text,
        model,
      };
    }

    if (action === 'embed') {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text: params.input }] },
          }),
        }
      );
      const data = await resp.json();
      return { success: true, embeddings: data.embedding?.values };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
