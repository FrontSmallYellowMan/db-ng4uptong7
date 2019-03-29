import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'iq-apply-modules',
  templateUrl: './apply-modules.component.html',
  styleUrls: ['./_apply-modules.component.scss']
})
export class ApplyModulesComponent implements OnInit {

  @Input() applyState;
  @Input() public approvalPerson:string;

  applyStateStyle:any=[//声明一个状态数组，里面保存了，审批过程的三个状态（未提交申请，采购员审核中，审核结束）
    {applicant:"",applyIcon:"iqon-flage",buyer:"",buyerIcon:"iqon-more",end:"",endIcon:"iqon-more"},
    {applicant:"m-apply-finish",applyIcon:"iqon-right",buyer:"m-apply-process",buyerIcon:"iqon-flage",end:"",endIcon:"iqon-more"},
    {applicant:"m-apply-finish",applyIcon:"iqon-right",buyer:"m-apply-finish",buyerIcon:"iqon-right",end:"m-apply-finish",endIcon:"iqon-right"}
  ];

  



  constructor() { }

  ngOnInit() {}






  

}
