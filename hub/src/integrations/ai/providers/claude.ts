import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class ClaudeProvider extends BaseProvider {
  readonly name = 'claude';
  readonly category = 'ai' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'api_key', label: 'Anthropic API Key', type: 'secret', required: true, placeholder: 'sk-ant-...' },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'generate',
      description: 'Generate text using Claude models',
      params: {
        prompt:     { type: 'string', required: false, description: 'Single user prompt (shorthand)' },
        messages:   { type: 'array',  required: false, description: 'Full messages array (overrides prompt)' },
        model:      { type: 'string', required: false, default: 'claude-sonnet-4-20250514' },
        max_tokens: { type: 'number', required: false, default: 1024 },
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
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      (params.model as string) || 'claude-sonnet-4-20250514',
          max_tokens: (params.max_tokens as number) || 1024,
          messages:   (params.messages as object[]) || [{ role: 'user', content: params.prompt }],
        }),
      });
      const data = await resp.json() as any;
      if (!resp.ok) throw new Error(`Claude: ${data.error?.message}`);
      return { success: true, provider: this.name, action, data: { text: data.content?.[0]?.text, model: data.model, usage: data.usage } };
    }

    throw new Error(`Claude does not support embeddings. Use action "generate" only.`);
  }
}
