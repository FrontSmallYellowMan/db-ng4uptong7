import { Component, OnInit, Input, EventEmitter, Output, AfterViewChecked } from '@angular/core';
declare var $: any;
import { WindowService } from 'app/core';

@Component({
  selector: 'tab-switch',
  templateUrl: 'tab-switch.component.html',
  styleUrls: ["tab-switch.component.scss"]
})
export class TabSwitchComponent implements OnInit {
  @Input() tabList;//tab列表
  @Input() active;//默认显示哪个
  @Input() confirmText = '确定删除？';//删除时提示文字
  @Input() canAdd = false;//可添加
  @Input() canDelete = false;//可删除

  @Output() onDelete = new EventEmitter();
  @Output() addOne = new EventEmitter();
  @Output() onChange = new EventEmitter();
  public orgWidth = 15;//item原本宽度
  constructor(
    private windowService: WindowService) {
  }
  switchTab(index) {//tab切换
    this.active = index;
    for (let i = 0, len = this.tabList.length; i < len; i++) {
      if (this.tabList[i].id == index) {
        // console.log(this.tabList[i]);
        this.onChange.emit(this.tabList[i]);
      }
    }
  }
  delTab(index) {//tab删除
    if (this.tabList.length == 1) {
      this.windowService.alert({ message: "至少保留一个合同", type: 'fail' });
    } else {
      this.windowService.confirm({ message: this.confirmText }).subscribe(v => {
        if (v) {
          this.onDelete.emit(index);
          this.tabList.splice(index, 1);
          // if(index==this.active){
          this.active = this.tabList[0].id;
          this.onChange.emit(this.active);
          // }
          // if(index<this.active){
          //   this.active--;
          //   this.onChange.emit(this.active);
          // }
        }
      })
    }
  }
  // 2.7
  ngAfterViewChecked() {//每次改变tab时更新width
    let len = this.tabList.length;
    if (this.orgWidth * len > 100) {
      let itemWidth;
      if (this.active == this.tabList[0].id) {
        itemWidth = (100 - this.orgWidth - 2) / (len - 1);
      } else {
        itemWidth = (100 - this.orgWidth - 2.7) / (len - 1);
      }
      $(".tab-item").css("width", itemWidth + "%");
      $(".tab-active").css("width", this.orgWidth + "%");
    }
  }

  addTab() {//tab增加
    // this.tabList.push({text:"",invalid:false});
    this.addOne.emit(this.tabList.length - 1);
  }
  ngOnInit() {
  }
}