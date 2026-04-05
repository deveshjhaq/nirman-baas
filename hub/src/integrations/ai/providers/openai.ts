import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class OpenAIProvider extends BaseProvider {
  readonly name = 'openai';
  readonly category = 'ai' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key', label: 'OpenAI API Key', type: 'secret', required: true, placeholder: 'sk-...' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'generate',
      description: 'Generate text using GPT models via chat completions',
      params: {
        prompt:     { type: 'string', required: false, description: 'Single user prompt (shorthand)' },
        messages:   { type: 'array',  required: false, description: 'Full messages array (overrides prompt)' },
        model:      { type: 'string', required: false, default: 'gpt-4o-mini' },
        max_tokens: { type: 'number', required: false, default: 1024 },
        temperature:{ type: 'number', required: false, default: 0.7 },
      },
    },
    {
      name: 'embed',
      description: 'Generate text embeddings via OpenAI Embeddings API',
      params: {
        input: { type: 'string', required: true },
        model: { type: 'string', required: false, default: 'text-embedding-3-small' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const apiKey = credentials['api_key'] as string;

    if (action === 'generate') {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model:       (params.model as string) || 'gpt-4o-mini',
          messages:    (params.messages as object[]) || [{ role: 'user', content: params.prompt }],
          max_tokens:  (params.max_tokens  as number) || 1024,
          temperature: (params.temperature as number) ?? 0.7,
        }),
      });
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`OpenAI: ${data.error?.message}`);
      return { success: true, provider: this.name, action, data: { text: data.choices?.[0]?.message?.content, usage: data.usage, model: data.model } };
    }

    if (action === 'embed') {
      const resp = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: (params.model as string) || 'text-embedding-3-small', input: params.input }),
      });
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`OpenAI: ${data.error?.message}`);
      return { success: true, provider: this.name, action, data: { embeddings: data.data?.[0]?.embedding, usage: data.usage } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
