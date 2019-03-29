/**
 *lichen - 2017-11-14
 *首页导航配置
 */
export const NAV_CONFIG = {
  nav_head: [
    {
      iqon: 'iqon-comment-o',
      title: '洽谈',
      slideState: 'out',
      list: [
        {
          isOpen: 'close',
          title: '投标',
          url: ''
        },
        {
          isOpen: 'close',
          title: '授权',
          notComplete: true,
          url: ''
        },
        {
          isOpen: 'close',
          title: '报价',
          url: ''
        },
        {
          isOpen: 'close',
          title: '资质',
          url: ''
        },
        {
          isOpen: 'close',
          title: '其他',
          url: ''
        }
      ]
    },
    {
      iqon: 'iqon-pencil',
      title: '签约',
      slideState: 'out',
      list: [
        {
          isOpen: 'close',
          title: '合同',
          children: [
            {name: '销售合同', url: 'india/selecttpl'},
            {name: '采购合同', url: ''},
            {name: '其他合同', url: ''}
          ]
        },
        {
          isOpen: 'close',
          title: '客户商务信息',
          url: ''
        }
      ]
    },
    {
      iqon: 'iqon-apply',
      title: '开单',
      slideState: 'out',
      list: [
        {
          isOpen: 'close',
          title: '销售单',
          url: 'order/order-normal?isModelOpen=true'
        },
        {
          isOpen: 'close',
          title: '票据',
          children: [
            {name: '支票', url: 'invoice/apply/invoice/-1'},
            {name: '商票', url: 'invoice/apply/tradeticket/-1'},
            {name: '银票', url: ''}
          ]
        }
      ]
    },
    {
      iqon: 'iqon-salary-o',
      title: '交付',
      slideState: 'out',
      list: [
        {
          isOpen: 'close',
          title: '物流配送跟踪',
          url: 'order/order-completed?saleType=0'
        },
        {
          isOpen: 'close',
          title: '货物暂存',
          url: ''
        },
        {
          isOpen: 'close',
          title: '借用',
          url: 'borrow/apply/borrow'
        },
        {
          isOpen: 'close',
          title: '借用归还',
          url: 'borrow/apply/rtn;flag=n'
        },
        {
          isOpen: 'close',
          title: '冲红',
          url: 'reinvoice/red-apply'
        },
        {
          isOpen: 'close',
          title: '退换货',
          url: 'bill/return-new'
        }
      ]
    },
    {
      iqon: 'iqon-finance',
      title: '回款',
      slideState: 'out',
      list: [
        {
          isOpen: 'close',
          title: '回款核销',
          url: ''
        },
        {
          isOpen: 'close',
          title: '欠款查询',
          url: ''
        },
        {
          isOpen: 'close',
          title: '对账单',
          url: 'http://www1.e-bridge.com.cn/EBRenew/censusCasData/cashDebtSearch.do',
          new: true
        }
      ]
    }
  ],
  nav_my_app: [
    {
      iqon: 'iqon-address-book-o',
      name: '采购管理',
      url: 'procurement'
    },
    {
      iqon: 'iqon-seal-o',
      name: '用印管理',
      url: 'india'
    },
    {
      iqon: 'iqon-concat-o',
      name: '销售订单管理',
      url: 'order'
    },
    {
      iqon: 'iqon-concat-o',
      name: '票据管理',
      url: 'invoice'
    },
    {
      iqon: 'iqon-concat-o',
      name: '物料管理',
      url: 'mate'
    },
    {
      iqon: 'iqon-concat-o',
      name: '供应商管理',
      url: 'supplier'
    },
    {
      iqon: 'iqon-concat-o',
      name: '冲红/退换货管理',
      url: 'reinvoice'
    },
    {
      iqon: 'iqon-concat-o',
      name: '借用管理',
      url: 'borrow'
    },
    {
      iqon: 'iqon-concat-o',
      name: '暂存管理',
      url: 'temporarysave'
    }
  ]
}