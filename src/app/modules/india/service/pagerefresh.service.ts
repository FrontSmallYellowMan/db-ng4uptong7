/**
 * 郝建阳 2017-11-08
 * 说明：列表页面获取焦点时页面自动刷新
 */
import { Injectable } from "@angular/core";
declare var window: any;

@Injectable()
export class PageRefresh {
    constructor() {}
    /**
     * 为window注册事件，获取焦点时……
     */
    onFousRefresh(callBack) {
        window.addEventListener("focus",() => {
            let localObj =JSON.parse(window.localStorage.getItem('needRefresh'));
            if (localObj && localObj.needRefresh === true) {
                callBack();
                this.reset();
            }
        });
    }
    /**
     * 设置页面需要刷新标识
     */
    setPageNeedRef() {
        let localObj = new LSObjstructure();
        localObj.needRefresh = true;
        window.localStorage.setItem("needRefresh", JSON.stringify(localObj));
    }
    /**
     * 重置刷新
     */
    private reset() {
        let localObj = new LSObjstructure();
        window.localStorage.setItem("needRefresh", JSON.stringify(localObj));
    }
}

/**
 * localstorage 存储对象
 */
class LSObjstructure {
    needRefresh: boolean = false;
}