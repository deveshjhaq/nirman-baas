export interface OtpProvider {
  sendOtp(phone: string, otpLength?: number): Promise<any>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}
