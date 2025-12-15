import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';


import { FirebaseService } from 'src/app/services/firebase.service';
import { PushService } from 'src/app/services/push.service';
import { addIcons } from 'ionicons';
import {
  qrCodeOutline,
  timeOutline,
  documentTextOutline,
  logOutOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  laptopOutline,
  medkitOutline,
  chevronForwardOutline,
  constructOutline,
  settingsOutline,
  barChartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,


  ],
})
export class HomePage {

  isAdmin = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private alertController: AlertController,
    private pushService: PushService
  ) {
    this.pushService.init();
    addIcons({
      qrCodeOutline,
      timeOutline,
      documentTextOutline,
      logOutOutline,
      alertCircleOutline,
      shieldCheckmarkOutline,
      laptopOutline,
      medkitOutline,
      chevronForwardOutline,
      constructOutline,
      settingsOutline,
      barChartOutline
    });

    this.checkRole();
  }

  async checkRole() {
    const user = this.firebaseService.auth.currentUser;
    if (user) {
      const role = await this.firebaseService.getUserRole(user.uid);
      if (role === 'admin') this.isAdmin = true;
    }
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/login']);
  }

  // --- LÓGICA DEMO ---
  async iniciarClaseDemo() {
    const confirm = await this.alertController.create({
      header: 'Modo Profesor',
      message: 'Ingresa el ID de la Sala para iniciar la clase:',
      inputs: [
        {
          name: 'salaId',
          type: 'text',
          placeholder: 'Ej: SALA-001'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Iniciar',
          handler: async (data) => {
            if (!data.salaId) return;
            // Usamos el usuario actual
            const user = this.firebaseService.auth.currentUser;
            const teacherName = user?.email || 'Profesor';
            const teacherId = user?.uid || 'unknown';

            const exito = await this.firebaseService.startClass(data.salaId, teacherName, teacherId);
            const toast = await this.alertController.create({
              header: exito ? 'Clase Iniciada' : 'Error',
              message: exito ? `El QR "${data.salaId}" ahora es válido por 90 min.` : 'No se pudo iniciar.',
              buttons: ['OK']
            });
            await toast.present();
          }
        }
      ]
    });
    await confirm.present();
  }
}