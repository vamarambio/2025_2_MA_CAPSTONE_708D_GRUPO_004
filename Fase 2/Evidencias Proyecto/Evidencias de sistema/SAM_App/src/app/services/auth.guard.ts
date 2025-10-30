// frontend/src/app/services/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Revisa si hay un usuario logueado en este momento
    if (this.firebaseService.auth.currentUser) {
      return true; // Hay usuario, déjalo pasar a la página
    } else {
      // No hay usuario, redirígelo al login
      this.router.navigate(['/login']);
      return false;
    }
  }
}