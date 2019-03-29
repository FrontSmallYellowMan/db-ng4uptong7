import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';

@Injectable()
export class DBselectService {

  subject: Subject<any> = new Subject<any>();

  constructor() { }

  sendMySelectOptionState(v) {
    this.subject.next(v);
  }

  getMySelectOptionState(): Observable<any> {
    return this.subject.asObservable();
  }

}