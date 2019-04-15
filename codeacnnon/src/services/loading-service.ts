import { LoadingController } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
    loading: any;
    timer: number;
    constructor(private loadingCtrl: LoadingController) { }

    show() {
        this.loading = this.loadingCtrl.create({
            content: 'Please wait...',
            showBackdrop:false,
        });
        this.timer = setTimeout(() => {
            this.loading.dismiss();
        }, 10000);
        this.loading.present();
    }
    presentLoadingCustom() {
        this.loading = this.loadingCtrl.create({
						spinner: 'hide', 
            content: `
            <div class="custom-spinner-container">
              <div class="custom-spinner-spinner1"></div>
            </div>`,
            showBackdrop:false,
            enableBackdropDismiss:true,
            duration:10000
        });
        this.timer = setTimeout(() => {
            this.loading.dismiss();
        }, 10000);

        this.loading.onDidDismiss(() => {
            console.log('Dismissed loading');
        });

        this.loading.present();
    }
    hide() {
        if (this.loading) {
            this.loading.dismiss();
            clearTimeout(this.timer);
            //this.loading =null;
        }
    }
}
