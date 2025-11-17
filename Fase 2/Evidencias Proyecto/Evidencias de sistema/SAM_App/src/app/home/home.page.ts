import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RequestCardComponent } from 'src/app/components/request-card/request-card.component';
import { SalaSelectorComponent } from 'src/app/components/sala-selector/sala-selector.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { addIcons } from 'ionicons';
import { 
  qrCodeOutline, 
  calendarOutline, 
  documentTextOutline, 
  logOutOutline,
  helpBuoyOutline,      // Icono flotador
  shieldCheckmarkOutline, // Icono guardias
  desktopOutline,       // Icono cetecom
  medkitOutline,        // Icono enfermería
  chevronForwardOutline // Flechita
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
    RequestCardComponent,
    SalaSelectorComponent,
  ],
})
export class HomePage {
  
  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    // Registramos todos los iconos nuevos para el acordeón
    addIcons({ 
      qrCodeOutline, 
      calendarOutline, 
      documentTextOutline, 
      logOutOutline,
      helpBuoyOutline,
      shieldCheckmarkOutline,
      desktopOutline,
      medkitOutline,
      chevronForwardOutline
    });
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/login']);
  }
}