import { dbomsPath } from "../../../../../../../environments/environment";
declare var window: any;

/**
 * 产品明细  模板地址
 */
export const producttpladdress = dbomsPath + "/assets/downloadtpl/产品明细模板.xlsx";
/**
 * 多送货地址 模板地址
 */
export const multipleAddress = dbomsPath + "/assets/downloadtpl/多送货地址模板.xlsx";

/**
 * 电子合同 业务处理公共类
 */
export class EcContractCommonClass {

    /**
     * 付款方式 数据源 硬件
     */
    Payment: Array<any> = [
        { id: 'Ticket', text: '(1)票据方式一次性付清' }, 
        { id: 'Transfer', text: '(2)转账/电汇方式一次性付清' }, 
        { id: 'Once-Period', text: '(3)一次性交货,分批付款' }, 
        { id: 'Period-Period', text: '(4)分期交货,分期付款' }, 
        { id: 'Full', text: '(5)全款到账发货' }, 
        { id: 'Once-Period2', text: '(6)一次性交货,分批付款(电汇)' }, 
        { id: 'Customize', text: '(7)其他' }
    ];
    /**
     * 付款方式 数据源 软件
     */
    PaymentSoftwar: Array<any> = [
        { id: 'Ticket', text: '(1)票据方式一次性付清' }, 
        { id: 'Transfer', text: '(2)转账/电汇方式一次性付清' }, 
        { id: 'Once-Period', text: '(3)一次性交付，分批付款' }, 
        { id: 'Period-Period', text: '(4)分期交付，分期付款' }, 
        { id: 'Full', text: '(5)全款到账交付' }, 
        { id: 'Once-Period2', text: '(6)一次性交货，分批付款' }, 
        { id: 'Customize', text: '(7)其他' }
    ];
    /**
     * 付款方式 数据源 服务
     */
    PaymentService: Array<any> = [
        { id: 'Ticket', text: '(1)票据方式一次性付清' }, 
        { id: 'Transfer', text: '(2)转账/电汇方式一次性付清' }, 
        { id: 'Once-Period', text: '(3)一次性交付，分批付款' }, 
        { id: 'Period-Period', text: '(4)分期交付，分期付款' }, 
        { id: 'Full', text: '(5)全款到账交付' }, 
        { id: 'Once-Period2', text: '(6)一次性交货，分批付款' }
    ];
    /**
     * 付款方式 数据源 华为转售服务
     */
    PaymentServiceHuaWei: Array<any> = [
        { id: 'Ticket', text: '(1)票据方式一次性付清' }, 
        { id: 'Transfer', text: '(2)转账/电汇方式一次性付清' }, 
        { id: 'Once-Period', text: '(3)一次性激活服务，分批付款' }, 
        { id: 'Once-Period1', text: '(4)一次性激活服务，分批付款' }, 
        { id: 'Period-Period', text: '(5)分期激活服务，分期付款' },
        { id: 'Full', text: '(6)款到帐激活服务' }
    ];
    /**
     * 付款方式 数据源 华为自有服务
     */
    PaymentServiceHuaWeiOwn: Array<any> = [
        { id: 'Ticket', text: '(1)票据方式一次性付清' }, 
        { id: 'Transfer', text: '(2)转账/电汇方式一次性付清' }, 
        { id: 'Once-Period', text: '(3)一次性交货，分批付款' }, 
        { id: 'Period-Period', text: '(4)分期服务，分期付款' }, 
        { id: 'Full', text: '(5)款到帐提供服务' }
    ];
    
    /**根据templateID 返回电子合同页面路由地址 */
    returnECRouterUrlByTemplateID(templateID) {
        let ecPageRouteUrl = "india/tplmake";
        switch (templateID) {
            case "Inland_Hardware_Common"://硬件通用版
                ecPageRouteUrl = "india/tplmake";
                // ecPageRouteUrl = "india/hardwaregeneralredo";
                break;
            case "Inland_Hardware_HuaSan"://硬件华三
                ecPageRouteUrl = "india/hchinathree";
                break;
            case "Inland_Software_Standard"://软件标准
                ecPageRouteUrl = "india/softwarestandard";
                break;
            case "Inland_Software_Micro"://软件微软
                ecPageRouteUrl = "india/softwaremicro";
                break;
            case "Inland_Software_Adobe"://软件微软
                ecPageRouteUrl = "india/softwareadobe";
                break;
            case "Inland_Service_Original"://服务 原厂
                ecPageRouteUrl = "india/inlandserviceoriginal";
                break;
            case "Inland_Service_NonOriginal"://服务 非原厂
                ecPageRouteUrl = "india/inlandservicenonoriginal";
                break;
            case "Inland_Service_HuaWeiReSell"://华为服务 转售
                ecPageRouteUrl = "india/huaweiserviceresale";
                break;
            case "Inland_Service_HuaWeiOwned"://华为自有服务
                ecPageRouteUrl = "india/huaweiownservice";
                break;
            default://其它
                break;
        }
        return ecPageRouteUrl;
    }

