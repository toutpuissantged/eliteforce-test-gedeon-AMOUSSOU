import axios from 'axios';

export const sendPushNotification = async (expoPushToken: string, title: string, body: string) => {
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
        console.log('Skipping push notification: invalid or missing token');
        return;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: { timestamp: new Date().toISOString() },
    };

    try {
        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });
        console.log(`Push notification sent to ${expoPushToken}`);
    } catch (error) {
        console.error('Error sending push notification', error);
    }
};
