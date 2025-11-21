import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
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
    private platform: Platform
  ) {}

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

    try {
      // Llama a tu backend
      await this.firebaseService.validateQrAndCreateAttendance(content, user.uid);
      this.showAlert('¡Éxito!', 'Asistencia registrada correctamente.');
    } catch (error: any) {
      this.showAlert('Error', error.message || 'No se pudo registrar.');
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