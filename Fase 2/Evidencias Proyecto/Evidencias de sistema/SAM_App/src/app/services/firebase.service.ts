import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth, Auth, connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore, Firestore, connectFirestoreEmulator,
  doc, setDoc,
  addDoc, collection 
} from 'firebase/firestore';
import {
  getFunctions, Functions, httpsCallable, connectFunctionsEmulator
} from 'firebase/functions';
import {
  getMessaging, Messaging
} from 'firebase/messaging';
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

  // --- Credenciales Firebase ---
  private firebaseConfig = {
    apiKey: "AIzaSyCIavBllgIg_GFuMIKp7OqDHfatb4LFON4",
    authDomain: "duoc-assist.firebaseapp.com",
    databaseURL: "https://duoc-assist-default-rtdb.firebaseio.com",
    projectId: "duoc-assist",
    storageBucket: "duoc-assist.firebasestorage.app",
    messagingSenderId: "279076384279",
    appId: "1:279076384279:web:82af1f8bab8fa4ce2fb652"
  };

  constructor() {
    this.app = initializeApp(this.firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.functions = getFunctions(this.app);
    this.messaging = getMessaging(this.app);

    // IMPORTANTE: RECORDAR QUE HAY QUE MANTENER ESTO COMENTADO PARA LA DEMOSTRACIÓN EN LA NUBE
    if (!environment.production) {
      // console.log('Conectando a Emuladores Locales...');
      // connectAuthEmulator(this.auth, 'http://localhost:9099');
      // connectFirestoreEmulator(this.db, 'localhost', 8081); 
      // connectFunctionsEmulator(this.functions, 'localhost', 5001);
    }
  }

  // --- AUTH ---
  async register(email: string, pass: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const user = userCredential.user;
      const userDocRef = doc(this.db, 'users', user.uid);
      await setDoc(userDocRef, { email: user.email, role: 'student' });
      return userCredential;
    } catch (error) { throw error; }
  }

  async login(email: string, pass: string) {
    try { return await signInWithEmailAndPassword(this.auth, email, pass); } 
    catch (error) { throw error; }
  }

  async logout() { await signOut(this.auth); }

  // --- FUNCTIONS ---
  async validateQrAndCreateAttendance(codeValue: string, studentId: string) {
    const validateFunction = httpsCallable(this.functions, 'validateQrAndCreateAttendance');
    try {
      const result = await validateFunction({ codeValue, studentId });
      return result.data;
    } catch (error) { throw error; }
  }

  async assignRequest(requestId: string, action: 'assign' | 'start' | 'resolve') {
    const assignFunction = httpsCallable(this.functions, 'assignRequest');
    try {
      const result = await assignFunction({ requestId, action });
      return result.data;
    } catch (error) { throw error; }
  }

  // --- ¡NUEVA FUNCIÓN PARA GUARDAR EN FIRESTORE! ---
  async createRequest(data: any) {
    try {
      const requestsRef = collection(this.db, 'requests');
      return await addDoc(requestsRef, data);
    } catch (error) {
      throw error;
    }
  }
}