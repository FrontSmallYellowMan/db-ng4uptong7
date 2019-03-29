import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'db-india-main',
  templateUrl: './india-main.component.html',
  styleUrls: ['./india-main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IndiaMainComponent implements OnInit {

  indiaNavConfig =
  [
    {
      active: true,
      text: "菜单",
      url: "india/sclist",
      menu: [
        {
          iqon: 'iqon-angle-right',//图标样式类
          text: '合同用印',
          open: true,
          sub: [
            {
              active: true,
              text: '销售合同用印',
              url: "india/sclist"
            },
            {
              active: false,
              text: '争议解决方式维护',
              url: "india/disputedealttype"
            },
            {
              active: false,
              text: '采购合同用印',
              url: "india/pclist"
            }
          ]
        }
      ]
    },
    {
      active: false,
      text: "查询",
      url: "india/sealsearch",
      menu: [
        {
          iqon: 'iqon-angle-right',//图标样式类
          text: '盖章岗查询',
          open: true,
          sub: []
        }
      ]
    }
  ]
  menu = this.indiaNavConfig[0].menu;
  constructor(private router: Router) { }

  ngOnInit() {
    let url = this.router.url.substr(this.router.url.indexOf("/")+1,this.router.url.length);
    if(url == 'india/sealsearch'){
      this.indiaNavConfig[0].active = false;
      this.indiaNavConfig[1].active = true;
      this.menu = this.indiaNavConfig[1].menu;
    }
    this.menu.forEach((menuItem, menuIndex) => {
      if (menuItem.open) {
        menuItem.sub.forEach((subItem, subIndex) => {
          this.menu[menuIndex].sub[subIndex].active = false;
          if (subItem.url == url) {
            this.menu[menuIndex].sub[subIndex].active = true;
          }
        });
      }
    });
  }

  tab(navitem,i){
    this.indiaNavConfig.forEach((navitem, index) => {
      this.indiaNavConfig[index].active = false;
    });
    this.indiaNavConfig[i].active = true;
    this.menu = navitem.menu;
    this.router.navigate([navitem.url]);
  }

  isOpen(index){
    let open = this.menu[index].open;
    this.menu.forEach((element,i) => {
      this.menu[i].open = false;
    });
    open? this.menu[index].open = false:  this.menu[index].open = true;
    let activeitem = this.indiaNavConfig.filter((navitem) => { return navitem.active == true; });
    this.router.navigate([activeitem[0].url]);
  }

  isActive(index,subindex, url){
    this.menu[index].sub.forEach((element,i) => {
      this.menu[index].sub[i].active = false;
    });
    this.menu[index].sub[subindex].active = true;
    this.router.navigate([url]);
  }

}
