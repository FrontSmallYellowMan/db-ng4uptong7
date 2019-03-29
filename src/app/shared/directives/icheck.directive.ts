import { Directive, ElementRef, Input, Output, OnInit, OnDestroy, EventEmitter, forwardRef, HostBinding } from '@angular/core';
import { ControlValueAccessor, DefaultValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validators} from '@angular/forms';

import { AllCheckService } from "../services/allcheck.service";
declare var $;

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IcheckDirective),
  multi: true
};

@Directive({
  selector: '[icheck]',
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class IcheckDirective implements ControlValueAccessor, OnInit, OnDestroy {
  private _disabled = false;
  @Input()
  set disabled(tmp: any) {
    this._disabled = tmp;
    this.$dom.iCheck(!!tmp ? "disable" : "enable");
  }
  get disabled() {
    return this._disabled;
  }

  private _indeterminate = false;
  @Input()
  set indeterminate(tmp: any) {

    if (tmp !==undefined &&this._indeterminate != tmp) {
      this._indeterminate = tmp;
      this.$dom.iCheck(!!tmp ? "indeterminate" : "determinate");
      //触发半选事件
      this.onIndeterminate.emit(!!tmp);
      //半选 设置值未选中
      this.onChangeCallback(false);
    }
  }
  get indeterminate() {
    return this._indeterminate;
  }

  private registerdAllcheck = "";
  private registerdAllcheckChild = "";
  @Input()
  allcheck: string;
  @Input()
  allcheckChild: string;

  ngOnInit() {
    //注册全选关联
    if (this.allcheck) {
      this.allCheckService.register(this.allcheck, this);
      this.registerdAllcheck = this.allcheck;
    }
    if (this.allcheckChild) {
      this.allCheckService.registerChild(this.allcheckChild, this);
      this.registerdAllcheckChild = this.allcheckChild;
    }
  }
  ngOnDestroy() {
    //销毁全选关联
    if (this.registerdAllcheck) {
      this.allCheckService.unregister(this.allcheck, this);
    }
    if (this.registerdAllcheckChild) {
      this.allCheckService.unregisterChild(this.allcheckChild, this);
    }
  }


  @Output()
  onClick = new EventEmitter();
  @Output()
  onChange = new EventEmitter();
  @Output()
  onIndeterminate = new EventEmitter();
  //子项选中数量
  @Output()
  onCount = new EventEmitter();

  type = "";//input type
  checked: boolean; //checkbox ifchecked
  value: any;//radio value
  $dom: any;// input $(dom)


  private onTouchedCallback;
  private onChangeCallback;
  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
  //ngmodal写入值时自动调用
  writeValue(value: any) {
    switch (this.type) {
      case "radio":
        this.value = value;
        //使用字符串匹配
        if (this.$dom.val() == value || this.$dom.val() == value + "") {
          this.$dom.iCheck('check');
        }else{
          this.$dom.iCheck('uncheck');
        }
        break;
      case "checkbox":
        this.checked = !!value;
        this.$dom.iCheck(!!value ? 'check' : 'uncheck');
        //如果值确定了，半选置为false
        this.indeterminate = 0;
        break;
    }
  }

  constructor(private el: ElementRef, private allCheckService: AllCheckService) {
    let _this = this;
    let $dom = _this.$dom = $(el.nativeElement);
 
    $dom.attr("type")?_this.type = $dom.attr("type").toLowerCase():'';
    $dom.iCheck({
      checkboxClass: 'icheckbox_square-blue',
      radioClass: 'iradio_square-blue',
      indeterminateClass: 'indeterminate_square-blue'
    });

    switch (_this.type) {
      case "radio":
        //仅仅在checked属性变化时触发
        $dom.on("ifToggled", function(event) {
          _this.onChange.emit(_this.value);
        });
        $dom.on("ifClicked", function(event) {
          _this.value = this.value;
          _this.onChangeCallback(_this.value);
          _this.onClick.emit(_this.value);
        })
        break;
      case "checkbox":
        //仅仅在checked属性变化时触发
        $dom.on("ifToggled", function(event) {
          _this.onChange.emit(_this.value);
        })
        $dom.on("ifClicked", function(event) {

          _this.checked = !this.checked;
          _this.onClick.emit(_this.checked);
          _this.indeterminate = false;
          _this.onChangeCallback(_this.checked);
        })
        break;
      default:
         throw "type error。icheck must be radio or checkbox";
    }


  }
}
