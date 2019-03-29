import { Component, OnInit } from "@angular/core";

export class RequiredTypeComponent implements OnInit {
  //承诺管理（华为）必填项及对应承诺类型的提示文字
  requiredTypeList = [
    {
      Code: "0001", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: true, //账期条件
      isFksfqrdd: true, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: true, //三级审批人
      isSYBApprove4: true, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、多项承诺时，需填写每一项未满足条件的具体原因及每一项承诺达成具体时间 。
2、关于延期支票，需注明是否有扫描件。
3、关于合同，需注意详细进度；（例：客户是否盖章，我方是否盖章；我方盖章流程流转到哪个环节。）
4、关于超期，需注明是我部门内超期还是其他部门超期。`
    },
    {
      Code: "0002", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: true, //账期条件
      isFksfqrdd: true, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: true, //三级审批人
      isSYBApprove4: true, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `需填写具体满足条件的时间，
关于合同，请写清楚哪方已经盖章？
关于预付款及票据情况，请写清楚条件。
关于是否压库，请写清楚最晚交货时间，如果是分批交货也请说明交货的节奏。
是否超期，要写清楚是我部门超期还是其他部门超期。`
    },
    {
      Code: "0003", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: true, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: true, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: true, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、需填写无法正常开销售的具体原因。
2、客户支付方式（例：现结，支票，电汇），帐期从哪天开始计算。
3、借用设备签收标准，是否与合同一致。`
    },
    {
      Code: "0004", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: true, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0005", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: true, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0006", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: true, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0007", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、银票的票号及金额、银票到期日。
2、银票需要出具哪家公司什么原因的证明文件。`
    },
    {
      Code: "0008", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `哪些条件不满足?`
    },
    {
      Code: "0009", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、需填写销售暂存的具体原因。
2、暂存出库时间，是否会跨月？`
    },
    {
      Code: "0010", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、需填写自提改直发具体原因。
2、需注明客户签收单原件返还时间及销售开单时间。
3、多项承诺时，需填写每一项未满足条件的具体原因及每一项承诺达成具体时间 。
4、关于延期支票，需注明是否有扫描件。
5、关于合同，需注意详细进度；（例：客户是否盖章，我方是否盖章；我方盖章流程流转到哪个环节。）
6、关于超期，需注明是我部门内超期还是其他部门超期。`
    },
    {
      Code: "0011", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: false, //项目名称
      isContractID: true, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: true, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、缺少什么材料不能直接走采购申请？不能签回材料原因。
2、项目是否排产`
    },
    {
      Code: "0012", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: true, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0013", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0014", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、使用售前账号原因：是否是自己和其他同区域的销售账号被冻结，本次借用项目名称，并请备注本人账号下的超期借用项目名称及清理时间
2、需说明借用类型（售前签单；评测；宣传；维修；物流借用）。
3、提供售前同意邮件截图或其他证明截图，上传至附件。`
    },
    {
      Code: "0015", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: true, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: true, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、需填写付款条件中哪些是扫描件，哪些是原件。
2、需注明不能提供原件的具体原因。`
    },
    {
      Code: "0016", //承诺类型代码
      isPlatform: true, //平台
      isAgent: false, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: true, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: `1、需注明申请类别。 
2、需注明不满足条件具体原因。`
    },
    {
      Code: "0017", //承诺类型代码
      isPlatform: true, //平台
      isAgent: false, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0018", //承诺类型代码
      isPlatform: true, //平台
      isAgent: false, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: false, //合同金额
      isYcode: false, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0019", //承诺类型代码
      isPlatform: true, //平台
      isAgent: false, //代理商
      isContractName: false, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: true, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    },
    {
      Code: "0020", //承诺类型代码
      isPlatform: true, //平台
      isAgent: true, //代理商
      isContractName: true, //项目名称
      isContractID: false, //合同编号或者希望发货日期
      isContractMoney: true, //合同金额
      isYcode: true, //10Y号
      isProductLline: false, //产品线
      isAccountterm: false, //账期条件
      isFksfqrdd: false, //是否确认付款订单
      isCommitTypeCode: true, //承诺类型
      isCommitDate: true, //承诺达成时间
      isCommitMatters: true, //承诺原因
      isfileUpLoad: false, //上传附件
      isSYBApprove1: true, //一级审批人
      isSYBApprove2: false, //二级审批人
      isSYBApprove3: false, //三级审批人
      isSYBApprove4: false, //四级审批人
      isSYBApprove5: false, //五级审批人
      LongestCommitTime: "", //最长承诺日期
      CommitMattersPlaceholder: ``
    }
  ];

