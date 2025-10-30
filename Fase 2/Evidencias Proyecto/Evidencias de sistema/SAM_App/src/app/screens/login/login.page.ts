import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Para [(ngModel)]
import { RouterModule, Router } from '@angular/router'; // <-- Para navegar
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule] // <-- Añadimos los imports
})
export class LoginPage {
  email = '';
  password = '';
  error: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async onLogin() {
    this.error = null;
    try {
      await this.firebaseService.login(this.email, this.password);
      this.router.navigate(['/home']); // ¡Navega a home si tuvo éxito!
    } catch (e: any) {
      this.error = e.message; // Muestra el error
    }
  }
}