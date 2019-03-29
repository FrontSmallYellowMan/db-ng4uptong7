import { Component,OnInit } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Observable } from 'rxjs';


import { 
  Query,Rank,
  FiscalInfo,
  FiscalAdjustService
} from './../services/table-rank.service';

@Component({
    templateUrl: './apptpl-tableRank.component.html'
})
export class ApptplTableRankComponent implements OnInit {
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
  query: Query;//查询条件
  rank: Rank;//排序条件
  pagerData = new Pager();

  fiscalList: FiscalInfo[] = [];//财年列表
  loading: boolean = true;//加载中效果

  constructor(
    private fiscalAdjustService:FiscalAdjustService,
    private windowService:WindowService) {
  }

  ngOnInit(){
    this.query = new Query();
    this.rank = new Rank();
  }
  //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }

  onChangePager(e: any){
    this.query.srcBusinessScope = this.query.srcBusinessScope || "";
    this.query.descBusinessScope = this.query.descBusinessScope || "";
    this.query.pageNo = e.pageNo;
    this.query.pageSize = e.pageSize;
    this.initData(this.query,this.rank);
  }

  initData(query: Query,rank:Rank){
    this.fullChecked = false;
    this.fullCheckedIndeterminate = false;
    this.fiscalAdjustService.getFiscalList(query,rank).then(data => {
      console.log(data);
      this.fiscalList = data.list;
      //设置分页器
      this.pagerData.set(data.pager);
      this.loading = false;
    })
  }

  rankSet(col){//排序
    switch(this.rank[col]){
      case "none":
        this.rank[col] = "up";
        break;
      case "up":
        this.rank[col] = "down";
        break;
      case "down":
        this.rank[col] = "up";
        break;
    }
    for(let key in this.rank){
      if(key==col){
        continue;
      } 
      this.rank[key]="none";
    }
    this.initData(this.query,this.rank);
  }
  //删除财年调整
  deleteFiscal(param: any){
    let callback = data => {
      if(data.success){
        this.fullChecked = false;
        this.fullCheckedIndeterminate = false;
        this.initData(this.query,this.rank);
        this.windowService.alert({message:data.message,type:"success"});
      }else{
        this.windowService.alert({message:data.message,type:"fail"})
      }
    }

    if(typeof param == "string"){//删除单条数据
            this.fiscalAdjustService.deleteFiscal(param).then(callback);
    }else{//删除多条数据
          let ObList = [];
          param.filter(item => item.checked === true).forEach(item => {
            ObList.push(this.fiscalAdjustService.deleteFiscal(item.id));
          });
          Observable.merge.apply(null, ObList).toPromise().then(callback);
    }
  }
}
