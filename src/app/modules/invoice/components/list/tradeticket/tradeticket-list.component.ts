import { Component, OnInit } from '@angular/core';
import { Pager,XcModalService,XcModalRef} from "../../../../../shared/index";
import { InvoiceApplyService } from "../../../services/invoice/invoice-apply.service";
import { Query,TradeTicketInfo } from "../../apply/invoice/invoice-info";
import { InvoiceDetailComponent } from "../../detail/invoice-detail.component";
import { TradeTicketService } from "../../../services/tradeticket/tradeticket-apply.service";
import { environment_java,dbomsPath} from "../../../../../../environments/environment";
declare var window, Blob, document, URL;

@Component({
    templateUrl: './tradeticket-list.component.html',
    styleUrls:['./tradeticket-list.component.scss']
})


export class TradeTicketListComponent implements OnInit {
 
    loading: boolean = true;//加载中效果
    public tradeTicketList = new Array<TradeTicketInfo>();//列表数据
    //分页
    public pagerData = new Pager();
    public query: Query=new Query();//查询条件 
    //页签 
    public applyPage:string="0";
    constructor(
        private invoiceApplyService: InvoiceApplyService,
        private tradeTicketService: TradeTicketService,
        private xcModalService: XcModalService){}

    name = '交存'
    ngOnInit() {
        //默认进入“审批中”中页面
        this.query.tradeStatus = "0,1,2,3,4";
        this.getTradeTicketList();
    }
    getIqDate(date,flag){
        if(flag=="end"){
            this.query.endDate=date;
        }else{
            this.query.startDate=date;
        }
        this.getTradeTicketList();
    }
    getTradeTicketList(){
      this.loading = true;
      let pagerData = this.pagerData;
      this.query.pageNo = pagerData.pageNo;
      this.query.pageSize = pagerData.pageSize;
      if(this.query.startDate !='' && this.query.startDate !=undefined){
        this.getDate(this.query.startDate,'start');
      } 
      if(this.query.endDate !='' && this.query.endDate !=undefined){
        this.getDate(this.query.endDate,'end');
      } 
      this.tradeTicketService.getTradeTicketList(this.query).then(res => {
          // res.list = [];
          if(res.list){
              this.tradeTicketList = res.list;
              for(let i = 0; i < this.tradeTicketList.length; i ++){
                this.tradeTicketList[i].num= (pagerData.pageNo-1)*pagerData.pageSize+(i+1);
                if(this.tradeTicketList[i].tradeStatus==99){
                    if(this.tradeTicketList[i].platformCode=='21'){
                        this.tradeTicketList[i].statusName = '商务已接收';
                    }else{
                        this.tradeTicketList[i].statusName = '财务已接收';
                    }
                }else{
                    this.tradeTicketList[i].statusName = this.getStatusName(this.tradeTicketList[i].tradeStatus);
                }
                //获取下一步审批人
                if(this.tradeTicketList[i].tradeStatus==0 || this.tradeTicketList[i].tradeStatus==1 || this.tradeTicketList[i].tradeStatus==6 || this.tradeTicketList[i].tradeStatus==9){
                    this.getBussinApproves(this.tradeTicketList[i].platformCode).then(
                        res =>{
                            this.tradeTicketList[i].nextApprove = res.substring(0,res.length-1);
                        }   
                    );
                }else if(this.tradeTicketList[i].tradeStatus==2 || this.tradeTicketList[i].tradeStatus==3 || this.tradeTicketList[i].tradeStatus==5 || this.tradeTicketList[i].tradeStatus==8){
                    this.getFinaceApproves(this.tradeTicketList[i].platformCode).then(
                        res =>{
                            this.tradeTicketList[i].nextApprove = res.substring(0,res.length-1);
                        }   
                    );
                }else if(this.tradeTicketList[i].tradeStatus==7 || this.tradeTicketList[i].tradeStatus==10){
                    if(this.tradeTicketList[i].platformCode=='21'){
                        this.getBussinApproves(this.tradeTicketList[i].platformCode).then(
                            res =>{
                                this.tradeTicketList[i].nextApprove = res.substring(0,res.length-1);
                            }   
                        );
                    }else{
                        this.getFinaceApproves(this.tradeTicketList[i].platformCode).then(
                            res =>{
                                this.tradeTicketList[i].nextApprove = res.substring(0,res.length-1);
                            }   
                        );

                    }
                }else{
                    this.tradeTicketList[i].nextApprove = "";
                }
              }
              //设置分页器
              if(res.pager&&res.pager.total){
                  this.pagerData.set({
                      total: res.pager.total,
                      totalPages: res.pager.totalPages
                  })
              }
          }
          this.loading = false;
      })
    }

