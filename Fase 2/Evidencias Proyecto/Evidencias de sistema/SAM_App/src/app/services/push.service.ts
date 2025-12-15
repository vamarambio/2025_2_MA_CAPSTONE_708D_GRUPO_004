
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseService } from './firebase.service';

@Injectable({
    providedIn: 'root'
})
export class PushService {

    constructor(private firebaseService: FirebaseService) { }

    async init() {
        if (Capacitor.getPlatform() !== 'web') {
            await this.registerPush();
        }
    }

    private async registerPush() {
        try {
            // 1. Request Permissions
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.error('User denied permissions!');
                return;
            }

            // 2. Register with Apple / Google to get token 'push_notification'
            await PushNotifications.register();

            // 3. Listeners
            this.addListeners();

        } catch (e) {
            console.error('Error registering push', e);
        }
    }

    private addListeners() {
        // On registration success
        PushNotifications.addListener('registration', (token) => {
            console.log('Push Registration success, token: ' + token.value);
            // Save token to Firebase User Profile
            this.firebaseService.saveToken(token.value);
        });

        // On registration error
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // On notification received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received: ', notification);
            // You can show a local notification or alert here if needed
            // For now we rely on system notification
        });

        // On notification action performed (tapped)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push action performed: ', notification);
            // Navigate to specific screen if needed
        });
    }
}
