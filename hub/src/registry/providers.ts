import { getProviderCredentials } from '../vault/credentials.ts';

// Dynamic import strategy for scaling providers
const providerMap: Record<string, any> = {
  // OTP
  twilio: () => import('../integrations/otp/providers/twilio.ts'),
  msg91: () => import('../integrations/otp/providers/msg91.ts'),
  
  // Email
  sendgrid: () => import('../integrations/email/providers/sendgrid.ts'),
  resend: () => import('../integrations/email/providers/resend.ts'),
  
  // Maps
  google_maps: () => import('../integrations/maps/providers/googlemaps.ts'),
  
  // Notifications
  firebase: () => import('../integrations/notifications/providers/fcm.ts'),
  
  // Storage
  s3: () => import('../integrations/storage/providers/s3.ts'),
};

export async function getProviderAdapter(projectId: string, category: string, forceProvider?: string) {
  // 1. Fetch credentials from Vault
  const { providerName, credentials, config } = await getProviderCredentials(projectId, category, forceProvider);
  
  // 2. Load the adapter class dynamically
  const loader = providerMap[providerName];
  if (!loader) {
    throw new Error(`Provider adapter '${providerName}' not implemented in registry.`);
  }

  const module = await loader();
  const AdapterClass = module.default;

  // 3. Instantiate securely
  return new AdapterClass(credentials, config);
}
