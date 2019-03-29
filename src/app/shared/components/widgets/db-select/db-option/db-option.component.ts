import { Component, OnInit,Input,Output } from '@angular/core';

import { DBselectService } from "../.././../../services/db-select.service";

@Component({
  selector: 'db-select-option',
  templateUrl: './db-option.component.html',
  styleUrls:['./db-option.component.scss']
})

export class DBselectOptionComponent implements OnInit {

  public isShow:boolean=false;//是否显示下拉列表
  @Input() public ngValue:any='';//显示字段

  constructor(
    private dbSelectService:DBselectService
  ) { }

  ngOnInit() {
    
    

   }

   //获取选择的selectValue
   getSelectValue (value:any) {
     //接收文本框传递来的参数，用来判断是否显示下拉列表
    this.dbSelectService.sendMySelectOptionState(value);

   }
}