import type { IntegrationProvider } from '../../registry/providers';

export const ClaudeProvider: IntegrationProvider = {
  name: 'claude',
  category: 'ai',

  async execute(action: string, params: Record<string, any>, credentials: Record<string, any>) {
    const apiKey = credentials['api_key'];
    if (!apiKey) throw new Error('Anthropic API key not configured');

    if (action === 'generate') {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: params.model || 'claude-sonnet-4-20250514',
          max_tokens: params.max_tokens || 1024,
          messages: params.messages || [{ role: 'user', content: params.prompt }],
        }),
      });
      const data = await resp.json();
      return {
        success: true,
        text: data.content?.[0]?.text,
        model: data.model,
        usage: data.usage,
      };
    }

    throw new Error(`Claude does not natively support embeddings. Use action 'generate' only.`);
  },
};
