import { Component } from '@angular/core';

@Component({
    selector: 'left-nav',
    templateUrl: 'left-nav.component.html',
    styleUrls: ['left-nav.component.scss']
})
export class LeftNavComponent {
    navData = [
          {name:"客户管理",
          isArr:["客户管理","额度账期维护"]
          },
          {name:"产品管理"},
          {name:"交付管理"},
          {name:"PIPLINE管理"},
          {name:"采购管理"},
          {name:"销售管理"}
      ];
}
