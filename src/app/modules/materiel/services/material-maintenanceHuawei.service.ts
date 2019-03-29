import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Http, URLSearchParams, RequestOptions, Headers} from '@angular/http';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpServer } from '../../../shared/services/db.http.server';
const getMaterialHWListUrl="MaterialManage/GetMaterialHWList";
const addMaterialHWUrl="MaterialManage/AddMaterialHW";
const deleteMaterialHWUrl="MaterialManage/DeleteMaterialHW";
const uploadMaterialHWUrl="MaterialManage/UploadMaterialHW";
const UpdateMaterialHWUrl="MaterialManage/UpdateMaterialHW";

@Injectable()
export class MaterialMaintenanceHuaweiService {

  constructor(private http: HttpServer){}
   //设置请求头
   headers = new Headers({ 'ticket': localStorage.getItem('ticket') });
   options = new RequestOptions({ headers: this.headers });
   getMaterialHWList(params:any):Observable<any>{
    return this.http.post(getMaterialHWListUrl, params, this.options);     
   }
   addMaterialHW(materialHWInfo:MaterialInfoHW):Observable<any>{
       return this.http.post(addMaterialHWUrl,materialHWInfo,this.options);
   }
   deleteMaterialHW(ID:any):Observable<any>{
       return this.http.post(deleteMaterialHWUrl,{ID:ID},this.options);
       
   }
   updateMaterialHW(materialHWInfo:MaterialInfoHW):Observable<any>{
       return this.http.post(UpdateMaterialHWUrl,materialHWInfo,this.options);
   }
}
export class MaterialInfoHW{
    checked:boolean;
    View:boolean;
    ID:number;
    MaterialCode:string="";
    MaterialCodeHW:string="";
    CreaterITCode:string="";
    CreaterName:string="";
    CreateTime:any;
}
export class Query{
    MaterialCode:string="";
    MaterialCodeHW:string="";
    CurrentPage:string='1';
    PageSize:string = '10';
}
