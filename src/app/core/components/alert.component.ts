// import { Component,OnInit,ViewChild } from '@angular/core';
// import { WindowService } from '../services/index';
// import { ModalDirective } from 'ng2-bootstrap/modal';
//
// export class Option {
//     type : string
//     message: string
// }
// @Component({
//     selector: 'alert-page',
//     templateUrl: 'alert.component.html'
// })
// export class AlertComponent implements OnInit {
//     constructor (private WindowService:WindowService){};
//     @ViewChild('alertModal') public alertModal:ModalDirective
//     private options = new Option;
//
//     hideAlert = ()=>{
//         this.alertModal.hide();
//     }
//
//     ngOnInit(){
//         this.WindowService.getAlertSubject()
//         .subscribe(
//             p =>{
//                 this.options = p;
//                 this.alertModal.show();
//             }
//         )
//     }
// }
