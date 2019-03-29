export const indiaMenuConfig = [
    {
        menuTiele: '合同用印',
        menuInfo: [
            {
                text: '销售合同用印',
                active: true,
                url: 'india/selecttpl'
            },
            {
                text: '采购合同用印',
                active: false,
                url: 'india/pc-apply'
            }
        ]
    }
]

declare var $: any;
export class MenuOperation {
    constructor() {}

    hideIndiaList() {
        $(".newIndia").css("display", "none");
    }
}