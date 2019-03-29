import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../services/index';

import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

@Component({
  selector: 'iq-tools',
  templateUrl: 'tools.component.html',
})
export class ToolsComponent implements OnInit {
  constructor(private toolsService: ToolsService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig) {
    // Assign the selected theme name to the `theme` property of the instance of ToastyConfig.
    // Possible values: default, bootstrap, material
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = "top-center";
    this.toastyConfig.limit = 10;
  }
  ngOnInit() {
    this.toolsService.getToastySubject()
      .subscribe(x => this.addToast(x));
  }

/**
使用解构
*/
  addToast({type,option}) {
    let toastOptions:ToastOptions;
    if(option){
      toastOptions = option;
    }else{
      toastOptions = {
        title: "标题",
        msg: "内容",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap',
      };
    }
    switch (type) {
      case "default": this.toastyService.default(toastOptions); break;
      case "info": this.toastyService.info(toastOptions); break;
      case "success": this.toastyService.success(toastOptions); break;
      case "wait": this.toastyService.wait(toastOptions); break;
      case "error": this.toastyService.error(toastOptions); break;
      case "warning": this.toastyService.warning(toastOptions); break;
      case "clear": this.toastyService.clearAll();break;
    }
  }
}
