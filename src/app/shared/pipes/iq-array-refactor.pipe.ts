
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ 'name': 'iq_array_refactor' })
export class iqArrayRefactorPipe implements PipeTransform {
  /*
   * 示例：{{ XXX | iq_array_refactor:"[.id][.name]"}}
   * XXX为数组[obj1,obj2]
   * 将按照expression的模式显示数组  其中[.属性]替换数组元素的属性值
   * id name为可选，也可替换
   * 如 任意1[.id]任意2[.name]任意3 显示 : 任意1+"obj1.id"+任意2+"obj1.name"+任意3,任意1+"obj2.id"+任意2+"obj2.name"+任意3
   *
   * XXX 为[{id:"id1",username:"xuchao1"},{id:"id2",username:"xuchao2"},{id:"id2",username:"xuchao2"}]
   * expression为[.username]([.id])
   * 显示结果为：xuchao1(id1),xuchao2(id2),xuchao2(id2)
   */
  transform(array: any[],expression:string ): string {
    let list = [];
    let matchs = expression.match(/\[.[.\w]+\]/g);
    let replaces = [];
    for(let j = 0;j<matchs.length;j++){
        let sub = matchs[j].slice(1,-1);
        replaces.push(sub.split("."));
    }
    for(let i = 0;i<array.length;i++){
        let str = expression;
        for(let j = 0;j<matchs.length;j++){
            let subs = replaces[j]
            let tmp = array[i];
            for(let k = 0;k<subs.length;k++){
                if(subs[k]&&tmp){
                    tmp = tmp[subs[k]];
                }
            }
            str = str.replace(matchs[j],tmp);
        }
        list.push(str);
    }
    return list.join(",");
  };
}
