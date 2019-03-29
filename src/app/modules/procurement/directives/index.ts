import { OnlyTwoDecimal } from './onlyTwoDecimal.directive';
import { OnlyNumber } from './onlyNumber.directive';
import { SupplyZeroToTwoDecimal } from './supplyZeroToTwoDecimal.directive';
import { OnlyCharBlank } from './onlyCharBlank.directive';
import { OnlyZeroDecimal } from './onlyZeroDecimal.directive';
import { NumberRange } from './numberRange.directive';



export let PROCUREMENT_DIRECTIVES = [OnlyNumber,OnlyTwoDecimal,SupplyZeroToTwoDecimal,
    OnlyCharBlank,OnlyZeroDecimal,NumberRange];
