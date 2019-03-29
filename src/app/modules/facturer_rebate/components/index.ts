import { RebateAppComponent } from './facturer_rebate-app.component';
import { RebateList } from './facturer_rebate-list/list.component';
import { RebateIndex } from './facturer_rebate-index/index.component';
import { RebateNew_Edit } from './facturer_rebate-new-edit/new_edit.component';
import { RebateScan } from './facturer_rebate-scan/scan.component';
// 动态组件
import { RebateInfo } from './facturer_rebate-info/info.component';


export {
    RebateAppComponent,
    RebateList,
    RebateNew_Edit,
    RebateScan,
    RebateIndex,
    RebateInfo
}

export let Rebate_Entry_Component = [
    RebateInfo
]

export let Rebate_App_Component = [
    RebateAppComponent,
    RebateList,
    RebateNew_Edit,
    RebateScan,
    RebateIndex,
    RebateInfo
]