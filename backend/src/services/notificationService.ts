import axios from 'axios';

export class NotificationService {
  static async sendPushNotification(expoPushToken: string, title: string, body: string, data: any = {}) {
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
      console.log('⚠️ [NotificationService]: Skipping - invalid or missing token');
      return;
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: { 
        ...data,
        timestamp: new Date().toISOString() 
      },
    };

    try {
      await axios.post('https://exp.host/--/api/v2/push/send', message, {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
      console.log(`✅ [NotificationService]: Sent to ${expoPushToken}`);
    } catch (error: any) {
      console.error('❌ [NotificationService]: Error', error.message);
    }
  }
}
