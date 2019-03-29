import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from "../../services/index";
@Component({
  selector: 'iq-breadcrumb',
  templateUrl: 'iq-breadcrumb.component.html',
})
export class IqBreadCrumbComponent implements OnInit {
  list = []
  constructor(private breadcrumbService:BreadcrumbService) {
    this.list = breadcrumbService.breadcrumb;
  }
  ngOnInit() {}
}
