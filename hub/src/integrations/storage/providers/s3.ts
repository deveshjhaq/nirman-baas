export interface StorageProvider {
  getPresignedUrl(fileName: string, contentType: string): Promise<string>;
}

export default class S3Provider implements StorageProvider {
  private accessKey: string;
  private secretKey: string;
  private bucket: string;
  private region: string;

  constructor(credentials: any, config: any) {
    this.accessKey = credentials.access_key_id;
    this.secretKey = credentials.secret_access_key;
    this.bucket = config.bucket_name || credentials.bucket_name;
    this.region = config.region || credentials.region || 'us-east-1';

    if (!this.accessKey || !this.secretKey || !this.bucket) {
      throw new Error("S3 credentials missing.");
    }
  }

  async getPresignedUrl(fileName: string, contentType: string): Promise<string> {
    // A real implementation would use the @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
    // For this boilerplate, returning a stubbed URL.
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}?X-Amz-Signature=stub`;
  }
}
