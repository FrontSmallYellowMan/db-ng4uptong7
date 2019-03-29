import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
declare var window;
@Component({
  selector: 'noIdentity',
  templateUrl: 'edit-noIdentity.component.html',
  styleUrls:['edit-noIdentity.component.scss']
})



export class NoIdentity implements OnInit {

  count:number=5;//倒计时数

  constructor(
    private router:Router
  ) { }

  ngOnInit() { 
    let timer=setInterval(()=>{
     this.count--;
     if(this.count<1){
      window.clearInterval(timer);
      this.router.navigate(['login']);
     }
    },1000);

    

  }



}