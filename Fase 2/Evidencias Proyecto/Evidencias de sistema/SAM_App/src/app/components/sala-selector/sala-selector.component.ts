import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // <-- 1. Importa IonicModule
import { FormsModule } from '@angular/forms'; // <-- 2. Importa FormsModule

@Component({
  selector: 'app-sala-selector',
  templateUrl: './sala-selector.component.html',
  styleUrls: ['./sala-selector.component.scss'],
  standalone: true, // <-- 3. Asegúrate de que sea 'standalone'
  imports: [IonicModule, FormsModule], // <-- 4. Añade ambos aquí
})
export class SalaSelectorComponent {}