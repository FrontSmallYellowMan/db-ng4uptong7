import { Component, OnInit} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './apptpl-container.component.html',
  styleUrls: ['./apptpl-container.component.scss']
})
export class ApptplContainerComponent {
  //服务注入 当前路由服务
  constructor(private route: ActivatedRoute) { }
}
