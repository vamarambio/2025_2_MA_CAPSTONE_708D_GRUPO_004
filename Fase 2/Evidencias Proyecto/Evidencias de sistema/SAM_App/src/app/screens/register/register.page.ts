import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Para [(ngModel)]
import { RouterModule, Router } from '@angular/router'; // <-- Para navegar
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule] // <-- Añadimos los imports
})
export class RegisterPage {
  email = '';
  password = '';
  error: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async onRegister() {
    this.error = null;
    try {
      await this.firebaseService.register(this.email, this.password);
      this.router.navigate(['/home']); // ¡Navega a home si tuvo éxito!
    } catch (e: any) {
      this.error = e.message; // Muestra el error
    }
  }
}