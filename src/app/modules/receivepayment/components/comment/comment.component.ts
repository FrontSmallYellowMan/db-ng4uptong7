import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FollowuplistService, ArrearsModel, ReviewModel } from "../../service/rp-followup.service";
import { Person } from 'app/shared/services/index';
import { APIAddress } from "../../../../../environments/environment";
import * as moment from 'moment';

@Component({
  selector: 'db-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['../../scss/re-list.component.scss']
})
export class CommentComponent implements OnInit {

  constructor(private followupservice: FollowuplistService,private activerouter:ActivatedRoute) { }
  arrearsInfoCode;
  arrearsInfo = new ArrearsModel();
  personSales = new Person();
  loading: boolean = false;
  reviewList: ReviewModel[] = [];
  reviewcontent: string = "";
  localUserInfo = JSON.parse(window.localStorage.getItem("UserInfo"));//本地localstorage 用户信息
  ngOnInit() {
    this.activerouter.queryParams.subscribe(params => {
      if (params) {
        this.arrearsInfoCode = params.AFU_Code;
      }
    });
    this.getFollowInfo(this.arrearsInfoCode);
    this.GetReviewList(this.arrearsInfoCode);
  }
  getFollowInfo(code){
    this.loading = true;
    this.followupservice.GetFollowInfo(code).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.arrearsInfo = JSON.parse(data.Data);
        this.personSales = new Person();
        this.personSales.userID = "1";
        this.personSales.userEN = this.arrearsInfo.AFModel.CreateItcode;
        this.personSales.userCN = this.arrearsInfo.AFModel.CreateName;
      }
    });
  }
  GetReviewList(code){
    this.loading = true;
    this.followupservice.GetReviewList(code).subscribe(data => {
      this.loading = false;
      if (data.Result) {
        this.reviewList = JSON.parse(data.Data);
        this.reviewList.forEach((item,index,arr)=>{
          let person = new Person();
          person.userID = index.toString();
          person.userEN = item.ReviewItcode;
          person.userCN = item.ReviewName;
          this.reviewList[index]["person"] = person;
        });
        this.reviewList = this.reviewList.sort((a, b) => {
            return b.ReviewTime > a.ReviewTime ? 1 : -1;
        });
      }
    });
  }
  //点击单个已经上传的附件
  onClickFile(url){
    window.open(APIAddress + url);
  }
  //发送评论
  sendReview(){
    this.followupservice.SaveReview(this.arrearsInfoCode,this.reviewcontent).subscribe(data => {
      if (data.Result) {
        let rm = new ReviewModel();
        rm["AFU_Code"] = this.arrearsInfoCode;
        rm["ReviewContent"] = this.reviewcontent;
        rm["ReviewItcode"] = this.localUserInfo["ITCode"].toLowerCase();
        rm["ReviewName"]  = this.localUserInfo["UserName"];
        rm["ReviewTime"]  = moment(new Date).format("YYYY-MM-DD HH:mm:ss");
        this.reviewList = this.reviewList.sort((a, b) => {
            return b.ReviewTime > a.ReviewTime ? 1 : -1;
        });
        this.reviewList.unshift(rm);
        this.reviewList.forEach((item,index,arr)=>{
          let person = new Person();
          person.userID = index.toString();
          person.userEN = item.ReviewItcode;
          person.userCN = item.ReviewName;
          this.reviewList[index]["person"] = person;
        });
        this.reviewcontent = "";
      }
    });
  }

}
