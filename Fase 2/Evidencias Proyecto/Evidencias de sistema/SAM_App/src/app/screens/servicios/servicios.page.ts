import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, desktopOutline, medkitOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ServiciosPage {
  constructor() {
    addIcons({ shieldCheckmarkOutline, desktopOutline, medkitOutline, chevronForwardOutline });
  }
}