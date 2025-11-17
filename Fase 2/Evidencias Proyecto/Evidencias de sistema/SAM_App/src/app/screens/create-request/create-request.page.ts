import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { paperPlaneOutline, chevronBackOutline } from 'ionicons/icons';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.page.html',
  styleUrls: ['./create-request.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateRequestPage implements OnInit {

  public pageTitle: string = 'Crear Solicitud';
  private requestType: string = 'general';

  // Variables para el formulario
  titulo: string = '';
  descripcion: string = '';

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {
    addIcons({ paperPlaneOutline, chevronBackOutline });
  }

  ngOnInit() {
    // 1. Detectamos si es Guardias, TI o Enfermería
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type) {
      this.requestType = type;
      if (type === 'guardias') this.pageTitle = 'Reportar a Seguridad';
      if (type === 'cetecom') this.pageTitle = 'Soporte TI (Cetecom)';
      if (type === 'enfermeria') this.pageTitle = 'Solicitud Enfermería';
    }
  }

  async enviarSolicitud() {
    // 2. Esto ValidA que haya datos
    if (!this.titulo || !this.descripcion) {
      this.showAlert('Faltan datos', 'Por favor completa el título y la descripción.');
      return;
    }

    const user = this.firebaseService.auth.currentUser;
    if (!user) {
      this.showAlert('Error', 'Debes iniciar sesión.');
      return;
    }

    // 3. Preparando el paquete de datos !
    const newRequest = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      type: this.requestType,
      requesterId: user.uid,
      requesterEmail: user.email,
      status: 'open',
      fecha: new Date().toISOString()
    };

    // 4. Aquí ocurre la magia del envio  a Firebase :D
    try {
      await this.firebaseService.createRequest(newRequest);
      
      // Mensaje de éxito y volver atrás
      await this.showAlert('Enviado', 'Tu solicitud ha sido recibida correctamente.');
      this.navCtrl.back(); 
      
    } catch (error: any) {
      console.error(error);
      this.showAlert('Error', 'No se pudo enviar la solicitud.');
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