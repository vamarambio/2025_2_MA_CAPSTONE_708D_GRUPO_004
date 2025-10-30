// frontend/src/app/screens/home/home.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 1. Importa Router
import { RequestCardComponent } from 'src/app/components/request-card/request-card.component';
import { SalaSelectorComponent } from 'src/app/components/sala-selector/sala-selector.component';
import { FirebaseService } from 'src/app/services/firebase.service'; // 2. Importa Firebase

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    RequestCardComponent,
    SalaSelectorComponent,
  ],
})
export class HomePage {
  
  // 3. Pide Firebase y Router en el constructor
  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  // 4. Esta es la función para el botón
  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/login']); // Redirige a login
  }
}