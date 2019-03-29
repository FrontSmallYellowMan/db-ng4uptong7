import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

@Injectable()
export class CommunicateService {

  subject: Subject<any> = new Subject<any>()
  
  sendValue(v) {
    this.subject.next(v);
  }

  getValue(): Observable<any> {
    return this.subject.asObservable();
  }

}