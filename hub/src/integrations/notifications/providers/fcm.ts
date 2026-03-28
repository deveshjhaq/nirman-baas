export interface NotificationProvider {
  sendPush(token: string, title: string, body: string, data?: any): Promise<any>;
}

export default class FCMProvider implements NotificationProvider {
  private serverKey: string;

  constructor(credentials: any, config: any) {
    this.serverKey = credentials.server_key; // Assuming legacy HTTP API or structured key for v1
    if (!this.serverKey) {
      throw new Error("FCM credentials missing. Requires 'server_key'.");
    }
  }

  async sendPush(token: string, title: string, body: string, data?: any): Promise<any> {
    // Note: In a production setting, this should use Firebase Admin SDK or HTTP v1 API
    // This uses the legacy HTTP API for demonstration simplicity
    const payload = {
      to: token,
      notification: { title, body },
      data: data || {}
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${this.serverKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    if (!response.ok || resData.failure > 0) {
      throw new Error(`FCM Error: ${resData.results?.[0]?.error || 'Unknown error'}`);
    }

    return { success: true, provider: 'firebase', response: resData };
  }
}
