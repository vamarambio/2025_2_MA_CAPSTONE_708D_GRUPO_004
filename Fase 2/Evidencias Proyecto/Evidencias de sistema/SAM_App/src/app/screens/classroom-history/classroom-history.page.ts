import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-classroom-history',
  templateUrl: './classroom-history.page.html',
  styleUrls: ['./classroom-history.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ClassroomHistoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