    //获取商务审批人
    getBussinApproves(plantformCode):Promise<string>{ 
       return  this.invoiceApplyService.getApprovals(plantformCode,"ChequeBusinessPost").then(
                res => {
                     let  bussinApprove = "";
                        if(res.item.persons){
                            for(let user of res.item.persons){
                                bussinApprove += user.itcode+'/'+user.name+"，";
                            } 
                        }  
                        return bussinApprove;
                }
            ); 
    }
    //获取财务审批人
    getFinaceApproves(plantformCode): Promise<string>{
      return  this.invoiceApplyService.getApprovals(plantformCode,"ChequeFinanceApprove").then(
                res =>{
                    let finaceApprove = "";
                    if(res.item.persons){
                        for(let user of res.item.persons){
                            finaceApprove +=  user.itcode+'/'+user.name+"，";
                        } 
                    }
                    return finaceApprove;
                }
            );
    }

    public currentPageSize;//当前每页显示条数
    onChangePage(e: any): void {
        //非第一页，切换条数。跳为第一页
        if(this.currentPageSize != e.pageSize){
            this.pagerData.pageNo = 1;
        }
        this.currentPageSize = e.pageSize
        this.query.pageNo = e.pageNo;
        this.query.pageSize = e.pageSize;
        this.getTradeTicketList();
    }
     //点击页签事件
    changeapplytype (flowstates:string):void{
        this.loading = true;
        this.applyPage = flowstates;
        if(flowstates === "0"){
            this.query.tradeStatus = "0,1,2,3,4";
        }else if(flowstates === "1"){
            this.query.tradeStatus = "11";
        }else if(flowstates === "3"){
            this.query.tradeStatus = "13";
        }else if(flowstates === "4"){
            this.query.tradeStatus = "5,6,7,8,9,10";
        }else{
            this.query.tradeStatus = "";
        }
        this.getTradeTicketList();
    }

    getDate(date,flag){
        let dataObj = new Date(date);
        let year = dataObj.getFullYear();
        let month = (dataObj.getMonth()+1).toString();
        let day = dataObj.getDate().toString();
        if (month.length == 1) {
            month = "0" + month
        }
        if (Number(day) < 10) {
            day = "0" + day;
        }
        let temp = year + "-" + month + "-" + day;
        if (flag == "start") {
            this.query.startDate = temp;
        }else if(flag == "end"){
            this.query.endDate = temp;
        }
    }

    goDetail(id):void{
        if(this.applyPage =='3'){//重新取回
            window.open(dbomsPath+"invoice/apply/tradeticket/"+id);
        }else{//详情
            window.open(dbomsPath+"invoice/apply/tradeticketDetail/"+id); 
        }
    }
    addsq(){
        window.open(dbomsPath+'invoice/apply/tradeticket/-1');
    } 


 getStatusName(status:number): string{
        let statusName= "";
        switch(status){
            case 0:
                statusName = "开始";
                break;
            case 1:
                statusName = "商务已接受";
                break;
            case 2:
                statusName = "已上传财务";
                break;
             case 3:
                statusName = "财务已接受";
                break;
            case 4:
                statusName = "银行已取走";
                break;
            case 5:
                statusName = "银行绝收";
                break;
            case 6:
                statusName = "拒收后商务取走";
                break;               
            case 7:
                statusName = "拒收后申请人取走";
                break;
            case 8:
                statusName = "银行退票";
                break;
            case 9:
                statusName = "退票后商务取走";
                break;
            case 10:
                statusName = "退票后申请人取走";
                break;
            case 11:
                statusName = "完成";
                break;
            case 12:
                statusName = "失败";
                break;                
            case 13:
                statusName = "草稿";
                break;
            case 14:
                statusName = "已取回";
                break;
            case 15:
                statusName = "已换票";
                break;
            default:
                statusName = "其他";
        }
        return statusName;
    }

 
}
