import { Component } from '@angular/core';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FirebaseService } from 'src/app/services/firebase.service';

// 1. Importamos el nuevo plugin y sus tipos
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.page.html',
  styleUrls: ['./qr-scan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class QrScanPage {
  
  constructor(
    private firebaseService: FirebaseService,
    private alertController: AlertController,
    private platform: Platform
  ) {}

  async startScan() {
    // Verificar si es móvil
    if (!this.platform.is('capacitor')) {
      this.showAlert('Error', 'El escáner solo funciona en el teléfono.');
      return;
    }

    try {
      // 1. Pedir Permisos (El plugin lo maneja)
      const granted = await this.requestPermissions();
      if (!granted) {
        this.showAlert('Permiso denegado', 'Se necesita cámara para escanear.');
        return;
      }

      // 2. Iniciar el Escáner (Esto abre la cámara nativa automáticamente)
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode], // Solo buscamos QRs
      });

      // 3. Si leyó algo...
      if (barcodes.length > 0) {
        const scannedValue = barcodes[0].rawValue;
        this.processQrCode(scannedValue);
      }

    } catch (error: any) {
      // Si el usuario cancela el escaneo, suele tirar error, lo manejamos suave
      console.log('Error de escaneo:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async processQrCode(content: string) {
    console.log('QR Leído:', content);

    const user = this.firebaseService.auth.currentUser;
    if (!user) {
      this.showAlert('Error', 'No hay usuario autenticado.');
      return;
    }

    try {
      const result = await this.firebaseService.validateQrAndCreateAttendance(
        content,
        user.uid
      );
      this.showAlert('¡Éxito!', `Asistencia registrada en sala: ${content}`);
    } catch (error: any) {
      this.showAlert('Error', error.message || 'Error al registrar asistencia.');
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