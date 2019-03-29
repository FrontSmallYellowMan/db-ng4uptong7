import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams, Headers, Http, RequestOptionsArgs, RequestOptions } from '@angular/http';


@Component({
    templateUrl: './con-choice.component.html',
    styleUrls: ['./con-choice.component.scss']
})
export class ConChoiceComponent implements OnInit {

    constructor() {

    }
    name = '请选择您将使用的模板'
    ngOnInit(){}

}
