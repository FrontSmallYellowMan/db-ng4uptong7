import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ 'name': 'iq_chinese_number' })
export class iqChineseNumberPipe implements PipeTransform {
  /*
    使用条件：把数字转为中文字符，支持最大数字长度15位，当有小数点时 四舍五入取两位
             无小数点：expression==0，不带“元”字
             有小数点：expression==1，带“元”字
    实例 {{ 12800 | iq_chinese_number:0 }}-->一万二千八百
        {{ 12800.89 | iq_chinese_number:1 }}-->一万二千八百元零八角九分
  */
  transform(value:number,expression:number ): string {
        let numberValue=new String(Math.round(value*100)); // 数字金额  
        let chineseValue=""; // 转换后的汉字金额  
        let String1 = "零一二三四五六七八九"; // 汉字数字  
        let String2; // 对应单位  
        if(expression==0){
          String2 = "万千百十亿千百十万千百十"+" "+"角分"; 
        }
        if(expression==1){
          String2 = "万千百十亿千百十万千百十元角分";
        }
        let len=numberValue.length; // numberValue 的字符串长度  
        let Ch1; // 数字的汉语读法  
        let Ch2; // 数字位的汉字读法  
        let nZero=0; // 用来计算连续的零值的个数  
        let String3; // 指定位置的数值  
        if(len>15){  
          console.log("超出计算范围");  
          return "";  
        }  
        if (numberValue=='0'){  
        chineseValue = "零";  
        return chineseValue;  
        }  
  
        String2 = String2.substr(String2.length-len, len); // 取出对应位数的STRING2的值  
        for(let i=0; i<len; i++){  
        String3 = parseInt(numberValue.substr(i, 1),10); // 取出需转换的某一位的值  
        if ( i != (len - 3) && i != (len - 7) && i != (len - 11) && i !=(len - 15) ){  
        if ( String3 == 0 ){  
        Ch1 = "";  
        Ch2 = "";  
        nZero = nZero + 1;  
        }  
        else if ( String3 != 0 && nZero != 0 ){  
        Ch1 = "零" + String1.substr(String3, 1);  
        Ch2 = String2.substr(i, 1);  
        nZero = 0;  
        }  
        else{  
        Ch1 = String1.substr(String3, 1);  
        Ch2 = String2.substr(i, 1);  
        nZero = 0;  
        }  
        }  
        else{ // 该位是万亿，亿，万，元位等关键位  
        if( String3 != 0 && nZero != 0 ){  
        Ch1 = "零" + String1.substr(String3, 1);  
        Ch2 = String2.substr(i, 1);  
        nZero = 0;  
        }  
        else if ( String3 != 0 && nZero == 0 ){  
        Ch1 = String1.substr(String3, 1);  
        Ch2 = String2.substr(i, 1);  
        nZero = 0;  
        }  
        else if( String3 == 0 && nZero >= 3 ){  
        Ch1 = "";  
        Ch2 = "";  
        nZero = nZero + 1;  
        }  
        else{  
        Ch1 = "";  
        Ch2 = String2.substr(i, 1);  
        nZero = nZero + 1;  
        }  
        if( i == (len - 11) || i == (len - 3)){ // 如果该位是亿位或元位，则必须写上  
        Ch2 = String2.substr(i, 1);  
        }  
        }  
        chineseValue = chineseValue + Ch1 + Ch2;  
        }  
        if(expression==0){
          return chineseValue.substring(0,chineseValue.length-1);
        }
        return chineseValue;
  }
}
