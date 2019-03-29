
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from "@angular/router";
import { WindowService } from "app/core";
import {ReqData,ReqEditMateriel,CommonlyMaterielAndReturnService} from "../../services/materiel-commonlyMateriel&return.service"
import { dbomsPath } from "environments/environment";

declare var $,window;

@Component({
    selector: 'edit-scm',
    templateUrl: 'edit-materiel-seeCommonlyMateriel.component.html',
    styleUrls:['edit-materiel-seeCommonlyMateriel.component.scss','../../scss/materiel.component.scss']
})

export class EditSeeCommonlyMateriel implements OnInit {

    reqEditMateriel:ReqEditMateriel=new ReqEditMateriel();
    reqData:ReqData=new ReqData;
    extendMaterielHistory:any[]=[];//扩展物料的历史记录列表

    constructor(
        private commonlyService:CommonlyMaterielAndReturnService,
        private windowService:WindowService,
        private router:ActivatedRoute,
        private routerAnchor:Router
    ) { }

    cancel(){//关闭
        window.close();
    }

    ngOnInit() {
        
        
        //this.windowService.alert({message:"已生成物料编号，只可查看，不能编辑",type:"fail"});//已生成物料编号，当页面加载时，显示提示信息

        this.router.params.subscribe(params => {

            if (params.id != 0) {

                this.reqEditMateriel.MaterialRecordID = params.id;
                this.reqEditMateriel.ApplyType = "1"//查询类型一般物料类型
                this.commonlyService.editMateriel(this.reqEditMateriel).then(data => {
                    this.reqData = data.data.list[0];
                    this.extendMaterielHistory=data.data.MaterialExtendHistoryList;
                    console.log(this.extendMaterielHistory);

                });

            }

            window.location.href=`${dbomsPath}mate/edit-scm/${this.reqEditMateriel.MaterialRecordID}#top`;

        });

        //this.routerAnchor.navigate(["/mate/edit-scm",this.reqEditMateriel.MaterialRecordID],{fragment:"top"});
        

    }

    ngAfterViewInit(){
        
        
            // $("html,body").scrollTop(300); 
            // console.log($(window).scrollTop());
            //this.routerAnchor.navigate(["/mate/edit-scm",this.reqEditMateriel.MaterialRecordID],{fragment:"top"});
            
        
        
    }
}