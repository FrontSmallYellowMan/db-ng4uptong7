import { Component,OnInit, Input,EventEmitter,Output, ViewChildren } from '@angular/core';
import { Person } from 'app/shared/services/index';
declare var $: any;

@Component({
  selector: 'prepare-person',
  templateUrl: 'prepare-person.component.html',
  styleUrls: ['prepare-person.component.scss']
})
export class PreparePersonComponent implements OnInit {
  @Input() min=1;//最小个数
  @Input() max=4;//最大个数
  @Input() text='';//左侧文字
  @Input() defaultNum=1;//默认个数
  @Input() personList = [];//已存在人员信息
  @Output() onChange = new EventEmitter();

  @ViewChildren("person") personListDom;

  selectedPerson(e,index){//每次改变人员
    if(JSON.stringify(e)=="[]"){//删除
      this.personList.splice(index,1);
      let len=this.personList.length;
      //最后一个删除时，添加可选组件
      if(this.personList[len-1]["person"].length != 0 && len+1==this.max){
        this.personList.push({person:[]});
      }
    }else{//增加或替换
      if((index+1)<this.max && !this.personList[index+1]){
        this.personList.push({person:[]});
      }
    }
    this.onChange.emit(this.personList);
  }

  initPerson(data?){//初始化personList数组
    if(data){
        this.personList = data;
    }
    if(this.personList.length < this.max){
        this.personList.push({person:[]});
    }
  }
  ngOnInit() {
   this.initPerson();
  }
}
