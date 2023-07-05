import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateTaskComponent } from 'src/app/shared/components/add-update-task/add-update-task.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  user = {} as User;
  loading: boolean = false;

  constructor(
    private utilSvc: UtilsService,
    private firebasSvc: FirebaseService
  ) {}

  ngOnInit() {}

  getUser() {
    return this.user = this.utilSvc.getElementFromLocalStorage('user')
  }

  ionViewWillEnter() {
    this.getUser()
    this.getTasks();
  }

  getPercentage(task: Task) {
    return this.utilSvc.getPercentage(task);
  }

  async addOrUpdateTask(task?: Task) {
    let res = await this.utilSvc.presentModal({
      component: AddUpdateTaskComponent,
      componentProps: { task },
      cssClass: 'add-update-modal',
    });
    //al cerrar el modal, este puede enviarnos una respuesta, la cual se esta enviando desde el componente addUpdateTask llamada success, si la tiene, actualizamos la lista de tareas
    if (res && res.success) {
      this.getTasks();
    }
  }

  getTasks() {
    let user: User = this.utilSvc.getElementFromLocalStorage('user');
    let path = `users/${user.uid}`;
    this.loading = true;

    let sub = this.firebasSvc.getSubcollecion(path, 'tasks').subscribe({
      next: (res: Task[]) => {
        this.tasks = res;
        sub.unsubscribe();
        this.loading = false;
      },
    });
  }
  
  confirmDeleteTask(task: Task) {
    this.utilSvc.presentAlert({
      header: 'Eliminar',
      message: '¿Quieres eliminar esta tarea?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteTasks(task);
          }
        }
      ]
    })
  }

  deleteTasks(task: Task) {
    let path = `users/${this.user.uid}/tasks/${task.id}`;
    this.utilSvc.presentLoading();
    
    this.firebasSvc.deleteDocument(path).then(res => {
      this.utilSvc.presentToast({
        message: 'Tarea eliminada exitosamente',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
      this.getTasks();
      this.utilSvc.dismissLoading();
    }, error => {
      this.utilSvc.dismissModal({ success: true });
      this.utilSvc.presentToast({
        message: error,
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 5000
      });
      this.utilSvc.dismissLoading();
    });
  }

}
