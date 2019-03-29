import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

declare var window;

@Component({
    selector: 'pipeline-index',
    templateUrl: 'index.component.html',
    styleUrls: [ 'index.component.scss' ]
})

export class PipelineIndex implements OnInit, OnDestroy{
    constructor (
        private router: Router
    ){    }

    ngOnInit() {
    }

    ngOnDestroy(){
    }

    
}