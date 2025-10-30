// frontend/src/app/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth, Auth, connectAuthEmulator,
  createUserWithEmailAndPassword, // <-- NUEVO
  signInWithEmailAndPassword,     // <-- NUEVO
  signOut                         // <-- NUEVO
} from 'firebase/auth';
import {
  getFirestore, Firestore, connectFirestoreEmulator,
  doc, setDoc                  // <-- NUEVO (para guardar el rol)
} from 'firebase/firestore';
import { getFunctions, Functions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getMessaging, Messaging } from 'firebase/messaging';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
  messaging: Messaging;

  // ... credenciales de Firebase...
  private firebaseConfig = {
    apiKey: "TAIzaSyCIavBllgIg_GFuMIKp7OqDHfatb4LFON4",
    authDomain: "duoc-assist.firebaseapp.com",
    projectId: "duoc-assist",
    storageBucket: "duoc-assist.firebasestorage.app",
    messagingSenderId: "279076384279",
    appId: ":279076384279:web:82af1f8bab8fa4ce2fb652"
  };

  constructor() {
    this.app = initializeApp(this.firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.functions = getFunctions(this.app);
    this.messaging = getMessaging(this.app);

    if (!environment.production) {
      console.log('Conectando a Emuladores Locales...');
      connectAuthEmulator(this.auth, 'http://localhost:9099');
      connectFirestoreEmulator(this.db, 'localhost', 8081);
      connectFunctionsEmulator(this.functions, 'localhost', 5001);
    }
  }

  // --- FUNCIONES DE AUTH (NUEVAS) ---

  async register(email: string, pass: string) {
    try {
      // 1. Crea el usuario en "Authentication"
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const user = userCredential.user;

      // 2. CREA SU PERFIL EN FIRESTORE (¡Importante!)
      // La Cloud Function necesita esto para saber que es un 'student'
      const userDocRef = doc(this.db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        role: 'student' // <-- ¡Rol clave!
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, pass: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, pass);
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  // --- FUNCIONES DE CLOUD FUNCTIONS  ---

  async validateQrAndCreateAttendance(codeValue: string, studentId: string) {
    // ... (el código de esta función no cambia)
    const validateFunction = httpsCallable(this.functions, 'validateQrAndCreateAttendance');
    try {
      const result = await validateFunction({ codeValue, studentId });
      return result.data;
    } catch (error) {
      console.error('Error en validateQrAndCreateAttendance:', error);
      throw error;
    }
  }

  async assignRequest(requestId: string, action: 'assign' | 'start' | 'resolve') {
    // ... (el código de esta función no cambia)
    const assignFunction = httpsCallable(this.functions, 'assignRequest');
    try {
      const result = await assignFunction({ requestId, action });
      return result.data;
    } catch (error) {
      console.error('Error en assignRequest:', error);
      throw error;
    }
  }
}