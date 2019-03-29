// import { Component,OnInit,ViewChild } from '@angular/core';
// import { WindowService } from '../services/index';
// import { ModalDirective } from 'ng2-bootstrap/modal';
//
// export class Option {
//     message: string
// }
// @Component({
//     selector: 'confirm-page',
//     templateUrl: 'confirm.component.html'
// })
// export class ConfirmComponent implements OnInit {
//     constructor (private WindowService:WindowService){};
//     @ViewChild('confirmModal') public confirmModal:ModalDirective
//     private options = new Option;
//
//     hideConfirm = ()=>{
//         this.confirmModal.hide();
//     }
//
//     ngOnInit(){
//         this.WindowService.getConfirmSubject()
//         .subscribe(
//             p =>{
//                 this.options = p;
//                 this.confirmModal.show();
//             }
//         )
//     }
// }
