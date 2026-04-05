import type {
  NirmanProvider,
  ProviderCategory,
  ProviderResult,
  CredentialField,
  ProviderAction,
} from '../types';

/**
 * BaseProvider — abstract class that all official Nirman providers extend.
 *
 * Provides:
 * - Default credential validation (checks required fields are present)
 * - Error wrapping to always return a typed ProviderResult on failure
 *
 * Usage:
 *   export class TwilioProvider extends BaseProvider { ... }
 */
export abstract class BaseProvider implements NirmanProvider {
  abstract readonly name: string;
  abstract readonly category: ProviderCategory;
  abstract readonly version: string;
  abstract readonly credentialSchema: CredentialField[];
  abstract readonly actions: ProviderAction[];

  /**
   * Default implementation: validates that all required credential fields
   * are present and non-empty. Override for custom validation logic.
   */
  validateCredentials(credentials: Record<string, unknown>): void {
    for (const field of this.credentialSchema) {
      if (field.required) {
        const value = credentials[field.key];
        if (value === undefined || value === null || value === '') {
          throw new Error(
            `[${this.name}] Missing required credential: "${field.label}" (key: "${field.key}")`
          );
        }
      }
    }
  }

  /**
   * Default execute wrapper — validates credentials and delegates to
   * subclass handle() method. Catches errors and wraps them as ProviderResult.
   */
  async execute(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    try {
      this.validateCredentials(credentials);

      const actionDef = this.actions.find((a) => a.name === action);
      if (!actionDef) {
        throw new Error(
          `[${this.name}] Unknown action: "${action}". Available: ${this.actions.map((a) => a.name).join(', ')}`
        );
      }

      return await this.handle(action, params, credentials);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        provider: this.name,
        action,
        error: message,
      };
    }
  }

  /**
   * Subclasses must implement this to handle the actual provider logic.
   * Called only after credentials have been validated and action verified.
   */
  protected abstract handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult>;
}
