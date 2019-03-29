import { Component, OnInit,ViewChild, ViewChildren} from '@angular/core';
import { NgForm, NgModel } from "@angular/forms";

@Component({
  templateUrl: './apptpl-apply.component.html'
})
export class ApptplApplyComponent implements OnInit {
  // 实例参数与方法
   sellists=[{//平台列表
    code:'FZ',
    text:'福州'
  },{
    code:'BJ',
    text:'北京'
  },{
      code:'SD',
      text:'山东'
  }];
  apply={
    tel: "",
    email:"",
    reason:"",
    platform:"",
    syncToSchedule:false,
    leaveDate:undefined,
    gender:0,
    thingType:false
  };
  getDate(date){
    console.log(date);
  }
  ifDisabled=false;
  ifIndeterminate=false;
  icheckFun(event){
      console.log(event);
  }
  // 实例参数与方法-end
   ngOnInit() {

  }

  @ViewChildren(NgModel)
    inputList;//表单控件
  @ViewChildren('forminput')
    inputListDom;//表单控件DOM元素
  @ViewChild(NgForm)
    myApplyForm;//表单
  submitForm(e?) {//提交表单
    if (this.myApplyForm.valid) {//表单验证通过
        console.log("submit");
        console.log(this.apply);
      } else {//表单验证未通过
      let flag = false;
      for (let i = 0; i < this.inputList.length&&!flag; i++) {//遍历表单控件
        if (this.inputList._results[i].invalid) {//验证未通过
          let ele = this.inputListDom._results[i];//存储该表单控件元素
          if (ele && ele.nativeElement) {
           ele.nativeElement.focus();//使该表单控件获取焦点
          }
          flag = true;
        }
      }
    }
  }

  changePerson(info){
      console.info(info);
  }


 //表单全选
  fullChecked = false;//全选状态
  fullCheckedIndeterminate = false;//半选状态
  checkedNum = 0;//已选项数
   //检查是否全选
  CheckIndeterminate(v) {
    this.fullCheckedIndeterminate = v;
  }
  platInfoList=[{
    code:1
  },{
    code:2
  },{
    code:3
  },{
    code:4
  }];
  // 表单全选-end
}
