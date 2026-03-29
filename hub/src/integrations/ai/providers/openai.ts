import type { IntegrationProvider } from '../../registry/providers';

export const OpenAIProvider: IntegrationProvider = {
  name: 'openai',
  category: 'ai',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const apiKey = credentials['api_key'];
    if (!apiKey) throw new Error('OpenAI API key not configured');

    if (action === 'generate') {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: params.model || 'gpt-4o-mini',
          messages: params.messages || [{ role: 'user', content: params.prompt }],
          max_tokens: params.max_tokens || 1024,
          temperature: params.temperature ?? 0.7,
        }),
      });
      const data = await resp.json();
      return {
        success: true,
        text: data.choices?.[0]?.message?.content,
        usage: data.usage,
        model: data.model,
      };
    }

    if (action === 'embed') {
      const resp = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: params.model || 'text-embedding-3-small',
          input: params.input,
        }),
      });
      const data = await resp.json();
      return { success: true, embeddings: data.data?.[0]?.embedding, usage: data.usage };
    }

    throw new Error(`Unknown action: ${action}`);
  },
};
