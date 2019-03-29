import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { ReqData,ReqEditMateriel,ReqDeleteList,ReqSearchData,CommonlyMaterielAndReturnService } from "../../services/materiel-commonlyMateriel&return.service";
import { WindowService } from "app/core";
import { ActivatedRoute } from "@angular/router";
import { dbomsPath } from "environments/environment";

@Component({
    selector: 'edit-srs',
    templateUrl: 'edit-materiel-seeReturnService.component.html',
    styleUrls:["edit-materiel-seeReturnService.component.scss",'../../scss/materiel.component.scss']
})

export class EditSeeReturnServiceComponent implements OnInit {

    reqEditMateriel:ReqEditMateriel=new ReqEditMateriel();
    reqData:ReqData=new ReqData;

    constructor(
        private returnService:CommonlyMaterielAndReturnService,
        private windowService:WindowService,
        private router:ActivatedRoute
    ) { }

    cancel(){//关闭
        window.close();
    }

    ngOnInit() {

        //this.windowService.alert({message:"已生成物料编号，只可查看，不能编辑",type:"fail"});//已生成物料编号，当页面加载时，显示提示信息

        this.router.params.subscribe(params => {

            if (params.id != 0) {

                this.reqEditMateriel.MaterialRecordID = params.id;
                this.reqEditMateriel.ApplyType = "2"//查询类型为返款服务
                this.returnService.editMateriel(this.reqEditMateriel).then(data => {
                    this.reqData = data.data.list[0];

                    //console.log(this.reqData);

                });

                window.location.href=`${dbomsPath}mate/edit-srs/${this.reqEditMateriel.MaterialRecordID}#top`;
                

            }

        });

    }
}