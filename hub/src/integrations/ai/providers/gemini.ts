import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class GeminiProvider extends BaseProvider {
  readonly name = 'gemini';
  readonly category = 'ai' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    {
      key: 'api_key',
      label: 'Google AI API Key',
      type: 'secret',
      required: true,
      placeholder: 'AIza...',
    },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'generate',
      description: 'Generate text using Gemini models',
      params: {
        prompt:     { type: 'string',  required: true,  description: 'Input prompt' },
        model:      { type: 'string',  required: false, description: 'Model name', default: 'gemini-2.0-flash' },
        max_tokens: { type: 'number',  required: false, description: 'Max output tokens', default: 1024 },
        temperature:{ type: 'number',  required: false, description: 'Sampling temperature', default: 0.7 },
      },
    },
    {
      name: 'embed',
      description: 'Generate text embeddings using text-embedding-004',
      params: {
        input: { type: 'string', required: true, description: 'Text to embed' },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const apiKey = credentials['api_key'] as string;
    const model = (params.model as string) || 'gemini-2.0-flash';

    if (action === 'generate') {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: params.prompt }] }],
            generationConfig: {
              maxOutputTokens: (params.max_tokens as number) || 1024,
              temperature: (params.temperature as number) ?? 0.7,
            },
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(`Gemini API error: ${JSON.stringify(err)}`);
      }

      const data = await resp.json() as any;
      return {
        success: true,
        provider: this.name,
        action,
        data: {
          text: data.candidates?.[0]?.content?.parts?.[0]?.text,
          model,
          finishReason: data.candidates?.[0]?.finishReason,
          promptTokens: data.usageMetadata?.promptTokenCount,
          outputTokens: data.usageMetadata?.candidatesTokenCount,
        },
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

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(`Gemini Embed API error: ${JSON.stringify(err)}`);
      }

      const data = await resp.json() as any;
      return {
        success: true,
        provider: this.name,
        action,
        data: { embeddings: data.embedding?.values },
      };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
