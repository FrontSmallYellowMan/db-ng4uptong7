export const indiaNavConfig = {
    navInfo: {
        menu: [
            {
                iqon: 'iqon-angle-right',//图标样式类
                text: '合同用印',
                open: true,
                sub: [
                    {
                        active: true,
                        text: '销售合同用印',
                        url: "india/sclist"
                    },
                    {
                        active: false,
                        text: '采购合同用印',
                        url: "india/pclist"
                    }
                ]
            }
        ],
        setup: []
    }
}