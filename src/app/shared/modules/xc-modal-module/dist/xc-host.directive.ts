import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[xc-host]' })
export class XcHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
