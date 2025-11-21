// backend/functions/src/index.ts

// 1. ¡ESTE IMPORT ES EL CORRECTO PARA QUE TOME EL V1, SINO VA A TRATAR DE CORRER LA LIBRERIA V2 NS ES RARISIMO!
import * as functions from 'firebase-functions'; 
import * as admin from 'firebase-admin';

// 2. IMPORTAMOS EL TIPO 'CallableContext' DESDE SU LUGAR CORRECTO EN V1
import { CallableContext } from 'firebase-functions/v1/https';

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function para validar QR y registrar asistencia (SINTAXIS V1)
 */
// 3. Esta línea ahora funcionará porque usa 'CallableContext' de V1
export const validateQrAndCreateAttendance = functions.https.onCall(async (data: any, context: CallableContext) => {

  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación.');
  }

  const { codeValue, studentId } = data;

  if (context.auth.uid !== studentId) {
     throw new functions.https.HttpsError('permission-denied', 'No puedes registrar asistencia para otro usuario.');
  }

  const presenceRef = db.collection('class_presence');
  const activeClaseQuery = presenceRef
    .where('salaId', '==', codeValue)
    .where('timestamp', '>', admin.firestore.Timestamp.fromMillis(Date.now() - 90 * 60 * 1000));
  const presenceSnapshot = await activeClaseQuery.get();

  if (presenceSnapshot.empty) {
    throw new functions.https.HttpsError('invalid-argument', 'No hay clase activa (QR desfasado).');
  }

  const docentePresente = presenceSnapshot.docs[0].data();

  const studentRef = db.collection('users').doc(studentId);
  const studentDoc = await studentRef.get();
  if (!studentDoc.exists || studentDoc.data()?.role !== 'student') {
    throw new functions.https.HttpsError('not-found', 'Estudiante no hallado.');
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
 * Cloud Function para asignar solicitudes y notificar (SINTAXIS V1)
 */
// 3. Esta línea también usará 'CallableContext' de V1
export const assignRequest = functions.https.onCall(async (data: any, context: CallableContext) => {

  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'No autenticado');
  }

  const { requestId, action } = data;

  const reqRef = db.collection('requests').doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Solicitud no encontrada');
  }

  const reqData = reqSnap.data();
  if (!reqData) {
    throw new functions.https.HttpsError('not-found', 'Datos de solicitud no encontrados');
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const role = userSnap.data()?.role;

  const validTransitions: { [key: string]: boolean } = {
    resolve: reqData.status === 'assigned',
    assign: reqData.status === 'open',
    start: reqData.status === 'assigned'
  };

  if (!validTransitions[action]) {
    throw new functions.https.HttpsError('invalid-argument', 'Transición no válida.');
  }

  if (role !== reqData.type && role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Rol no autorizado');
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