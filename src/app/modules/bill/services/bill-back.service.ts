import { Injectable } from '@angular/core';

@Injectable()
export class billBackService {
    public billTypeId:any;
    public backdta;
    public examineApplyId;
    getDate(e){
      this.billTypeId=e
    }
}
