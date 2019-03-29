import { Component,OnInit,OnChanges,Input,Output,EventEmitter} from '@angular/core';
import { UserImageHeadComponent } from './user-image-head.component';
import { PersonService,Person } from 'app/shared/services/person.service';

@Component({
  selector: '[user-image]',
  templateUrl: 'user-image.component.html',
  styles: [`
  :host{
    position: relative;
    display: inline-block;
    padding-left: 6px;
  }
  :host .m-user-ename{
    color: #a8b1bd;
  }

  :host:hover .m-pop-up{
    display: block;
  }
  /deep/ .m-user-img,/deep/ .m-user-noimg{
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    width: 30px;
    height: 30px;
    line-height: 30px;
    color: #fff;
    border-radius: 50%;
    margin-right: 8px;
  }
  .m-pop-up{
    display: none;
    position: absolute;
    left: -50%;
    z-index: 999;
    i{
      position: absolute;
      left: 145px;
        top: -12px;
        color: #fff;
        font-size: 15px;
    }
    .m-pop-content{
      width: 25%;
      padding: 20px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 15px 0 rgba(4, 0, 0, 0.15);
      .m-user-info-big{
        font-size: 15px;
        .m-user-noimgs{
          width: 50px;
          height: 50px;
          line-height: 50px;
          font-size: 19px;
          background-color: #ef9051;
        }
      }
      .uls-tree{
        margin-top: 10px;
        li{
          line-height: 25px;
          label{
            display: inline-block;
            width: 70px;
            color: #a7b1bd;
            font-weight: normal;
          }
        }
      }
    }
  }`]
})
export class UserImageComponent implements OnInit,OnChanges {
  constructor(private personService:PersonService) {  }
  Obj:Person;

  @Input('url') url:string;
  @Input('user') user:Person|string;
  @Input() hasClose:boolean;
  @Input() hasImg: boolean = true;
  @Input() showHover: boolean = false;

  @Output()
  onClose = new EventEmitter();

  closeClick(){
    this.onClose.emit();
  }
  initPerson(){
    if(typeof this.user === 'string'&& this.user){
      this.personService.get(this.user).subscribe((p) => {
        this.Obj=p;
      });
    }else{
      this.Obj=<Person>this.user;
    }
  }
  ngOnChanges(){
    this.initPerson();
  }
  ngOnInit(){
  }
}
