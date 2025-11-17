// frontend/src/app/screens/register/register.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { addIcons } from 'ionicons'; // Importamos el registrador de íconos
import { mailOutline, lockClosedOutline } from 'ionicons/icons'; // Importamos los íconos específicos

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class RegisterPage {
  email = '';
  password = '';
  error: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    // Registramos los íconos para que se vean en el HTML
    addIcons({ mailOutline, lockClosedOutline });
  }

  async onRegister() {
    this.error = null;
    try {
      await this.firebaseService.register(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (e: any) {
      this.error = e.message;
    }
  }
}