import { Component, OnInit, AfterViewChecked} from '@angular/core';
import { BreadcrumbService } from "app/shared/services/breadcrumb.service";

@Component({
  selector: 'db-headtitle',
  templateUrl: './headtitle.component.html',
  styleUrls: ['./headtitle.component.scss']
})
export class HeadtitleComponent implements OnInit {
  
  public currentPageName;
  constructor(private breadcrumbService:BreadcrumbService) {  }

  ngOnInit() { }

  // ngAfterViewChecked(){
  //   let temp = this.initTitle();
  //   if(this.currentPageName != temp){
  //     this.currentPageName = temp;
  //     console.log(this.currentPageName);
  //   }
  // }

  // ngAfterViewChecked(){
  //   let temp = this.initTitle();
  //   if(this.currentPageName != temp){
  //     this.currentPageName = temp;
  //     console.log(this.currentPageName);
  //   }
  // }

  initTitle(){
    let str = "";
    let temp = this.breadcrumbService.breadcrumb;
    let _that = this;
    temp.map(function (item) {
      if(item.label != "首页"){
       str += item.label;
      }
    });
    if(str.length == 0){
      str = "D-BOMS";
    }
    return str;
  }
}
