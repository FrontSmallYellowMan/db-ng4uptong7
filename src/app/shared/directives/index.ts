
import {IcheckDirective} from './icheck.directive';
import {Autoheight} from './autoheight.directive';
import {StopParentClick} from './stopParentClick.directive';
import {NavDropdownDirective,NavDropdownToggleDirective} from './nav-dropdown.directive';
import {NotBlankValidator} from './not-blank.directive';
import {TrimDirective} from './trim.directive';
import {RefuseInputDirective} from './refuseInput.directive';
import { OnlyNumberDirective } from "./onlyNumber.directive";
import { CompareNumInputDirective } from "./compareNumInput.directive";
import { ConversionCaseDirective } from "./conversionCase.directive";

export let SHARED_DIRECTIVES = [IcheckDirective,Autoheight,StopParentClick,NavDropdownDirective,
    NavDropdownToggleDirective,NotBlankValidator,TrimDirective,OnlyNumberDirective,CompareNumInputDirective, 
    ConversionCaseDirective,RefuseInputDirective];
