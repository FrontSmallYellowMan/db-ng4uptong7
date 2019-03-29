import { ElementRef, HostListener, Directive} from '@angular/core';

@Directive({
    selector: 'textarea[autoheight]'
})

export class Autoheight {
 @HostListener('input',['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }
  constructor(private element: ElementRef){
    this.element.nativeElement.style.overflow = 'hidden';
    this.element.nativeElement.style.height = 'auto';
  }
  ngAfterContentChecked(): void{
    this.adjust();
  }

  adjust(): void{
    this.element.nativeElement.style.height = 0;
    //计算高度
    this.element.nativeElement.style.height = this.element.nativeElement.scrollHeight + "px";
  }
}
