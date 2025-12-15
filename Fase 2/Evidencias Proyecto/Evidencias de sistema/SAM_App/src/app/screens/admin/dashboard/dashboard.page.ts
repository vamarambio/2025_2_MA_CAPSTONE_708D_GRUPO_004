import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logOutOutline, createOutline, refreshOutline, constructOutline,
  documentTextOutline, peopleOutline, barChartOutline, warningOutline, alertCircleOutline, syncOutline,
  menuOutline
} from 'ionicons/icons';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DashboardPage implements OnInit {

  poblandoBD = false;
  segmento = 'reportes';
  requests: any[] = [];
  users: any[] = [];

  serviceChart: any;
  roomChart: any;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    addIcons({
      logOutOutline, createOutline, refreshOutline, constructOutline,
      documentTextOutline, peopleOutline, barChartOutline, warningOutline, alertCircleOutline, syncOutline,
      menuOutline
    });
  }

  async ngOnInit() {
    // Check query params for segment
    this.route.queryParams.subscribe(params => {
      if (params['segment']) {
        this.segmento = params['segment'];
      }
    });

    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      this.requests = await this.firebaseService.getAllRequests();
      this.users = await this.firebaseService.getAllUsers();

      if (this.segmento === 'stats') {
        setTimeout(() => this.generateCharts(), 100);
      }
    } catch (e) {
      console.log('Error cargando datos', e);
    }
  }

  segmentChanged() {
    if (this.segmento === 'stats') {
      setTimeout(() => this.generateCharts(), 100);
    } else {
      this.destroyCharts();
    }
    // Close menu on mobile when clicking item
    if (window.innerWidth < 768) {
      this.isMenuOpen = false;
    }
  }

  getTitle() {
    if (this.segmento === 'reportes') return 'Gestión de Reportes';
    if (this.segmento === 'usuarios') return 'Directorio de Usuarios';
    return 'Estadísticas y Métricas';
  }

  // --- STATS & CHARTS ---

  countStatus(status: string) {
    return this.requests.filter(r => r.status === status).length;
  }

  destroyCharts() {
    if (this.serviceChart) this.serviceChart.destroy();
    if (this.roomChart) this.roomChart.destroy();
  }

  generateCharts() {
    this.destroyCharts();

    // 1. Data for Service Chart (Doughnut)
    const serviceCounts: any = {};
    this.requests.forEach(r => {
      const type = r.type || 'general';
      serviceCounts[type] = (serviceCounts[type] || 0) + 1;
    });

    const ctxService = document.getElementById('serviceChart') as HTMLCanvasElement;
    if (ctxService) {
      this.serviceChart = new Chart(ctxService, {
        type: 'doughnut',
        data: {
          labels: Object.keys(serviceCounts).map(k => k.toUpperCase()),
          datasets: [{
            data: Object.values(serviceCounts),
            backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#eab308']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 2. Data for Room Chart (Bar)
    const roomCounts: any = {};
    this.requests.forEach(r => {
      if (r.salaId) {
        roomCounts[r.salaId] = (roomCounts[r.salaId] || 0) + 1;
      }
    });

    const ctxRoom = document.getElementById('roomChart') as HTMLCanvasElement;
    if (ctxRoom) {
      this.roomChart = new Chart(ctxRoom, {
        type: 'bar',
        data: {
          labels: Object.keys(roomCounts),
          datasets: [{
            label: 'Incidentes',
            data: Object.values(roomCounts),
            backgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      });
    }
  }

  // --- ACTIONS ---

  getBadgeColor(type: string) {
    if (type === 'guardias') return 'success';
    if (type === 'enfermeria') return 'danger';
    return 'tertiary';
  }

  async cambiarEstado(req: any, nuevoEstado: string) {
    await this.firebaseService.updateRequestStatus(req.id, nuevoEstado);
    await this.cargarDatos();
  }

  async asignarTicket(req: any) {
    // 1. Filtrar usuarios candidatos (Staff)
    // Buscamos usuarios cuyo rol coincida con el tipo de ticket, o sean Admins/Staff Generico
    const type = req.type || '';
    const candidates = this.users.filter(u => {
      if (u.role === 'admin') return true;
      if (type === 'cetecom' && u.role === 'cetecom') return true;
      if (type === 'enfermeria' && u.role === 'enfermeria') return true;
      if (type === 'guardias' && u.role === 'guardias') return true;
      // Si es otro tipo, quizás mostrar todos los staff? Por ahora restricción suave.
      return false;
    });

    if (candidates.length === 0) {
      const alert = await this.alertController.create({
        header: 'Sin Personal',
        message: `No hay usuarios con el rol "${type}" o Admin disponibles.`,
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 2. Crear Inputs para el Alert
    const inputs: any[] = candidates.map(u => ({
      name: 'assignee',
      type: 'radio',
      label: `${u.email} (${u.role})`,
      value: u.id,
      checked: req.assignedTo === u.id
    }));

    // 3. Mostrar Alert
    const alert = await this.alertController.create({
      header: 'Asignar Ticket',
      message: 'Seleccione un funcionario:',
      inputs: inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Asignar',
          handler: async (userId) => {
            if (userId) {
              await this.firebaseService.assignRequest(req.id, 'assign', userId);
              await this.cargarDatos();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getUserEmail(uid: string) {
    if (!uid) return 'Sin Asignar';
    const u = this.users.find(x => x.id === uid);
    return u ? u.email : 'ID: ' + uid.substring(0, 5);
  }

  async cambiarRol(user: any, event: any) {
    const nuevoRol = event.detail.value;
    const confirm = await this.alertController.create({
      header: 'Confirmar Rol',
      message: `¿Asignar rol ${nuevoRol} a ${user.email}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí', handler: async () => {
            await this.firebaseService.updateUserRole(user.id, nuevoRol);

            // Feedback
            const toast = await this.alertController.create({
              header: 'Rol Actualizado',
              message: `Ahora ${user.email} es ${nuevoRol}.`,
              buttons: ['OK'],
              translucent: true
            });
            await toast.present();

            await this.cargarDatos();
          }
        }
      ]
    });
    await confirm.present();
  }

  async logout() {
    await this.firebaseService.logout();
    this.router.navigate(['/login']);
  }

  // --- MENU LOGIC ---
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // --- MODAL LOGIC ---
  isModalOpen = false;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  poblarBD() {
    this.setOpen(true);
    // En mobile, schließen menu al seleccionar acción
    if (window.innerWidth < 768) {
      this.isMenuOpen = false;
    }
  }

  async confirmarPoblar() {
    this.setOpen(false);
    this.poblandoBD = true;
    const exito = await this.firebaseService.seedDatabase();
    this.poblandoBD = false;

    if (exito) {
      await this.cargarDatos();
      const alert = await this.alertController.create({
        header: 'Operación Exitosa',
        message: 'La base de datos ha sido poblada con nuevos registros.',
        buttons: ['Entendido'],
        cssClass: 'custom-alert'
      });
      await alert.present();
    }
  }

  async sincronizarUsuarios() {
    const loading = await this.alertController.create({ header: 'Sincronizando...', message: 'Buscando usuarios huerfanos...' });
    await loading.present();

    try {
      const resp: any = await this.firebaseService.syncUsers();
      loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Sincronización Completa',
        message: `Se crearon ${resp.created} perfiles de usuario nuevos (Total revisados: ${resp.total}).`,
        buttons: ['OK']
      });
      await alert.present();

      // Recargar lista
      await this.cargarDatos();

    } catch (error) {
      loading.dismiss();
      console.error(error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo sincronizar. Revisa que seas Admin.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}