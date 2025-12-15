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
  doc, setDoc, addDoc, collection,
  getDocs, query, orderBy, updateDoc, getDoc
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

  // --- FUNCTIONS (QR) ---
  async validateQrAndCreateAttendance(codeValue: string, studentId: string) {
    const validateFunction = httpsCallable(this.functions, 'validateQrAndCreateAttendance');
    try {
      const result = await validateFunction({ codeValue, studentId });
      return result.data;
    } catch (error) { throw error; }
  }

  async assignRequest(requestId: string, action: 'assign' | 'start' | 'resolve', assigneeId?: string) {
    const assignFunction = httpsCallable(this.functions, 'assignRequest');
    try {
      const result = await assignFunction({ requestId, action, assigneeId });
      return result.data;
    } catch (error) { throw error; }
  }

  async createRequest(data: any) {
    try {
      // Si hay sala, buscamos al profe
      if (data.salaId) {
        const presenceRef = collection(this.db, 'class_presence');
        const q = query(presenceRef, orderBy('timestamp', 'desc')); // Trae la última
        const snapshot = await getDocs(q);

        // Filtro manual simple (idealmente usar where)
        const activeClass = snapshot.docs.find(d => d.data()['salaId'] === data.salaId);

        if (activeClass) {
          const classData = activeClass.data();
          data.teacherName = classData['teacherName'];
          data.teacherId = classData['teacherId'] || 'unknown';
          data.classId = activeClass.id;
        }
      }

      if (this.auth.currentUser) {
        data.uid = this.auth.currentUser.uid;
      }

      const requestsRef = collection(this.db, 'requests');
      return await addDoc(requestsRef, data);
    } catch (error) { throw error; }
  }

  // --- ZONA ADMIN (NUEVO) ---

  // 1. Traer todos los reportes
  async getAllRequests() {
    const requestsRef = collection(this.db, 'requests');
    try {
      // Intenta ordenar por fecha (requiere índice en Firebase)
      const q = query(requestsRef, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      // Si falla el ordenamiento, trae los datos crudos
      const querySnapshot = await getDocs(requestsRef);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }

  // 2. Cambiar estado de reporte (ej. Open -> Resolved)
  async updateRequestStatus(id: string, status: string) {
    const docRef = doc(this.db, 'requests', id);
    await updateDoc(docRef, { status: status });
  }

  // 3. Traer todos los usuarios
  async getAllUsers() {
    const usersRef = collection(this.db, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 4. Cambiar rol de usuario (ej. Student -> Admin)
  async updateUserRole(id: string, role: string) {
    const docRef = doc(this.db, 'users', id);
    await updateDoc(docRef, { role: role });
  }

  // 4b. Sincronizar Usuarios (Llamar Cloud Function)
  async syncUsers() {
    const syncFunction = httpsCallable(this.functions, 'syncAuthUsersToFirestore');
    try {
      const result = await syncFunction({});
      return result.data;
    } catch (error) { throw error; }
  }

  // 5. Utilidad Demo (Clase)
  // 5. Iniciar Clase (Profesor)
  async startClass(salaId: string, teacherName: string, teacherId: string) {
    try {
      const classRef = collection(this.db, 'class_presence');
      await addDoc(classRef, {
        salaId: salaId,
        teacherName: teacherName,
        teacherId: teacherId,
        timestamp: new Date()
      });
      return true;
    } catch (error) { return false; }
  }

  async getUserRole(uid: string) {
    const docRef = doc(this.db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data()['role'];
    return null;
  }

  // 6. Poblar Base de Datos (Seed)
  async seedDatabase() {
    try {
      // A. Clases Activas
      const classRef = collection(this.db, 'class_presence');
      await addDoc(classRef, { salaId: 'SALA-101', teacherName: 'Profesor A', timestamp: new Date() });
      await addDoc(classRef, { salaId: 'SALA-202', teacherName: 'Profesor B', timestamp: new Date() });

      // B. Usuarios Dummy (No se pueden loguear real sin Auth, pero sirven para listas)
      const usersRef = collection(this.db, 'users');
      await addDoc(usersRef, { email: 'alumno1@duoc.cl', role: 'student' });
      await addDoc(usersRef, { email: 'admin@duoc.cl', role: 'admin' });
      await addDoc(usersRef, { email: 'profe@duoc.cl', role: 'teacher' });

      // C. Reportes de Ejemplo
      const requestsRef = collection(this.db, 'requests');
      await addDoc(requestsRef, {
        titulo: 'Proyector malo',
        descripcion: 'No enciende la luz',
        type: 'cetecom',
        salaId: 'SALA-101',
        teacherName: 'Profesor A',
        status: 'open',
        fecha: new Date().toISOString(),
        requesterEmail: 'alumno1@duoc.cl'
      });
      await addDoc(requestsRef, {
        titulo: 'Alumno desmayado',
        descripcion: 'Se requiere asistencia inmediata',
        type: 'enfermeria',
        salaId: 'SALA-202',
        teacherName: 'Profesor B',
        status: 'open',
        fecha: new Date().toISOString(),
        requesterEmail: 'alumno2@duoc.cl'
      });
      await addDoc(requestsRef, {
        titulo: 'Puerta trabada',
        descripcion: 'No se puede abrir desde fuera',
        type: 'guardias',
        salaId: 'SALA-101',
        teacherName: 'Profesor A',
        status: 'resolved',
        fecha: new Date().toISOString(),
        requesterEmail: 'profe@duoc.cl'
      });

      // D. Crear Admin Real (admin@gmail.com)
      try {
        const adminCred = await createUserWithEmailAndPassword(this.auth, 'admin@gmail.com', 'duocADM');
        const adminRef = doc(this.db, 'users', adminCred.user.uid);
        await setDoc(adminRef, { email: 'admin@gmail.com', role: 'admin' });
        console.log('Admin creado: admin@gmail.com');
      } catch (e) {
        console.log('El admin ya existe o hubo un error de Auth:', e);
      }

      return true;
    } catch (error) {
      console.error('Error seeding DB:', error);
      return false;
    }
  }


  async saveToken(token: string) {
    if (this.auth.currentUser) {
      const userRef = doc(this.db, 'users', this.auth.currentUser.uid);
      await setDoc(userRef, { fcmToken: token }, { merge: true });
    }
  }
}