import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // <-- 1. Importa IonicModule

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
  standalone: true, // <-- 2. Asegúrate de que sea 'standalone'
  imports: [IonicModule], // <-- 3. Importa IonicModule aquí
})
export class RequestCardComponent {
  @Input() title: string = 'Título por defecto';
  @Input() description: string = 'Descripción por defecto';
}