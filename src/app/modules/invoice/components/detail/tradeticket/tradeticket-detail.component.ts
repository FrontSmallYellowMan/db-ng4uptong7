import { Component, OnInit,ViewChild, ViewChildren  } from '@angular/core';
import { ActivatedRoute,Params,Router } from '@angular/router';
import { DbWfviewComponent } from 'app/shared/index';
import { TradeTicketInfo } from "../../apply/invoice/invoice-info";
import { TradeTicketService } from "../../../services/tradeticket/tradeticket-apply.service";
import { Location } from "@angular/common";
declare var window;

@Component({
  templateUrl: './tradeticket-detail.component.html',
   styleUrls: ['./tradeticket-detail.component.scss']
})
export class TradeTicketDetailComponent implements OnInit {
 
  public tradeticketInfo: TradeTicketInfo = new  TradeTicketInfo();
  public tradeTicketList:any[]=new Array();
  public approveList: any[] = new Array();
  public tradeticketId: string = "";
  public attachList = [];
  public dataPerson: any;
  @ViewChild('wfview')
  wfView: DbWfviewComponent;
  wfData = {
    wfHistoryData: null,//流程日志列表数据
    wfprogress: null//流程图数据
  };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location:Location,
    private tradeTicketService: TradeTicketService
    
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
        this.tradeticketId = params['id'];
        this.tradeTicketService.getTradeticketById(this.tradeticketId).then(data => {
          this.tradeticketInfo = data.item[0];
          this.approveList = data.item[1];
          this.tradeTicketList = data.item[4];
          this.wfView.onInitData(data.item[2]);
          this.dataPerson = {
                userID: data.item[0].applyItcode,
                userEN: data.item[0].applyItcode.toLocaleLowerCase(),
                userCN: data.item[0].applyUsername
            };
          this.attachList= data.item[3];//附件
          this.approveList.forEach(element => {
            let dataPerson = {
               userID: element.operateItCode.toLocaleLowerCase(),
               userEN: element.operateItCode.toLocaleLowerCase(),
               userCN: element.operateUserName
            }
            element.user = dataPerson;
          });

    }) 
    }); 
  } 
  goback() {
        //this.location.back();
        window.close();
    }


}  