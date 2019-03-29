import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'db-customerform',
  templateUrl: './db-customerform.component.html',
  styleUrls: ['./db-customerform.component.scss']
})
export class DbCustomerformComponent implements OnInit {

  constructor() { }

  @Input() Data: any = null;//个性化字段信息
  @Input() readonly: boolean = false;//是否只读
  ngOnInit() {
  }

}
