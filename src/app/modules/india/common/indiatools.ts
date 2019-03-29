export class IndiaTools {

    constructor(){}
    /**
     * 名称：平台名称转换平台编号 
     * 参数：平台名称 返回值：平台编号
     */
    public plateNameTransCode(plateName) {
        let platCode = plateName || "21";
        switch (plateName) {
            case "北京":
            case "总部":
                platCode = "21";
                break;
            default:
                break;
        }
        return platCode;
    }
}