import { Component, Output, EventEmitter, OnInit, Input, ViewChild, ViewChildren, AfterContentChecked } from '@angular/core';
import { Pager, XcModalService, XcBaseModal, XcModalRef } from 'app/shared/index';
import { WindowService } from 'app/core';
import { Person } from 'app/shared/services/index';

@Component({
  selector: 'db-sc-approver',
  templateUrl: './sc-approver.component.html',
  styleUrls: ['./sc-approver.component.scss']
})
export class ScApproverComponent implements OnInit, AfterContentChecked {
  @Output() scApprover = new EventEmitter();
  @Input() approversInfo;
  @Input() isEdit:boolean;


  public approversList;//整体数据列表
  public approverIdenties  = [];//初始化数据使用，用于选中人员回填
  public sealManagesInfo = [];//印章管理人员数据显示
  public sealManagesArr = [];//印章管理人员数据保存
  public firstTime = true;//第一次检测到子组件全部注入完成

  @ViewChildren("person") personListDom;

  constructor(
      private xcModalService:XcModalService,
      private windowService:WindowService
      ) { }

  // user-image头像存在数据格式{"userID":"123","userEN":"yangglc","userCN":"的期望的"}


  //印章管理员数据处理
  sealChange(seals){
      let managesArr = [];
      let managesInfo = [];
      let managesItcode = [];
      seals.forEach(function(item){
          let itcodeArr = item.ManagerItcodes.split(";");
          let nameArr = item.ManagerNames.split(";");
          itcodeArr.forEach(function(id,i){
              managesArr.push({
                  "Group": item.SealCode,
                  "ITCode":id,
                  "UserName":nameArr[i]
              });
              if(managesItcode.indexOf(id) == -1){
                  managesInfo.push({
                      "userID": id,
                      "userEN":id,
                      "userCN":nameArr[i]
                  });
                  managesItcode.push(id);
              }
          })
      });
      this.sealManagesInfo = managesInfo;
      this.sealManagesArr = managesArr;
      if(this.approversList){
        this.approversList[this.approversList.length-1]["UserSettings"] = managesArr;
        this.scApprover.emit(this.approversList);
      }
  }

  //选人组件，注入父组件后，已存在人员数据回填
  ngAfterContentChecked(){
    let personList = this.personListDom;
    if(personList&&personList.length==12&&this.firstTime){
      this.firstTime = false;
      let results = this.personListDom._results;
      this.approverIdenties.forEach(function(item,i){
          results[i]["list"] = item.list;
      })
      this.personListDom._results = results;
    }
  }

  //对数据进行处理
  initData(res){
    let approversList = res;
    let approverIdenties = [];
    approversList.forEach(function(item,i){
        let userList = [];
        if(item["ApproverList"]&&item["ApproverList"].length>0){
            if(typeof item["ApproverList"] == "string"){
                item["ApproverList"] = JSON.parse(item["ApproverList"]);
            }
            if(item["ApproverList"].length>0){
                item["ApproverList"].forEach(function(m,n){
                    userList.push(new Person());
                    userList[n]["userID"] = "1";
                    userList[n]["userEN"] = m["ITCode"];
                    userList[n]["userCN"] = m["UserName"];
                })
            }
        }
        if(item["UserSettings"]&&item["UserSettings"]!=null){
            if(typeof item["UserSettings"] == "string"){
                item["UserSettings"] = JSON.parse(item["UserSettings"]);
            }
            userList.push({
                "userID": item["UserSettings"]["ITCode"],
                "userEN": item["UserSettings"]["ITCode"],
                "userCN": item["UserSettings"]["UserName"]
            });
        }
        approverIdenties.push({
          // "attribute": item["NodeAttribute"],
          // "identy":"approver"+i,
          "list":userList
        });
    });
    this.approverIdenties = approverIdenties;
    this.approversList = approversList;
    // if(this.sealManagesArr&&this.sealManagesArr.length>0){
    //   this.approversList[11]["UserSettings"] = this.sealManagesArr;
    //   // this.scApprover.emit(this.approversList);
    //   this.emitData();
    // }
    this.emitData();
  }


