/*import { Directive, ElementRef, HostListener, Input, Renderer, ViewChild } from '@angular/core';
@Directive({
    selector: '[myRotate]'
})
export class rotateDirective {
    constructor(private el: ElementRef, private renderer: Renderer) {

    }
    @ViewChild('hideDisi')
    hideDisiDiv: ElementRef;

    @HostListener("click") onClick() {
        this.hideDis()
    }

    //隐藏表格及旋转
    public hideDisdata = false;
    public hideDis() {
        this.hideDisdata = !this.hideDisdata;
        if (this.hideDisiDiv.nativeElement.className == "iqon-fold mid-h") {
            this.el.nativeElement.className = this.el.nativeElement.className + " " + "trans180"
            // this.renderer.setElementStyle();
            // this.hideDisiDiv.nativeElement.className = this.hideDisiDiv.nativeElement.className + " " + "trans180";
            return;
        }
        if (this.hideDisiDiv.nativeElement.className == "iqon-fold mid-h trans360") {
            this.el.nativeElement.className = this.el.nativeElement.className + " " + "trans180"
            return;
        }
        if (this.hideDisiDiv.nativeElement.className == "iqon-fold mid-h trans180") {
            this.el.nativeElement.className = this.el.nativeElement.className + " " + "trans360"
            return;
        }
    }
}*/