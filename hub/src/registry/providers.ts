import type { NirmanProvider, ProviderCategory } from '@nirman/provider-sdk';
import { getProviderCredentials } from '../vault/credentials';

/**
 * Nirman Provider Registry
 *
 * Maps provider names to lazy-loaded NirmanProvider implementations.
 * All providers must implement the NirmanProvider interface from @nirman/provider-sdk.
 */
const providerLoaders: Record<string, () => Promise<{ default: new () => NirmanProvider }>> = {
  // ── OTP ───────────────────────────────────────────────────────────────
  twilio:       () => import('../integrations/otp/providers/twilio'),
  msg91:        () => import('../integrations/otp/providers/msg91'),
  twofactor:    () => import('../integrations/otp/providers/twofactor'),

  // ── Email ─────────────────────────────────────────────────────────────
  sendgrid:     () => import('../integrations/email/providers/sendgrid'),
  resend:       () => import('../integrations/email/providers/resend'),
  ses:          () => import('../integrations/email/providers/ses'),

  // ── Maps ─────────────────────────────────────────────────────────────
  google_maps:  () => import('../integrations/maps/providers/googlemaps'),
  mapbox:       () => import('../integrations/maps/providers/mapbox'),
  ola:          () => import('../integrations/maps/providers/ola'),

  // ── Notifications ─────────────────────────────────────────────────────
  fcm:          () => import('../integrations/notifications/providers/fcm'),
  apns:         () => import('../integrations/notifications/providers/apns'),
  onesignal:    () => import('../integrations/notifications/providers/onesignal'),

  // ── Payments ──────────────────────────────────────────────────────────
  razorpay:     () => import('../integrations/payments/providers/razorpay'),
  stripe:       () => import('../integrations/payments/providers/stripe'),
  payu:         () => import('../integrations/payments/providers/payu'),

  // ── AI ────────────────────────────────────────────────────────────────
  openai:       () => import('../integrations/ai/providers/openai'),
  gemini:       () => import('../integrations/ai/providers/gemini'),
  claude:       () => import('../integrations/ai/providers/claude'),

  // ── Storage ───────────────────────────────────────────────────────────
  s3:           () => import('../integrations/storage/providers/s3'),
};

/** In-memory cache of instantiated providers (per provider name) */
const instanceCache = new Map<string, NirmanProvider>();

/**
 * Load and return a cached NirmanProvider instance by name.
 */
export async function loadProvider(providerName: string): Promise<NirmanProvider> {
  if (instanceCache.has(providerName)) {
    return instanceCache.get(providerName)!;
  }

  const loader = providerLoaders[providerName];
  if (!loader) {
    const available = Object.keys(providerLoaders).join(', ');
    throw new Error(
      `Provider "${providerName}" is not registered. Available providers: ${available}`
    );
  }

  const mod = await loader();
  const instance = new mod.default();
  instanceCache.set(providerName, instance);
  return instance;
}

/**
 * Resolve credentials + provider for a given project and category,
 * then return both provider instance and credentials.
 */
export async function getProviderAdapter(
  projectId: string,
  category: ProviderCategory,
  forceProvider?: string
): Promise<{ provider: NirmanProvider; credentials: any }> {
  const { providerName, credentials } = await getProviderCredentials(
    projectId,
    category,
    forceProvider
  );

  const provider = await loadProvider(providerName);

  // Validate credentials eagerly so errors surface immediately
  await provider.validateCredentials(credentials);

  return { provider, credentials };
}

/**
 * List all registered provider names.
 */
export function listProviders(): string[] {
  return Object.keys(providerLoaders);
}

/**
 * List all providers for a given category (loads metadata only).
 */
export async function listProvidersByCategory(
  category: ProviderCategory
): Promise<NirmanProvider[]> {
  const results: NirmanProvider[] = [];
  for (const name of Object.keys(providerLoaders)) {
    const provider = await loadProvider(name);
    if (provider.category === category) {
      results.push(provider);
    }
  }
  return results;
}
