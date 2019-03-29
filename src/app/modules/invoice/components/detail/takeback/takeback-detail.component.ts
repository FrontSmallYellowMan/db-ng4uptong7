import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DbWfviewComponent} from 'app/shared/index';
import { Location } from "@angular/common";
import { InvoiceTakebackService } from "../../../services/invoice/invoice-takeback.service";
declare var window;

@Component({
  templateUrl: './takeback-detail.component.html',
  styleUrls: ['./takeback-detail.component.scss']
})
export class TakebackDetailComponent implements OnInit {
  takebackInfo: any =[];
  public approveList: any[] = new Array();
  public takebackId: string = "";
  @ViewChild('wfview')
  wfView: DbWfviewComponent; 
  dataPerson : any;
  constructor(
    private invoiceTakebackService: InvoiceTakebackService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router) { }

  ngOnInit() {
     this.getUserData();
  } 
  
  getUserData () :void{
      this.route.params.subscribe((params) => {
          this.takebackId = params['id'];
          this.invoiceTakebackService.getTakebackDetail(this.takebackId).then(data => {
            this.takebackInfo = data.item[0];
            this.approveList = data.item[1];
            this.wfView.onInitData(data.item[2]);
            this.dataPerson = {
                userID: data.item[0].takebackItcode,
                userEN: data.item[0].takebackItcode.toLocaleLowerCase(),
                userCN: data.item[0].takebackUsername
            };
            this.approveList.forEach(approveItem => {
                let dataperson = {
                  userID: approveItem.operateItCode,
                  userEN: approveItem.operateItCode.toLocaleLowerCase(),
                  userCN: approveItem.operateUserName
                }
                approveItem.user = dataperson;
            });
          }) 
      });
  }

  goback() {
        //this.location.back();
        window.close();
    }
}  