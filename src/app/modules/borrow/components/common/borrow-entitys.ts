export class UnClearItem {//未清项实体
    public platformCode: string;//平台编码
    public deliveryAddress: string;//送货地址
    public baseDeptName: string;//本部
    public voucherNo1: string;//凭证号1
    public voucherNo2: string;//凭证号2
    public borrowDate: string;//借用日期
    public giveBackDay: string;//预计归还日期
    public projectName: string;//项目名称
    public applyUserName: string;//申请人姓名
    public applyItCode: string;//申请人ItCode
    public factory: string;//工厂
    public reservationNo: string;//预留号
    public contactPhone: string;//联系方式
    public unClearId: string;//实体Id
    public subDeptName: string;//事业部
    public borrowAttributeName: string;//借用属性
    public businessScope: string;//业务范围
    public borrowAttributeCode: string;//借用属性编码
    public operatingBorrow: number;//是否经营性借用 0：否；1：是
    public borrowTypeName: string;//借用类型
    public applyUserNo: string;//申请人编号
    public deliveryAddressId: string;//送货地址Id
    public inventory: string;//库存地
    public borrowTypeCode: string;//借用类型编码
    public platformName: string;//平台名称
    public borrowCustomerName: string;//借用客户名称
    public overdueDays?: number;//超期天数
    public borrowStoreHouse: string;//借用库
}
export class UnclearMaterialItem {//未清项物料实体
    public unit: string;//单位
    public meterialMemo: string;//物料描述
    public price: number;//移动平均价
    public factory: string;//工厂
    public meterialNo: string;//物料编号
    public count: number;//数量
    public unClearId: string;//未清项实体Id
    public onwayStore: string;//借用在途库
    public unclearMaterialId: string;//实体Id
    public batch: string;//批次
    public totalAmount: number;//总价
    public rtnCount: number;//归还数量
    public usableCount: number;//可用数量
}
export class UnClearItemEntity {//未清项以及物料块
    public unClearItem: UnClearItem;
    public unclearMaterialItemList: UnclearMaterialItem[] = [];
}
export class Inventory {
    public storeHouseCode: string;
}
export class SelectOption {
    public id: number;
    public createDate: string;
    public lastModifiedDate: string;
    public org: 1;
    public createBy: string;
    public lastModifiedBy: string;
    public code: string;
    public parentCode: string;
    public name: string;
    public type: string
}

export class ApplyUser {
    itcode: string;
    personNo: string;
    name: string;
    mobile: string;
    depName: string;
    department: string;
    platformCode: string;
    platformName: string;
    org: string;
    orgName: string;
    orgCode: string
}

export class PersonnelInfo {
    public frozenItCode: string;
    public frozenUserName: string;
    public frozenUserNo: string;
    public freeResult: number;
    public createBy: string;
    public createDate: string;
    public id: string;
    public lastModifiedBy: string;
    public lastModifiedDate: string;
    public org: string;
}

export class DeliveryAddress {//送货地址实体类
    public area: string; //地区
    public city: string; //城市
    public contactName: string; //联系人
    public contactTel: string; //联系人电话
    public createBy: string;
    public createDate: string;
    public customerName: string; //客户名称
    public deliveryAddress: string;//送货地址
    public deliveryAddressId: string;//送货地址实体ID
    public deliveryName: string;//送货单位名称
    public id: string;
    public lastModifiedBy: string;
    public lastModifiedDate: string;
    public org: string
    public province: string;//省（市）
    public standarSign: string;//签收标准
    public zipCode: string;//邮政编码

}

export class BaseCityCounty {//城市、地区实体类

    public id: string;
    public text: string;

}
//浮动层的用户信息
export class UserInfo {
    public userCN: string;//名字
    public userEN: string;//itcode
    public userID:string;
    public headName: string;//本部名称
    public departName: string;//事业部名称
    public platName: string;//归属平台
}