    /**
     * 根据付款方式返回小标题
     */
    returnTitleByPayType(templateID, paymentType) {
        let title = "";
        switch (templateID) {
            case "Inland_Hardware_Common"://硬件通用版
                switch (paymentType) {
                    case "Ticket":
                        title = "票据方式一次性付清";
                        break;
                    case "Transfer":
                        title = "转账/电汇方式一次性付清";
                        break;
                    case "Once-Period":
                        title = "一次性交货，分批付款";
                        break;
                    case "Period-Period":
                        title = "分期交货，分期付款";
                        break;
                    case "Full":
                        title = "全款到账发货";
                        break;
                    case "Once-Period2":
                        title = "一次性交货，分批付款";
                        break;
                    default:
                        title = "自定义条款";
                        break;
                }
                break;
            case "Inland_Hardware_HuaSan"://硬件华三
                switch (paymentType) {
                    case "Ticket":
                        title = "票据方式一次性付清";
                        break;
                    case "Transfer":
                        title = "转账/电汇方式一次性付清";
                        break;
                    case "Once-Period":
                        title = "一次性交货，分批付款";
                        break;
                    case "Period-Period":
                        title = "分期交货，分期付款";
                        break;
                    case "Full":
                        title = "全款到账发货";
                        break;
                    case "Once-Period2":
                        title = "一次性交货，分批付款";
                        break;
                    default:
                        title = "自定义条款";
                        break;
                }
                break;
            case "Inland_Software_Standard"://软件标准
            case "Inland_Software_Micro"://软件微软
            case "Inland_Software_Adobe"://软件微软
                switch (paymentType) {
                    case "Ticket":
                        title = "票据方式一次性付清";
                        break;
                    case "Transfer":
                        title = "转账/电汇方式一次性付清";
                        break;
                    case "Once-Period":
                        title = "一次性交付，分批付款（票据）";
                        break;
                    case "Period-Period":
                        title = "分期交付，分期付款";
                        break;
                    case "Full":
                        title = "全款到账交付";
                        break;
                    case "Once-Period2":
                        title = "一次性交货，分批付款";
                        break;
                    default:
                        title = "自定义条款";
                        break;
                }
                break;
            case "Inland_Service_Original"://服务 原厂
            case "Inland_Service_NonOriginal"://服务 非原厂
                switch (paymentType) {
                    case "Ticket":
                        title = "票据方式一次性付清";
                        break;
                    case "Transfer":
                        title = "转账/电汇方式一次性付清";
                        break;
                    case "Once-Period":
                        title = "一次性交付，分批付款";
                        break;
                    case "Period-Period":
                        title = "分期交付，分期付款";
                        break;
                    case "Full":
                        title = "全款到账交付";
                        break;
                    case "Once-Period2":
                        title = "一次性交货，分批付款";
                        break;
                    default:
                        title = "自定义条款";
                        break;
                }
                break;
            case "Inland_Service_HuaWeiReSell"://服务 华为转售
                switch (paymentType) {
                    case "Ticket":
                        title = "票据方式一次性付清";
                        break;
                    case "Transfer":
                        title = "转账/电汇方式一次性付清";
                        break;
                    case "Once-Period":
                        title = "一次性激活服务，分批付款";
                        break;
                    case "Once-Period1":
                        title = "一次性激活服务，分批付款";
                        break;
                    case "Period-Period":
                        title = "分期激活服务，分期付款";
                        break;
                    case "Full":
                        title = "款到帐激活服务";
                        break;
                }
                break;
                case "Inland_Service_HuaWeiOwned"://服务 华为自有
                    switch (paymentType) {
                        case "Ticket":
                            title = "票据方式一次性付清";
                            break;
                        case "Transfer":
                            title = "转账/电汇方式一次性付清";
                            break;
                        case "Once-Period":
                            title = "一次性交货，分批付款";
                            break;
                        case "Period-Period":
                            title = "分期服务，分期付款";
                            break;
                        case "Full":
                            title = "款到帐提供服务";
                            break;
                    }
                    break;
        }
        return title;
    }
    
