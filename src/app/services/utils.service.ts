import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AlertOptions, LoadingController, LoadingOptions, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
  ) { }
  
  //funcion para llamar al loading
  async presentLoading(opts?: LoadingOptions) {
    const loading = await this.loadingController.create(opts);
    await loading.present();
  }

  //ocultar el loading una vez termino de cargar
  async dismissLoading() {
    return await this.loadingController.dismiss();
  }
  
  //guardando el usuario en local storage
  setElementInLocalStorage(key: string, element: any) {
    return localStorage.setItem(key, JSON.stringify(element));
  }

  getElementFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }
  
  //mensajes de validaciones y de errores
  async presentToast(opts: ToastOptions) {
    const toast = await this.toastController.create(opts);
    toast.present();
  }

  //router
  routerLink(url: string) {
    this.router.navigateByUrl(url)
  }
  
  // mensaje de alerta (en caso de cerrar sesion, eliminar o editar datos, etc...)
  async presentAlert(opts: AlertOptions) {
    const alert = await this.alertController.create(opts);
  
    await alert.present();
  }

  //modal
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalController.create(opts);
    await modal.present();
    //la data que puede que devuelva el modal al cerrarse
    const { data } = await modal.onWillDismiss();
    if(data) {
      return data;
    }
  }
  //si cierras la modal y quieras devolver una data, se pasa atraves de esta funcion
  dismissModal(data?: any){
    this.modalController.dismiss(data);
  }

  getPercentage(task: Task) {
    let completedItems = task.items.filter(item => item.completed).length;
    let totalItems = task.items.length;

    let percentage = (100 / totalItems) * completedItems;
    return parseInt(percentage.toString());
  }

}
