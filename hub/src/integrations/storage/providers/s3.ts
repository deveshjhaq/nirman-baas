import { BaseProvider } from '@nirman/provider-sdk';
import type { ProviderResult, CredentialField, ProviderAction } from '@nirman/provider-sdk';

export default class S3Provider extends BaseProvider {
  readonly name = 's3';
  readonly category = 'storage' as const;
  readonly version = '1.0.0';

  readonly credentialSchema: CredentialField[] = [
    { key: 'access_key', label: 'AWS Access Key ID',     type: 'string', required: true },
    { key: 'secret_key', label: 'AWS Secret Access Key', type: 'secret', required: true },
    { key: 'region',     label: 'AWS Region',             type: 'string', required: true,  default: 'us-east-1' },
    { key: 'bucket',     label: 'S3 Bucket Name',         type: 'string', required: true },
  ];

  readonly actions: ProviderAction[] = [
    {
      name: 'signed_url',
      description: 'Generate a pre-signed upload URL for a file',
      params: {
        key:          { type: 'string', required: true,  description: 'Object key / file path in bucket' },
        content_type: { type: 'string', required: false, description: 'MIME type', default: 'application/octet-stream' },
        expires_in:   { type: 'number', required: false, description: 'URL expiry in seconds', default: 3600 },
      },
    },
    {
      name: 'download',
      description: 'Get a download URL for an object',
      params: {
        key: { type: 'string', required: true, description: 'Object key / file path in bucket' },
      },
    },
    {
      name: 'delete',
      description: 'Delete an object from S3',
      params: {
        key: { type: 'string', required: true },
      },
    },
  ];

  protected async handle(
    action: string,
    params: Record<string, unknown>,
    credentials: Record<string, unknown>
  ): Promise<ProviderResult> {
    const bucket = credentials['bucket'] as string;
    const region = (credentials['region'] as string) || 'us-east-1';
    const key    = params.key as string;

    /**
     * Production implementation should use @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner.
     * Stubbed here with correct return shapes — replace with real SDK calls.
     *
     * Example:
     *   import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
     *   import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
     *   const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
     *   const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 });
     */

    if (action === 'signed_url') {
      const stubUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}?X-Amz-Signature=stub&X-Amz-Expires=${params.expires_in || 3600}`;
      return { success: true, provider: this.name, action, data: { url: stubUrl, key, bucket, region }, meta: { note: 'Production: use @aws-sdk/s3-request-presigner' } };
    }

    if (action === 'download') {
      const url = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
      return { success: true, provider: this.name, action, data: { url, key } };
    }

    if (action === 'delete') {
      return { success: true, provider: this.name, action, data: { deleted: key }, meta: { note: 'Production: call DeleteObjectCommand via @aws-sdk/client-s3' } };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}
