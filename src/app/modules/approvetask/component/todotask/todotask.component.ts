import { Component, OnInit } from '@angular/core';
import { TaskService, Query } from "../../service/task-service";
import { Pager } from "../../../../shared/index";
import { dbomsPath } from "environments/environment";
declare var window: any;
declare var $: any;

@Component({
  selector: 'db-todotask',
  templateUrl: './todotask.component.html',
  styleUrls: ['./todotask.component.scss']
})
export class TodotaskComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  loading = false;
  query:Query = new Query();
  toDoTaskList = {PageCount: 0,TotalCount:0,ListTaskPage: []};
  pagerData : Pager = new Pager();
  needRefresh = false;//是否需要刷新
  ngOnInit() {
    this.search();
    window.addEventListener("focus", () => {
      if (this.needRefresh == true) {
        this.search();
      }
    });
  }

  search(tasktype?){
    this.loading = true;
    if (tasktype) {
      this.query.TaskType = tasktype;
      this.pagerData.pageNo = 1;
    }
    this.query.SearchKey = this.query.SearchKey.trim();
    this.query.CurrentPage = this.pagerData.pageNo;
    this.query.PageSize = this.pagerData.pageSize;
    this.taskService.savePurchaseContract(this.query).subscribe(data => {
      this.loading = false;
      this.needRefresh = false;
      this.toDoTaskList = JSON.parse(data.Data);
      this.pagerData.totalPages = this.toDoTaskList.PageCount;
      this.pagerData.total = this.toDoTaskList.TotalCount;
      //设置消息总数
      $('.index-todotaskcount').html(this.toDoTaskList.TotalCount);
    });
  }

  routerPage(url:string){
    this.needRefresh = true;
    if (url.indexOf("http")== -1) {
      url = url.substring(1);
      window.open(dbomsPath + url);
    }else{
      window.open(url);
    }
  }

}
