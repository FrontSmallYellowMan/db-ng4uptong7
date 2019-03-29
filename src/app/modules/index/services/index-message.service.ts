/**
 *李晨 - 2017-12-19
 *我的消息列表服务
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';

export class Query {
  MessageState: number = 0;//0: 未读，1：已读
  Content: string = '';
  PageSize: number = 10;
  CurrentPage: number = 1;
}
export class ViewMessage {
  msgID: any;
  itcode: any;
}
export class Message {
  id: string;
  content: string;
  messageType: string;
  createTime: string;
}

@Injectable()
export class IndexMyMessageService {

  constructor(private http: Http) {}

  /**获取我的审批列表*/
  getMyMessageList(query: Query) {
    return this.http.post(environment.server + 'SalesmanHomePage/GetMyMessage', query)
                    .toPromise()
                    .then(response => response.json());
  }
  /**更新消息状态*/
  ViewedMessage(query: ViewMessage) {
    return this.http.post(environment.server + 'Services/MessageService/ViewedMessage?msgID='+query.msgID+'&itcode='+query.itcode, null)
                    .toPromise()
                    .then(response => response.json());
  }
}