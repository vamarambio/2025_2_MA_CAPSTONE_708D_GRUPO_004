// frontend/src/app/screens/qr-scan/qr-scan.page.ts

import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// 1. Importa tu servicio
import { FirebaseService } from 'src/app/services/firebase.service';

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
    private alertController: AlertController
  ) {}

  // --- ESTA ES LA FUNCIÓN ACTUALIZADA ---
  async testScanFunction() {
    console.log('Simulando escaneo...');

    // 1. OBTÉN EL USUARIO REAL que inició sesión
    const user = this.firebaseService.auth.currentUser;
    
    // 2. Verifica que el usuario exista
    if (!user) {
      this.showAlert('Error', 'No se encontró el usuario. Intenta iniciar sesión de nuevo.');
      return; // Detiene la función si no hay usuario
    }

    // 3. USA EL ID REAL (user.uid) en lugar de 'studentId_quemado'
    const studentId = user.uid; 
    
    try {
      // 4. Llama a la Cloud Function con el ID real
      const result = await this.firebaseService.validateQrAndCreateAttendance(
        'MAIPU-P1-L104',
        studentId // <-- ¡YA NO ESTÁ QUEMADO!
      );

      console.log('¡Asistencia registrada!', result);
      this.showAlert('Éxito', 'Asistencia registrada correctamente.');

    } catch (error: any) {
      console.error('Error al registrar asistencia:', error);
      this.showAlert(
        'Error',
        error.message || 'No se pudo registrar la asistencia.'
      );
    }
  }

  // Función para mostrar pop-ups
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}