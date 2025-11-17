import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RequestCardComponent } from 'src/app/components/request-card/request-card.component';
import { SalaSelectorComponent } from 'src/app/components/sala-selector/sala-selector.component';
import { FirebaseService } from 'src/app/services/firebase.service';

// 1. Importamos la función para registrar íconos
import { addIcons } from 'ionicons';

// 2. Importamos los íconos específicos que usamos en el HTML
import { 
  qrCodeOutline, 
  timeOutline, 
  documentTextOutline, 
  logOutOutline,
  alertCircleOutline, 
  shieldCheckmarkOutline, 
  laptopOutline, 
  medkitOutline,
  chevronForwardOutline 
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
    // 3. Registramos los íconos para que Ionic los reconozca
    addIcons({ 
      qrCodeOutline, 
      timeOutline, 
      documentTextOutline, 
      logOutOutline,
      alertCircleOutline,
      shieldCheckmarkOutline,
      laptopOutline,
      medkitOutline,
      chevronForwardOutline
    });
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/login']);
  }
}