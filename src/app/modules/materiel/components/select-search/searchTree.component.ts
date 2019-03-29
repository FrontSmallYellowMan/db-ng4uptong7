import { Component, OnInit,Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'searchTree',
    templateUrl: 'searchTree.component.html',
    styleUrls:['./searchTree.component.scss']
})



export class SearchTreeComponent implements OnInit {

  _treeklists;
  //selectedItem;


  @Input() 
  set treelists(v){//获取从父组件上获取的值
    this._treeklists = v;
  }
  get treelists(){//将获取到的值返到到treelists
      return this._treeklists;
  }

  @Output() onChoose = new EventEmitter();

    constructor() { }

    ngOnInit() { 
       this.treelists._open=false;
    }

    // 点击动作
  itemClick(i,e) {
    // 建立一个服务来接收这个值, 或者借助双向绑定, 处理动作
    if(i.isleaf != "1"){
        
        if(i._open=="true"){
            i._open="false";
        }else{
            i._open="true"; 
        }
        //i._open = !i._open;
        //console.log(1);
    }else{
        //this.selectedItem = i.id+" "+i.title;
        this.onChoose.emit(i);
    }
    
    //i._open = i._open  // 本例只简单演示开关, 借助 treelists本身实现
  }

  choose(v){
      //this.selectedItem = v;
      this.onChoose.emit(v);
  }

  showBg(){
      console.log(1);
  }

    
}