    /**
     * 根据付款方式返回付款内容文本
     */
    returnPayItemByPayType(data, money?) {
        let content = "";
        let templateID = data["TemplateID"];
        let paymentType = data["PaymentType"];
        switch (templateID) {
            case "Inland_Hardware_Common"://硬件通用版
            case "Inland_Hardware_HuaSan"://硬件华三
                switch (paymentType) {
                    case 'Ticket':
                        content = `卖方发货前，买方交付给卖方一张自发货之日起${data.PayType_Ticket_Day}日的${data.PayType_Ticket_TypeName}用于支付合同货款（以款到卖方账户为准），${data.PayType_Ticket_TypeName}金额：${money}元。 在买方向卖方支付上述票据前，卖方有权拒绝发货并不承担逾期交货的违约责任；同时买方保证在卖方发货之日起${data.PayType_Ticket_Day}日内该票据能够足额兑付。如未能兑付或未能足额兑付，则买方仍应继续完成付款义务。`;
                        break;
                    case 'Transfer':
                        content = `买方于卖方发货之日起${data.PayType_Transfer_Day}日内付清货款。`;
                        break;
                    case 'Once-Period':
                        let temp = `合同总价款的${data.PayType_OP_Ratio}%(${data.PayType_OP_Money}元)`;
                        if (!data.PayType_OP_Ratio) {
                            temp = `${data.PayType_OP_Money}元`;
                        }
                        content = `本合同签订之日起三日内，买方向卖方支付${temp}作为预付款。卖方发货前，买方交付给卖方一张自发货之日起${data.PayType_OP_Day}日的${data.PayType_OP_TicketName}于支付合同货款（以款到卖方账户为准），${data.PayType_OP_TicketName}金额：${money}元。在买方向卖方支付合同约定预付款和上述票据前， 卖方有权拒绝发货并不承担逾期交货的违约责任；买方保证在卖方发货之日起${data.PayType_OP_Day}日内付清剩余货款，即${money}元。`;
                        break;
                    case 'Period-Period':
                        let tempPayType_OP_Ratio = `合同总价款的${data.PayType_PP_Ratio}%(${data.PayType_PP_Money}元)`;
                        if (!data.PayType_PP_Ratio) {
                            tempPayType_OP_Ratio = `${data.PayType_PP_Money}元`;
                        }
                        content = `本合同签订之日起三日内，买方向卖方支付${tempPayType_OP_Ratio}作为预付款， 买方需在每次发货前交付给卖方一张自发货之日起 ${data.PayType_PP_Day}日的${data.PayType_PP_TicketName}用于支付合同货款（以款到卖方账户为准）， ${data.PayType_PP_TicketName}金额等于每次发货的产品销售金额，在买方向卖方交付预付款和上述票据前，卖方有权拒绝发货并不承担逾期交货的违约责任；买方保证在卖方发货之日起  ${data.PayType_PP_Day}日内付清对应货款。本款约定之预付款仅用作冲抵最后一笔应付货款。`;
                        break;
                    case 'Full':
                        content = `买方于本合同生效之日起${data.PayType_Full_Day}日内向卖方一次性支付全部货款，卖方在收到买方全部货款后发货；在买方向卖方支付合同约定货款前，卖方有权拒绝发货并不承担逾期交货的违约责任。`;
                        break;
                    case "Once-Period2":
                        let PayType_OP2_Ratio = `合同总价款的${data.PayType_OP2_Ratio}%(${data.PayType_OP2_Money}元)`;
                        if (!data.PayType_OP2_Ratio) {
                            PayType_OP2_Ratio = `${data.PayType_OP2_Money}元`;
                        }
                        content = `本合同签订之日起${data.PayType_OP2_SignDay}日内，买方向卖方支付${PayType_OP2_Ratio}作为预付款，在买方向卖方支付合同约定预付款前，卖方有权拒绝发货并不承担逾期交货的违约责任，同时买方保证在卖方发货之日起${data.PayType_OP2_SendDay}日内付清剩余货款，即${money}元。`;
                        break;
                    default:
                        content = data.PayType_Customize;
                }
                break;
            case "Inland_Software_Standard"://软件标准
            case "Inland_Software_Micro"://软件标准
            case "Inland_Software_Adobe"://软件标准
                switch (paymentType) {
                    case 'Ticket':
                        content = `卖方发货前，买方交付给卖方一张自发货之日起${data.PayType_Ticket_Day}日的${data.PayType_Ticket_TypeName}用于支付合同货款（以款到卖方账户为准），${data.PayType_Ticket_TypeName}金额：${money}元。在买方向卖方支付上述票据前，卖方有权拒绝发货并不承担逾期交货的违约责任；同时买方保证在卖方发货之日起${data.PayType_Ticket_Day}日内该票据能够足额兑付。如未能兑付或未能足额兑付，则买方仍应完成付款义务。`;
                        break;
                    case 'Transfer':
                        content = `买方于本合同生效之日起${data.PayType_Transfer_Day}日内付清货款。`;
                        break;
                    case 'Once-Period':
                        let temp = `合同总价款的${data.PayType_OP_Ratio}%(${data.PayType_OP_Money}元)`;
                        if (!data.PayType_OP_Ratio) {
                            temp = `${data.PayType_OP_Money}元`;
                        }
                        content = `本合同生效之日起三日内，买方向卖方支付${temp}作为预付款。卖方发货前，买方交付给卖方一张自本合同生效之日起${data.PayType_OP_Day}日的${data.PayType_OP_TicketName}于支付合同货款（以款到卖方账户为准），${data.PayType_OP_TicketName}金额：${money}元。在买方向卖方支付合同约定预付款和上述票据前， 卖方有权拒绝发货并不承担逾期交货的违约责任；买方保证在本合同生效之日起${data.PayType_OP_Day}日内付清剩余货款，即${money}元。`;
                        break;
                    case 'Period-Period':
                        let tempPayType_OP_Ratio = `合同总价款的${data.PayType_PP_Ratio}%(${data.PayType_PP_Money}元)`;
                        if (!data.PayType_PP_Ratio) {
                            tempPayType_OP_Ratio = `${data.PayType_PP_Money}元`;
                        }
                        content = `卖方分批交付，本合同生效之日起三日内，买方向卖方支付${tempPayType_OP_Ratio}作为预付款， 买方需在每次发货前交付给卖方一张自本合同生效之日起 ${data.PayType_PP_Day}日的${data.PayType_PP_TicketName}用于支付合同货款（以款到卖方账户为准）， ${data.PayType_PP_TicketName}金额等于每次交付的产品销售金额，在买方向卖方交付预付款和上述票据前，卖方有权拒绝交付并不承担逾期交付的违约责任；买方保证在本合同生效之日起${data.PayType_PP_Day}日内付清对应货款。本款约定之预付款仅用作冲抵最后一笔应付货款。`;
                        break;
                    case 'Full':
                        content = `买方于本合同生效之日起${data.PayType_Full_Day}日内向卖方一次性支付全部货款，卖方在收到买方全部货款后交付；在买方向卖方支付合同约定货款前，卖方有权拒绝交付并不承担逾期交付的违约责任。`;
                        break;
                    case "Once-Period2":
                        let PayType_OP2_Ratio = `合同总价款的${data.PayType_OP2_Ratio}%(${data.PayType_OP2_Money}元)`;
                        if (!data.PayType_OP2_Ratio) {
                            PayType_OP2_Ratio = `${data.PayType_OP2_Money}元`;
                        }
                        content = `本合同签订之日起${data.PayType_OP2_SignDay}日内，买方向卖方支付${PayType_OP2_Ratio}作为预付款，在买方向卖方支付合同约定预付款前，卖方有权拒绝发货并不承担逾期交货的违约责任，同时买方保证在卖方发货之日起${data.PayType_OP2_SendDay}日内付清剩余货款，即${money}元。`;
                        break;
                    default:
                        content = data.PayType_Customize;
                }
                break;
            case "Inland_Service_Original"://服务 原厂
            case "Inland_Service_NonOriginal"://服务 非原厂
                switch (paymentType) {
                    case 'Ticket':
                        content = `本合同生效之日起${data.PayType_Ticket_EffectiveDay}日内，买方交付给卖方一张自本合同生效之日起${data.PayType_Ticket_Day}日的${data.PayType_Ticket_TypeName}用于支付本合同项下的全部款项（以款到卖方账户为准），${data.PayType_Ticket_TypeName}金额：${data.TotalMoney}元（大写：${data.TotalMoneyUpper}）。同时，买方保证自本合同生效之日起${data.PayType_Ticket_Day}日内付清合同款项。`;
                        break;
                    case 'Transfer':
                        content = `买方于本合同生效之日起${data.PayType_Transfer_Day}日内付清合同款项。`;
                        break;
                    case 'Once-Period':
                        let temp = `合同总价款的${data.PayType_OP_Ratio}%(${data.PayType_OP_Money}元)`;
                        if (!data.PayType_OP_Ratio) {
                            temp = `${data.PayType_OP_Money}元`;
                        }
                        content = `本合同生效之日起${data.PayType_OP_SigDay}日内，买方向卖方支付${temp}作为预付款，剩余合同款项在交付（开通）服务或服务起始之日起${data.PayType_OP_Day}日内全部付清。`;
                        break;
                    case 'Period-Period':
                        let tempPayType_OP_Ratio = `合同总价款的${data.PayType_PP_Ratio}%(${data.PayType_PP_Money}元)`;
                        if (!data.PayType_PP_Ratio) {
                            tempPayType_OP_Ratio = `${data.PayType_PP_Money}元`;
                        }
                        let payTypePPTotalMoney = data.TotalMoney - Number(data.PayType_PP_Money);
                        let payTypePPTotalMoneyUppercase = this.DX(payTypePPTotalMoney);
                        content = `本合同生效之日起${data.PayType_PP_EffectiveDay}日内，买方向卖方支付${tempPayType_OP_Ratio}作为预付款，在服务交付（开通）前，买方交付给卖方一张自本合同生效之日起${data.PayType_PP_Day}日的${data.PayType_PP_TicketName}用于支付本合同项下的剩余款项（以款到卖方账户为准），${data.PayType_PP_TicketName}金额：${payTypePPTotalMoney}元（大写：${payTypePPTotalMoneyUppercase}）。同时，买方保证自本合同生效之日起${data.PayType_PP_Day}日内付清合同款项。`;
                        break;
                    case 'Full':
                        content = `买方于本合同生效之日起${data.PayType_Full_Day}日内向卖方支付合同款项，卖方在收到买方全部款项后向买方（或买方指定的最终用户）交付（开通）或提供服务。`;
                        break;
                    case "Once-Period2":
                        content = `本合同生效后, 买方向卖方按以下付款方式分期付款,卖方分期向买方提供增值税服务${data.PayType_OP2_TicketName}发票。`;
                        break;
                    default:
                        content = data.PayType_Customize;
                }
                break;
            case "Inland_Service_HuaWeiReSell"://服务 华为转售
                switch (paymentType) {
                    case 'Ticket':
                        content = `自本合同签订之日起3日内，甲方交付给乙方一张自合同签订之日起${data.PayType_Ticket_Day}天的${data.PayType_Ticket_TypeName}用于支付合同款项（以款到乙方帐户为准），${data.PayType_Ticket_TypeName}金额：${data.TotalMoney}元。乙方收到合同约定的${data.PayType_Ticket_TypeName}后，向原厂商下单激活并开具${data.Payment_InvoiceTaxRate}%税率的增值税服务费发票，乙方未收到合同约定的${data.PayType_Ticket_TypeName}乙方有权拒绝激活服务并不承担逾期激活服务的违约责任。`;
                        break;
                    case 'Transfer':
                        content = `自本合同签订生效后3日内，乙方向原厂商下单激活服务，甲方于本合同签订之日起${data.PayType_Transfer_Day}日内一次性付清合同款项，乙方开通服务后开具${data.Payment_InvoiceTaxRate}%税率的增值税服务费发票。`;
                        break;
                    case 'Once-Period':
                        let temp = `合同总价款的${data.PayType_OP_Ratio}%(${data.PayType_OP_Money}元)`;
                        if (!data.PayType_OP_Ratio) {
                            temp = `${data.PayType_OP_Money}元`;
                        }
                        let payTypeOPTotalMoney = data.TotalMoney - Number(data.PayType_OP_Money);
                        content = `本合同签订之日起三日内，甲方向乙方支付${temp}作为预付款；剩余尾款甲方向乙方开具一张入账日期为${data.Payment_BillDate}的${data.PayType_OP_TicketName}用于支付合同款项（以款到乙方帐户为准），${data.PayType_OP_TicketName}金额：${payTypeOPTotalMoney}元；乙方在收到甲方的预付款和${data.PayType_OP_TicketName}后向原厂商下单激活服务，并开具${data.PayType_OP_Money}金额的${data.Payment_InvoiceTaxRate}%税率的增值税服务费发票。在甲方向乙方支付合同约定的预付款和${data.PayType_OP_TicketName}前，乙方有权拒绝向原厂商下单激活服务并不承担任何违约责任；甲方保证在乙方向原厂商下单激活服务后${data.PayType_OP_SigDay}日内付清剩余尾款，即${data.payTypeOPTotalMoney}元。`;
                        break;
                    case "Once-Period1":
                        let tempOP2 = `合同总价款的${data.PayType_OP2_Ratio}%(${data.PayType_OP2_Money}元)`;
                        if (!data.PayType_OP2_Ratio) {
                            tempOP2 = `${data.PayType_OP2_Money}元`;
                        }
                        content = `本合同签订之日起三日内，甲方向乙方支付${tempOP2}作为预付款；剩余尾款甲方在本合同签订之日起${data.PayType_OP2_SigDay}天内付清，乙方在收到甲方的预付款后向原厂商下单激活服务，并开具${data.PayType_OP2_Money}金额的${data.Payment_InvoiceTaxRate}%税率的增值税服务费发票。`;
                        break;
                    case 'Period-Period':
                        let tempPayType_PP_Ratio = `合同总价款的${data.PayType_PP_Ratio}%(${data.PayType_PP_Money}元)`;
                        if (!data.PayType_PP_Ratio) {
                            tempPayType_PP_Ratio = `${data.PayType_PP_Money}元`;
                        }
                        content = `乙方分批激活服务，本合同签订之日起三日内，甲方向乙方支付${tempPayType_PP_Ratio}作为预付款，甲方需在每次激活服务前交付给乙方一张自激活服务之日起${data.PayType_PP_Day}天的${data.PayType_PP_TicketName}用于支付合同款项（以款到乙方帐户为准），${data.PayType_PP_TicketName}金额等于每次激活服务的服务销售金额，开具的发票金额等同于每次激活服务的服务销售金额，在甲方向乙方交付预付款和${data.PayType_PP_TicketName}前，乙方有权拒绝激活服务并不承担逾期激活服务的违约责任；甲方保证在乙方激活服务之日起${data.PayType_PP_Day}日内付清对应合同款项，预付款冲抵最后一笔应付合同款项。`;
                        break;
                    case 'Full':
                        content = `甲方于本合同生效之日起${data.PayType_Full_Day}日内向乙方支付合同款款，乙方在收到甲方全部合同款项款后激活服务并开具${data.Payment_InvoiceTaxRate}%税率的增值税服务费发票，在甲方向乙方支付全部合同款项前，乙方有权拒绝激活服务并不承担逾期激活服务的违约责任。`;
                        break;
                    default:
                        content = data.PayType_Customize;
                }
                break;
            case "Inland_Service_HuaWeiOwned"://服务 华为自有
                switch (paymentType) {
                    case 'Ticket':
                        content = `自本合同签订之日起3日内，甲方交付给乙方一张自合同签订之日起${data.PayType_Ticket_Day}天的${data.PayType_Ticket_TypeName}用于支付合同款项（以款到乙方帐户为准），${data.PayType_Ticket_TypeName}金额：${data.TotalMoney}元。在甲方向乙方支付合同约定${data.PayType_Ticket_TypeName}前，乙方有权拒绝提供服务并不承担任何违约责任；同时甲方保证在自合同签订之日起${data.PayType_Ticket_Day}日内付清合同款项。`;
                        break;
                    case 'Transfer':
                        content = `甲方于本合同签订之日起${data.PayType_Transfer_Day}日内一次性付清合同款项。`;
                        break;
                    case 'Once-Period':
                        let temp = `合同总价款的${data.PayType_OP_Ratio}%(${data.PayType_OP_Money}元)`;
                        if (!data.PayType_OP_Ratio) {
                            temp = `${data.PayType_OP_Money}元`;
                        }
                        let payTypeOPTotalMoney = data.TotalMoney - Number(data.PayType_OP_Money);
                        content = `本合同签订之日起三日内，甲方向乙方支付${temp}作为预付款，乙方提供服务前，甲方交付给乙方一张自合同签订之日起${data.PayType_OP_Day}天的${data.PayType_OP_TicketName}用于支付合同款项（以款到乙方帐户为准），${data.PayType_OP_TicketName}金额：${payTypeOPTotalMoney}元。 在甲方向乙方支付合同约定预付款和${data.PayType_OP_TicketName}前，乙方有权拒绝提供服务并不承担任何违约责任；甲方保证在合同签订之日起${data.PayType_OP_Day}日内付清剩余合同款项，即${data.PayType_OP_Money}元。`;
                        break;
                    case 'Period-Period':
                        let tempPayType_PP_Ratio = `合同总价款的${data.PayType_PP_Ratio}%(${data.PayType_PP_Money}元)`;
                        if (!data.PayType_PP_Ratio) {
                            tempPayType_PP_Ratio = `${data.PayType_PP_Money}元`;
                        }
                        content = `本合同签订之日起三日内，甲方向乙方支付${tempPayType_PP_Ratio}作为预付款，甲方需在每次提供服务前交付给乙方一张自提供服务之日起${data.PayType_PP_Day}天的${data.PayType_PP_TicketName}用于支付合同款项（以款到乙方帐户为准），${data.PayType_PP_TicketName}金额等于每次提供服务的货物销售金额，在甲方向乙方交付预付款和${data.PayType_PP_TicketName}前，乙方有权拒绝提供服务并不承担任何违约责任；甲方保证在乙方提供服务之日起${data.PayType_PP_Day}日内付清对应合同款项，预付款冲抵最后一笔应付合同款项。`;
                        break;
                    case 'Full':
                        content = `甲方于本合同生效之日起${data.PayType_Full_Day}日内向乙方支付合同款项，乙方在收到甲方全部合同款项后提供服务，在甲方向乙方支付全部合同款项前，乙方有权拒绝提供服务并不承担任何违约责任。`;
                        break;
                    default:
                        content = data.PayType_Customize;
                }
                break;
        }

        return content;
    }

