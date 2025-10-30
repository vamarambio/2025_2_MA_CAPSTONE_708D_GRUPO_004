// backend/functions/src/index.ts

import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function para validar QR y registrar asistencia (SINTAXIS V2)
 */
export const validateQrAndCreateAttendance = https.onCall(async (request) => {
  
  // --- ¡ESTE ES EL CAMBIO DEL PASO 5.9! ---
  // El "guardia" está ACTIVADO (sin // al inicio)
  if (!request.auth || !request.auth.uid) {
    throw new https.HttpsError('unauthenticated', 'Se requiere autenticación.');
  }
  // --- FIN DEL CAMBIO ---

  // 'data' ahora es 'request.data'
  const { codeValue, studentId } = request.data;

  // Verifica que el ID del estudiante que llama sea el mismo que el ID en los datos
  // (Esta es una buena práctica de seguridad)
  if (request.auth.uid !== studentId) {
     throw new https.HttpsError('permission-denied', 'No puedes registrar asistencia para otro usuario.');
  }

  const presenceRef = db.collection('class_presence');
  const activeClaseQuery = presenceRef
    .where('salaId', '==', codeValue)
    .where('timestamp', '>', admin.firestore.Timestamp.fromMillis(Date.now() - 90 * 60 * 1000));
  const presenceSnapshot = await activeClaseQuery.get();

  if (presenceSnapshot.empty) {
    throw new https.HttpsError('invalid-argument', 'No hay clase activa (QR desfasado).');
  }

  const docentePresente = presenceSnapshot.docs[0].data();

  const studentRef = db.collection('users').doc(studentId);
  const studentDoc = await studentRef.get();
  if (!studentDoc.exists || studentDoc.data()?.role !== 'student') {
    throw new https.HttpsError('not-found', 'Estudiante no hallado.');
  }

  await db.collection('attendances').add({
    codeValue,
    studentId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    docentePresente: {
      teacherId: docentePresente.teacherId,
      teacherName: docentePresente.teacherName,
      timestamp: docentePresente.timestamp
    }
  });

  return { status: 'ok' };
});

/**
 * Cloud Function para asignar solicitudes y notificar (SINTAXIS V2)
 */
export const assignRequest = https.onCall(async (request) => {
  // El "guardia" de esta función (el usuario debe estar logueado)
  const uid = request.auth?.uid;
  if (!uid) {
    throw new https.HttpsError('unauthenticated', 'No autenticado');
  }

  const { requestId, action } = request.data;

  const reqRef = db.collection('requests').doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) {
    throw new https.HttpsError('not-found', 'Solicitud no encontrada');
  }

  const reqData = reqSnap.data();
  if (!reqData) {
    throw new https.HttpsError('not-found', 'Datos de solicitud no encontrados');
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const role = userSnap.data()?.role;

  const validTransitions: { [key: string]: boolean } = {
    resolve: reqData.status === 'assigned',
    assign: reqData.status === 'open',
    start: reqData.status === 'assigned'
  };

  if (!validTransitions[action]) {
    throw new https.HttpsError('invalid-argument', 'Transición no válida.');
  }

  if (role !== reqData.type && role !== 'admin') {
    throw new https.HttpsError('permission-denied', 'Rol no autorizado');
  }

  const update: any = { status: action };
  if (action === 'assign') update.assignedTo = uid;
  await reqRef.update(update);

  if (reqData.type === 'enfermeria' && reqData.docentePresente) {
    await admin.messaging().sendToTopic('enfermeria_topic', {
      notification: {
        title: `Emergencia en ${reqData.sala}`,
        body: `${reqData.docentePresente.teacherName} solicitó atención médica`
      }
    });
  }

  return { status: 'ok' };
});