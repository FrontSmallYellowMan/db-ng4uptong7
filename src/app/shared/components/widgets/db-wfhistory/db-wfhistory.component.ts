import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'db-wfhistory',
  templateUrl: './db-wfhistory.component.html',
  styleUrls: ['./db-wfhistory.component.scss']
})
export class DbWfhistoryComponent implements OnInit {

  /*
  *审批历史数据
  */
  @Input()
  wfHistoryData:Array<any>;

  constructor() { }

  ngOnInit() {
  }

}
