/**
 * Core types for the Nirman Provider SDK.
 * Every plug-and-play provider must conform to these contracts.
 */

// ─── Provider Categories ───────────────────────────────────────────────────

export type ProviderCategory =
  | 'otp'
  | 'email'
  | 'maps'
  | 'notifications'
  | 'storage'
  | 'payments'
  | 'ai'
  | 'sms';

// ─── Credential Field Definition ───────────────────────────────────────────

export type CredentialFieldType = 'string' | 'secret' | 'select' | 'boolean';

export interface CredentialField {
  /** Internal key used when storing/retrieving, e.g. "api_key" */
  key: string;
  /** Human-readable label shown in the Dashboard */
  label: string;
  /** Field data type */
  type: CredentialFieldType;
  /** Whether this field is required */
  required: boolean;
  /** Shown as placeholder in Dashboard forms */
  placeholder?: string;
  /** Allowed values when type is 'select' */
  options?: string[];
  /** Default value */
  default?: string | boolean;
}

// ─── Provider Action Definition ────────────────────────────────────────────

export interface ProviderAction {
  /** Action identifier, e.g. "send", "verify", "generate" */
  name: string;
  /** Human-readable description */
  description: string;
  /** JSON Schema–style param definitions */
  params: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    description?: string;
    default?: unknown;
  }>;
}

// ─── Execution Result ──────────────────────────────────────────────────────

export interface ProviderResult {
  success: boolean;
  provider: string;
  action: string;
  data?: Record<string, unknown>;
  error?: string;
  meta?: Record<string, unknown>;
}

// ─── Core Provider Interface ───────────────────────────────────────────────

export interface NirmanProvider {
  /** Unique provider identifier, e.g. "twilio", "sendgrid", "gemini" */
  readonly name: string;
  /** Which integration category this provider belongs to */
  readonly category: ProviderCategory;
  /** Version of the provider implementation */
  readonly version: string;
  /** Credential fields required by this provider */
  readonly credentialSchema: CredentialField[];
  /** Actions this provider exposes */
  readonly actions: ProviderAction[];

  /**
   * Validate credentials before storing them.
   * Should throw a descriptive error if invalid.
   */
  validateCredentials(credentials: Record<string, unknown>): void | Promise<void>;

  /**
   * Execute a provider action.
   * @param action - action name (must be in this.actions)
   * @param params - action params
   * @param credentials - decrypted credentials from vault
   */
  execute(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult>;
}

// ─── Registry Entry (used in nirman-registry) ─────────────────────────────

export interface RegistryEntry {
  name: string;
  displayName: string;
  category: ProviderCategory;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  logoUrl?: string;
  credentialSchema: CredentialField[];
  actions: ProviderAction[];
  /** Is this an official Nirman provider? */
  official: boolean;
}
