import { iqRefactorPipe } from './iq-refactor.pipe';
import { iqArrayRefactorPipe } from './iq-array-refactor.pipe';
import { iqGenderPipe } from './iq-gender.pipe';
import { IqDatePipe } from './iq-date.pipe';
import { IqFileSizePipe } from './iq-filesize.pipe';
import { iqChineseNumberPipe } from './iq-chinese-number.pipe';
import { iqLoadingPipe } from './iq-loading.pipe';


export { iqRefactorPipe,iqArrayRefactorPipe,iqGenderPipe,iqChineseNumberPipe,iqLoadingPipe };
export let SHARED_PIPES = [IqFileSizePipe,IqDatePipe,iqRefactorPipe,iqArrayRefactorPipe,iqGenderPipe,iqChineseNumberPipe,iqLoadingPipe];
