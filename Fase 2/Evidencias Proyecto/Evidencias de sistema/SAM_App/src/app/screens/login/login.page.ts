import { Component } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage {
  email = '';
  password = '';
  error: string | null = null;

  title = 'Bienvenido';
  subtitle = 'Ingresa a tu cuenta Duoc Assist';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private platform: Platform
  ) {
    this.checkPlatform();
  }

  checkPlatform() {
    if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
      this.title = 'Bienvenido al Dashboard Complementario de DuocAssist';
      this.subtitle = 'Gestión y Administración';
    }
  }

  async onLogin() {
    this.error = null;
    try {
      await this.firebaseService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (e: any) {
      this.error = e.message;
    }
  }
}