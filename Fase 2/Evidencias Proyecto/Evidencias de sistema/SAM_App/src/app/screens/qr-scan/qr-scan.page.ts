import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, Platform, NavController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { BarcodeScanner, BarcodeFormat, LensFacing } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.page.html',
  styleUrls: ['./qr-scan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class QrScanPage {

  constructor(
    private firebaseService: FirebaseService,
    private alertController: AlertController,
    private platform: Platform,
    private navCtrl: NavController
  ) { }

  async startScan() {
    // 1. Solo funciona en celular
    if (!this.platform.is('capacitor')) {
      this.showAlert('Error', 'Usa un celular real para escanear.');
      return;
    }

    try {
      // 2. Pedir Permiso
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        this.showAlert('Permiso', 'Se necesita cámara para escanear.');
        return;
      }

      // 3. Iniciar Escáner (Abre la cámara nativa de Google)
      // Esto pausará la app hasta que escanee algo
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      // 4. Procesar Resultado
      if (barcodes.length > 0) {
        const scannedContent = barcodes[0].rawValue;
        this.processQrCode(scannedContent);
      }

    } catch (error: any) {
      // Si el usuario cancela con "Atrás"
      console.log('Escaneo cancelado o fallido', error);
    }
  }

  async processQrCode(content: string) {
    const user = this.firebaseService.auth.currentUser;
    if (!user) {
      this.showAlert('Error', 'No estás logueado.');
      return;
    }

    // Obtener rol del usuario
    const role = await this.firebaseService.getUserRole(user.uid);
    const buttons = [];

    // Opción común: Reportar
    buttons.push({
      text: 'Reportar Problema',
      handler: () => {
        this.navCtrl.navigateForward(['/create-request'], { queryParams: { salaId: content } });
      }
    });

    // Opción diferenciada por Rol
    if (role === 'teacher' || role === 'admin') {
      buttons.push({
        text: 'Iniciar Clase (Profesor)',
        handler: async () => {
          await this.startClass(content, user);
        }
      });
    }



    // Preguntar al usuario qué desea hacer
    const alert = await this.alertController.create({
      header: 'Código QR Detectado',
      message: `Sala: ${content}\n¿Qué deseas hacer?`,
      buttons: buttons
    });
    await alert.present();
  }

  async startClass(salaId: string, user: any) {
    const loading = await this.alertController.create({ header: 'Iniciando Clase...', message: 'Asignando sala a tu nombre.' });
    await loading.present();

    // Usamos el email o algo legible como nombre por ahora
    const teacherName = user.email.split('@')[0];
    const success = await this.firebaseService.startClass(salaId, teacherName, user.uid);

    loading.dismiss();
    if (success) {
      this.showAlert('Clase Iniciada', `Has tomado control de la sala ${salaId}.`);
    } else {
      this.showAlert('Error', 'No se pudo iniciar la clase.');
    }
  }



  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}