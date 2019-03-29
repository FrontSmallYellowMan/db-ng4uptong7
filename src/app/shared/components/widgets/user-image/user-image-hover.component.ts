import { Component,OnInit ,Input} from '@angular/core';
import { UserImageHeadComponent } from './user-image-head.component';
declare var $;

@Component({
  selector: 'user-image-hover',
  templateUrl: 'user-image-hover.component.html'
})

export class UserImageHoverComponent extends UserImageHeadComponent {

  @Input() delete:boolean;
  Obj = {"userCN":"","userEN":""};
  id_head = "";
  doDel = (target)=> {
    $(target).parents(".m-approval").hide();
  }
}
