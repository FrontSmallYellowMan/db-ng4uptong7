import { Directive, Input, ElementRef, OnDestroy, EventEmitter, forwardRef, HostBinding } from '@angular/core';
import { NG_VALIDATORS, Validator } from '@angular/forms';

/**
从底层required代码复制过来，修改为不为空校验
*/
const NOTBLANK_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => NotBlankValidator),
  multi: true
};

@Directive({
  selector: ':not([type=checkbox])[notblank][formControlName],:not([type=checkbox])[notblank][formControl],:not([type=checkbox])[notblank][ngModel]',
  providers: [NOTBLANK_VALIDATOR]
})
export class NotBlankValidator implements Validator {
  private _notblank;
  private _onChange;
  /**
   * @return {?}
   */
  get notblank() {
    return this._notblank;
  }
  /**
   * @param {?} value
   * @return {?}
   */
  @Input("notblank")
  set notblank(value) {
    this._notblank = value != null && value !== false && `${value}` !== 'false';
    if (this._onChange)
      this._onChange();
  }
  /**
   * @param {?} c
   * @return {?}
   */
  validate(c) {
    return this.notblank ? this.validateBlank(c.value) : null;
  }
  /**
   add validator
  */
  validateBlank(v) {
    //如果只有空字符串，返回校验失败
    return /^\s*$/g.test(v) ? {'notblank': true }:null;
  }
  /**
   * @param {?} fn
   * @return {?}
   */
  registerOnValidatorChange(fn) { this._onChange = fn; }
}