  //审批JSON字符串
  
  //承诺类型0001的子类型

  morePromisedTypeList=[
    {
      code:'0001',
      list:[
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:未满足条件付款',//父承诺类型名称
      CommitTypeDetailedName:'延期支票未收取',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:未满足条件付款',//父承诺类型名称
      CommitTypeDetailedName:'预付款未到账',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:未满足条件付款',//父承诺类型名称
      CommitTypeDetailedName:'未签合同',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      }
    ]},
    {
      code:'0002',
      list:[
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:冲台阶不满足付款条件付款',//父承诺类型名称
      CommitTypeDetailedName:'未签合同',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:冲台阶不满足付款条件付款',//父承诺类型名称
      CommitTypeDetailedName:'预付款未到账',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:冲台阶不满足付款条件付款',//父承诺类型名称
      CommitTypeDetailedName:'延期支票未收取',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'A类:冲台阶不满足付款条件付款',//父承诺类型名称
      CommitTypeDetailedName:'压库',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      }
    ]},
    {
      code:'0008',
      list:[
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'B类:未满足条件排款',//父承诺类型名称
      CommitTypeDetailedName:'未签合同',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'B类:未满足条件排款',//父承诺类型名称
      CommitTypeDetailedName:'预付款未到账',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      },
      {TypeID:'',
      ApplyID:'',//申请编号ID
      CommitTypeName:'B类:未满足条件排款',//父承诺类型名称
      CommitTypeDetailedName:'延期支票未收取',//承诺子类型名称
      IsCommit:'否',//勾选状态
      IsDacheng:null,//达成状态
      isChecked:null//是否勾选
      }
    ]}
  ]

//审批人JSON字符串
  approvalPersonJSON:any=[{
    ID: 2,
    BizScopeCode: null,
    WFCategory: "承诺管理(华为)",
    TemplateID: "BACF76B7-299A-4E04-9DBE-831DF8A2149B",
    NodeID: 3,
    NodeName: "一级审批",
    IsOpened: 1,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 400,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 3,
    BizScopeCode: null,
    WFCategory: "承诺管理(华为)",
    TemplateID: "BACF76B7-299A-4E04-9DBE-831DF8A2149B",
    NodeID: 4,
    NodeName: "二级审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 425,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 4,
    BizScopeCode: null,
    WFCategory: "承诺管理(华为)",
    TemplateID: "BACF76B7-299A-4E04-9DBE-831DF8A2149B",
    NodeID: 5,
    NodeName: "三级审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 450,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 5,
    BizScopeCode: null,
    WFCategory: "承诺管理(华为)",
    TemplateID: "BACF76B7-299A-4E04-9DBE-831DF8A2149B",
    NodeID: 6,
    NodeName: "四级审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 475,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }, {
    ID: 6,
    BizScopeCode: null,
    WFCategory: "承诺管理(华为)",
    TemplateID: "BACF76B7-299A-4E04-9DBE-831DF8A2149B",
    NodeID: 8,
    NodeName: "五级审批",
    IsOpened: 0,
    UserSettings: "[]",
    ApproverList: "[]",
    NodeAttribute: "Editable",
    Sort: 475,
    RuleExpressionJSON: null,
    RoleID: null,
    IfRequired: null
  }]


  constructor() {}

  ngOnInit() {}
}
