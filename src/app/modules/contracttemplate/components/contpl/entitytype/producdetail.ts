export class ProductDetail{
    constructor(
        public ProductName: string,
        public Model: string,
        public Qty: number,
        public Price: number,
        public TotalPrice: number,
        public Remark: string,
        public index?:number
    ){}
}