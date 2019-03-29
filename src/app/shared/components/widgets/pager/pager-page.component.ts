/*import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { CustomSettingService } from 'app/core';

export class Pager {
    public pageSize: number;
    public pageNo: number;
    public pageAllNum: number;
    public totalPage: number;
}

@Component({
    selector: 'iq-pager',
    templateUrl: 'pager-page.component.html',
    styleUrls: ['pager-page.component.scss']
})

export class PagerPageComponent implements OnInit {
    @Input() data: Pager;
    @Output() onChooseNo = new EventEmitter();
    constructor (private CustomSettingService: CustomSettingService ){ }
    pageSize :  number;

    private pageNo;
    private pageData = [];

    //获取localstrage pageSize数字
    private initSetting() {
      let setting = this.CustomSettingService.getSetting();
      this.pageSize = setting.pageSize;
    }
    //分页器初始化
    initPage = (p,t) => {
        if(t <= 7){
            for (var i=1;i<t+1;i++){
                this.pageData.push({
                    page: i
                })
            }
            return;
        }
        p = parseInt(p);
        let pager = [];
        pager.push({page:1});
        if(p <=4){
            let i =2;
            for(;i<6;i++){
                pager.push({page: i});
            }
            pager.push({
                page: -1
            });
        }else if(t - p <=3){
            pager.push({
                page: -1
            })
            let i = t - 4;
            for(;i<t;i++){
                pager.push({page: i});
            }
        }else{
            pager.push({
                page: -1
            })
            let i = p - 1;
            for(;i<p+2;i++){
                pager.push({page: i});
            }
            pager.push({
                page: -1
            })
        }
        pager.push({page: t})
        this.pageData = pager;
    }
    //分页器点击事件
    changePage = (p) => {
        //-1为隐藏按钮
        if(p == -1){
            return;
        }
        if(p == 'pre'){
            this.data.pageNo = this.data.pageNo-1;
        }else if(p == 'next'){
            this.data.pageNo = this.data.pageNo+1;
        }else{
            if(isNaN(Number(p))){
                alert('请输入整数数字');
                return;
            }
            if(p<1){
                alert('您已经小于最小页码')
                return;
            }
            if(p>this.data.totalPage){
                alert('您已经超过最大页码')
                return;
            }
            this.data.pageNo = p;
            if(this.pageNo){
                this.pageNo = '';
            }
        }
        this.initPage(this.data.pageNo,this.data.totalPage);
        this.onChooseNo.emit({pageNo:this.data.pageNo,pageSize:this.pageSize});
    }
    //修改每页size
    changePageSize = (size)=>{
        this.CustomSettingService.set("pageSize", size);
        this.initSetting();
    }
    ngOnInit() {
        if(!this.data){
            this.data = {
                pageSize: 10,
                pageNo: 7,
                pageAllNum: 117,
                totalPage: 30
            };
        }
        this.initSetting();
        this.initPage(this.data.pageNo,this.data.totalPage);
    }
}
*/