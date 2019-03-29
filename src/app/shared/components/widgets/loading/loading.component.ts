import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'loading',
  templateUrl: 'loading.component.html',
  styleUrls:["loading.component.scss"]
})
export class LoadingComponent implements OnInit {
  constructor() {  }

  _show = true;
  @Input("style")
  style = {};

  @Input("show")
  set show(show){
    this._show = show;
  }
  get show(){
    return this._show;
  }

  @Input() public showText:string;//要显示的提示文字

  ngOnInit() {}
}