  //数据初始化
  approversChange(approvers){
      if(approvers){
          this.initData(approvers)
      }
  }

  ngOnInit() {}

  emitData(){
      let approvers = [];
      this.approversList.forEach(function(item,index){
        approvers.push(item);
        if(typeof item["UserSettings"] == "string"){
            approvers[index]["UserSettings"] = JSON.parse(item["UserSettings"]);
        }else{
            approvers[index]["UserSettings"] = item["UserSettings"];
        }
      });
      this.scApprover.emit(this.approversList);
  }
  //选人组件
  changePerson(approver,index,selecttype?,selectItCode?){
    if(approver.length>0){
      let nodeSort = Number(this.approversList[index]["Sort"]);
      let nextIsOpended = Number(this.approversList[index+1]["IsOpened"]);

      //选择一级 出现二级 联动效果
      if((this.approversList[index+1]["NodeName"].indexOf('级预审') != -1 || this.approversList[index+1]["NodeName"].indexOf('级加签') != -1) && nextIsOpended!=1){
        this.approversList[index+1]["IsOpened"] = 1;
      }
    //   if(nodeSort>149&&nodeSort<201&&nextIsOpended!=1){
    //       this.approversList[index+1]["IsOpened"] = 1;
    //   }
    //   if(nodeSort>24&&nodeSort<101&&nextIsOpended!=1){
    //       this.approversList[index+1]["IsOpened"] = 1;
    //   }
      if (selecttype === "select") {
          if (selectItCode === 'null') {
              this.approversList[index]["UserSettings"] = null;
          }else{
              this.approversList[index]["UserSettings"] = {};
              this.approversList[index]["UserSettings"]["ITCode"] = selectItCode;
              this.approversList[index]["UserSettings"]["UserName"] = approver.filter(item => { return item["userEN"] === selectItCode })[0]["userCN"];
          }
      } else {
          this.approversList[index]["UserSettings"] = {};
          this.approversList[index]["UserSettings"]["ITCode"] = approver[0]["userEN"];
          this.approversList[index]["UserSettings"]["UserName"] = approver[0]["userCN"];
      }
    }else{
      let nodeSort = Number(this.approversList[index]["Sort"]);
      //25一级预审，100四级预审
      if(nodeSort>24&&nodeSort<101){
          for(let i = index; i < 3; i++){
            this.personListDom._results[i]["list"] = this.personListDom._results[i+1]["list"];
            this.approversList[i]["UserSettings"] = this.approversList[i+1]["UserSettings"];
            if(this.personListDom._results[i]["list"].length==0){
                this.approversList[i+1]["IsOpened"] = 0;
            }
            //四级预审有数据时，数据替换后。四级清空
            if(i==2){
              this.personListDom._results[3]["list"] = [];
            }
          }
      }
      // 200一级加签，250三级加签
      if(nodeSort>199&&nodeSort<251){
          for(let i = index; i < 10; i++){
            this.personListDom._results[i]["list"] = this.personListDom._results[i+1]["list"];
            this.approversList[i]["UserSettings"] = this.approversList[i+1]["UserSettings"];
            //三级价签有数据时，数据替换后。三级清空
            if(i != 9){
              this.personListDom._results[10]["list"] = [];
            }
            if(this.personListDom._results[i]["list"].length==0){
                this.approversList[i+1]["IsOpened"] = 0;
            }
          }
      }

    }
    this.emitData();
    // this.scApprover.emit(this.approversList);
  }
  delCurrentNode(approversList,i){
      this.approversList[i]["IsOpened"] = 0;
      this.approversList[i]["NodeSelectItCode"] = null;
      this.scApprover.emit(this.approversList);
  }
}