    /**根据交付方式返回交付小标题 */
    returnTitleByDeliveryMode(DeliveryMode){
        let title = "";
        switch (DeliveryMode) {
            case "1":
                title = "电子邮件交付";
                break;
            case "2":
                title = "电子邮件+实物交付";
                break;
            default:
                break;
        }
        return title;
    }
    /** 华为本部 产品明细 备注必填及单价是否一致校验 */
    validProductsHuaWei(products:any[] = []){
        let validInfo = {};
        let groupByRemarkArray = [];//{Remark:"", arr: []}
        if (products.length > 0) {
            products.forEach((proItem, proIndex, proArr) => {
                products[proIndex]["Remark"] = products[proIndex]["Remark"].toString().trim();
                if (groupByRemarkArray.length == 0) {
                    let groupByRemarkItem = {Remark:proItem["Remark"], arr: []};
                    groupByRemarkItem.arr.push(proItem);
                    groupByRemarkArray.push(groupByRemarkItem);
                }else{
                    for (let grIndex = 0; grIndex < groupByRemarkArray.length; grIndex++) {
                        let grItem = groupByRemarkArray[grIndex];
                        let hasRemark = groupByRemarkArray.filter((item,index,arr)=>{ return item["Remark"] == proItem["Remark"]; });
                        if (hasRemark.length > 0) {
                            if (grItem.arr && grItem.arr.length > 0) {
                                if (grItem.arr.indexOf(proItem) == -1 && proItem["Remark"] == grItem["Remark"]) {
                                    grItem.arr.push(proItem);
                                    break;
                                }
                            }
                        }else{
                            let groupByRemarkItem = {Remark:proItem["Remark"], arr: []};
                            groupByRemarkItem.arr.push(proItem);
                            groupByRemarkArray.push(groupByRemarkItem);
                            break;
                        }
                    }
                }
            });
        }
        return validInfo;
    }
    /** 数字转化为大写中文 */
    DX(n) {
        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
        return "数据非法";
        var unit = "千百拾亿千百拾万千百拾元角分", str = "";
        n += "00";
        var p = n.indexOf('.');
        if (p >= 0)
        n = n.substring(0, p) + n.substr(p + 1, 2);
        unit = unit.substr(unit.length - n.length);
        for (var i = 0; i < n.length; i++)
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    }
}