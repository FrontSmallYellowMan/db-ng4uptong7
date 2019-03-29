import { Component, forwardRef, ViewChild, OnInit, Input, Output, ElementRef, ComponentRef, EventEmitter } from '@angular/core';
import { Pager, XcBaseModal, XcModalService, XcModalRef } from 'app/shared/index';
import { Query, SelectSearchService } from '../../services/select-search.service';

declare var $;

@Component({
  templateUrl: './select-search-tree.component.html',
  styleUrls: ['./select-search-tree.component.scss']
})

export class TreeComponent {
    modal: XcModalRef;
    modalTree:XcModalRef;
    loading: boolean = false;
    _menu;
     menu:any = [
       
      //   {title: '1',_open:false, //默认打开第一级
      //   items: [{title: '1.1',_open:false, //默认打开第一级
      //   items: [{title: 'xxx',_open:false,
      //   items: [{title:"你好1",remark:"1附近的开始了就打算离开附近的开始了就分开了积分快到脸上接口飞数据反馈来的数据库分类第三节"},{title:"不知道",remark:"2附近的开始了就打算离开附近的开始了就分开了积分快到脸上接口飞数据反馈来的数据库分类第三节"},{title:"你好2"},{title:"不知道"}]}
      //   ]},
      //     {title: '1.2',
      //     _open:false,
      //     items:[{title:"2"},{title:"3"},{title:"2"},{title:"3"}]
      //   }
      //   ]
      // },
      //   {
      //       title: '2',_open: false,
      //       items: [{title:"1w"},{title:"2w"}]
      //   }
    
]

  query: Query = new Query(1,1);
  constructor(private xcModalService: XcModalService,
  private selectSearchService: SelectSearchService) {}

  ngOnInit() {
    this.modal = this.xcModalService.getInstance(this);
    this.modal.onShow().subscribe((query) => {
      //this.query = query;
      this.loading = true;
      this.initData();
    });
    
  }

  initData(){
    this.selectSearchService.searchTax(this.query).then(result => {
      if(result.success){
        this.loading = false;
        this.menu=result.data.nodes;
        this._menu = JSON.parse(JSON.stringify(this.menu));
        console.log(this.menu);
      }
    })
  }

  hide(data?:any){

    if(this.modal.onShow){
        this.modal.hide(data);
    }else{
        this.modalTree.hide(data);
    }  

    //重置搜索条件
    this.query = new Query(1,1);
  }

  search(){//搜索本地数据
    this.resetMenu();//因为是本地搜索，所以每当搜索时将数据请求到的数据重置
    //this.initData();
    let reg = new RegExp(this.query.queryStr,'ig');//将搜索的数据定义为正则

    function getValue(data){//定义一个过滤函数
      if(reg.test(data.id+data.title)){//如果有搜索到匹配的项，则返回true
        //data._open = "true"; 
        return true;
      }else{
        if(!!data.items){//如果存在items
          data._open = "true";//打开搜索到的项目  
          data.items = data.items.filter(v => getValue(v));//再次执行函数，过滤是否有符合条件的搜索项
          return data.items.length > 0;//如果返回的data.items.length>0则表示有数据，返回true，否则返回false
        }else{
          return false;//如果都没有符合条件的项，则返回false
        }
      }
    }

    this.menu = this.menu.filter(item => getValue(item));//将过滤完的数据赋值给menu
  }

  resetMenu(){
    this.menu = JSON.parse(JSON.stringify(this._menu)); 
    //console.log(this.menu);     
  }


  
}