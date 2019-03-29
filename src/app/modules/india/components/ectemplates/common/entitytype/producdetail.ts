export class ProductDetail{
    constructor(
        public ProductName: string,
        public Model: string,
        public MaterialDescription: string,
        public Qty: any,
        public Price: number,
        public TotalPrice: any,
        public Remark: string,
        public index?:number
    ){}
}