
import {from as observableFrom,  Observable ,  Subject } from 'rxjs';

import {map} from 'rxjs/operators/map';
import { Injectable } from '@angular/core';
import { Http,RequestOptions,Headers ,RequestMethod,URLSearchParams} from '@angular/http';
import { environment } from 'environments/environment';

import { PersonAPIConfig } from "environments/environment";


@Injectable()
export class PersonConfig {
  public searchUrlPattern;

  constructor() {
    this.searchUrlPattern = PersonAPIConfig.searchUrlPattern;
  }
}

@Injectable()
export class PersonService {
  _loginUser:Person;
  requesting:Observable<Person>;
  constructor(private config:PersonConfig,private http:Http) { }
  get loginUser(){
    if(this.requesting){
    }else{
      let url = environment.server+"login/user";
      this.requesting = this.http.get(url).pipe(map(response =>{
        let tmp = response.json();
        if(tmp.data){
          this._loginUser = new Person(tmp.data)
        }else{
          this.requesting = null;
        }
        return this._loginUser;
      }));
    }
    return this.requesting;
  }
  get(id?:string){
    let url= environment.server+"person/"+id;
    return this.http.get(url).pipe(map(response =>{
      let tmp = response.json();
      let resultSet=tmp.data?tmp.data:null;
      return resultSet?new Person(resultSet):null;
    }));
  }
  query(key:string){
    if(!key){
      return observableFrom([]);
    }
    // let url = this.config.searchUrlPattern.replace(/{{search_key}}/g,key);
    let url = this.config.searchUrlPattern;
    let params: URLSearchParams = new URLSearchParams();
    params.set("search_LIKE_name_1", key);
    params.set("search_LIKE_itcode_2",key);
    params.set("search_LIKE_personNo_3", key);
    params.set("formula", "1 OR 2 OR 3");
    params.set("pageSize","8");
    
    return this.http.get(url,{search: params}).pipe(map(response =>{
      let tmp = response.json();
      let resultSet:PersonMySQL[] = tmp.data? tmp.data.content:null;
      let ret:Person[] = [];
      if(resultSet){
        resultSet.forEach( (k) => ret.push(new Person(k)));
      }
      return ret;
    }));
  }
}

const mapper = {"id":"userID","itcode":"userEN","name":"userCN","exf9":"headName","exf18":"departName","exf33":"platName"};
class PersonMySQL{
  "id":string;//userID
  "prefixId":string;
  "itcode":string;//userEN
  "personNo":string;
  "name":string;//userCN
  "enname":string;
  "pinyin":string;
  "pinyinPrefix":string;
  "shortname":string;
  "position":string;
  "joindate":string;
  "sex":string;
  "hometown":string;
  "mobile":string;
  "telephone":string;
  "fax":string;
  "email":string;
  "signature":string;
  "qualifications":string;
  "bankCard":string;
  "status":number;
  "statusReason":string;
  "innerEmail":string;
  "innerEmailContact":string;
  "type":number;
  "isTrialAccount":string;
  "department":any;
}
export class Person{
  constructor(tmp?:PersonMySQL){
    if(tmp){
      for(let i in tmp){
        this[i] = tmp[i];
        if(mapper.hasOwnProperty(i)){
          this[mapper[i]] = tmp[i];
        }
      }
    }
  }
  "id":string;//userID
  "itcode":string;//userEN
  "name":string;//userCN
  "userID":string;//userID
  "prefixId":string;
  "userEN":string;//userEN
  "personNo":string;
  "userCN":string;//userCN
  "enname":string;
  "pinyin":string;
  "pinyinPrefix":string;
  "shortname":string;
  "position":string;
  "joindate":string;
  "sex":string;
  "hometown":string;
  "mobile":string;
  "telephone":string;
  "fax":string;
  "email":string;
  "signature":string;
  "qualifications":string;
  "bankCard":string;
  "status":number;
  "statusReason":string;
  "innerEmail":string;
  "innerEmailContact":string;
  "type":number;
  "isTrialAccount":string;
  "department":any;
}
