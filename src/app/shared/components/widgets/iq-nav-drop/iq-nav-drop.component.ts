import { Component, OnInit,Input} from '@angular/core';

export class Demos {}
@Component({
  selector:'iq-nav-drop',
  templateUrl: './iq-nav-drop.component.html',
  styleUrls: ['./iq-nav-drop.component.scss']
})
export class IqNavDropComponent implements OnInit {
    @Input() Demos: Demos;
  ngOnInit(){
      if(!this.Demos){
          this.Demos = [
                {name:"一级菜单1",
                isArr:["二级菜单1.1","二级菜单1.2","二级菜单1.3"]
                },
                {name:"一级菜单2",
                isArr:["二级菜单2.1","二级菜单2.2","二级菜单2.3"]
                }
              ]
      }
  }
}
