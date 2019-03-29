import { Component, OnInit } from '@angular/core';

declare var window;

@Component({
  selector: 'default-page',
  templateUrl: 'default-page.component.html',
  styleUrls:['default-page.component.scss']
})

export class DefaultPageComponent implements OnInit {

  isShowAnmation:boolean;//是否显示样式
  interval=setInterval(()=>{
    this.isShowAnmation=!this.isShowAnmation
  },1000);

  constructor() { }

  ngOnInit() {
   }

   ngOnDestroy(){
     window.clearInterval(this.interval);
   }


  
}