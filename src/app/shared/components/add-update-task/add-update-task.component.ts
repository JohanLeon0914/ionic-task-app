import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemReorderEventDetail } from '@ionic/angular';
import { Item, Task } from 'src/app/models/task.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-task',
  templateUrl: './add-update-task.component.html',
  styleUrls: ['./add-update-task.component.scss'],
})
export class AddUpdateTaskComponent  implements OnInit {

  @Input() task: Task;
  user = {} as User;

  form = new FormGroup({
    id: new FormControl(''),
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required, Validators.minLength(4)]),
    items: new FormControl([], [Validators.required, Validators.minLength(1)]),
  })

  constructor(
    private utilSvc: UtilsService,
    private firebasSvc: FirebaseService
  ) { }

  ngOnInit() {
    this.user = this.utilSvc.getElementFromLocalStorage('user');
    if(this.task) {
      this.form.setValue(this.task);
      this.form.updateValueAndValidity();
    }
  }

  // crear o actualizar una tarea
  submit() {
    if(this.form.valid) {
      if(this.task) {
        this.updateTasks();
      } else {
        this.createTask();
      }
    }
  }

  createTask() {
    let path = `users/${this.user.uid}`;
    this.utilSvc.presentLoading();
    //elimino el id de formulario para no mandarlo cuando cree la tarea
    delete this.form.value.id;

    this.firebasSvc.addSubcollecion(path, 'tasks', this.form.value).then(res => {
      this.utilSvc.dismissModal({ success: true });
      this.utilSvc.presentToast({
        message: 'Tarea creada exitosamente',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
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

  updateTasks() {
    let path = `users/${this.user.uid}/tasks/${this.task.id}`;
    this.utilSvc.presentLoading();
    //elimino el id de formulario para no mandarlo cuando cree la tarea
    delete this.form.value.id;

    this.firebasSvc.updateDocument(path, this.form.value).then(res => {
      this.utilSvc.dismissModal({ success: true });
      this.utilSvc.presentToast({
        message: 'Tarea actualizada exitosamente',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
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

  getPercentage() {
    return this.utilSvc.getPercentage(this.form.value as Task);
  }
  
  //Ordenas la lista de actividades
  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.form.value.items = ev.detail.complete(this.form.value.items);
    this.form.updateValueAndValidity();
  }

  removeItem(index: number) {
    this.form.value.items.splice(index, 1);
    this.form.controls.items.updateValueAndValidity();
  }

  createItem() {
    this.utilSvc.presentAlert({
      header: 'Nueva Actividad',
      backdropDismiss: false,
      inputs: [
        {
          name: 'name',
          type: 'textarea',
          placeholder: 'Nombre de la actividad'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Agregar',
          handler: (res) => {
            let item: Item = { name: res.name, completed: false };
            this.form.value.items.push(item);
            this.form.controls.items.updateValueAndValidity();
          }
        }
      ]
    })
  }

}
