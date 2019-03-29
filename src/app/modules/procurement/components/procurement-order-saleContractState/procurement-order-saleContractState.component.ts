import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'saleContractState',
  templateUrl: 'procurement-order-saleContractState.component.html',
  styleUrls:['procurement-order-saleContractState.component.scss']
})

export class ProcurementorderSaleContractState implements OnInit {
  
  @Input() changeSaleContractState:any;

  constructor() { }

  ngOnInit() { }
  
}