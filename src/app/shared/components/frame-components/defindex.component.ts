import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  template: `
    <div class="lead-body">
      <div class="lead-link">
        <a routerLink="/india">合同管理</a>
        <a routerLink="/order">销售订单</a>
        <a routerLink="/invoice">票据</a>
        <a routerLink="/reinvoice">冲红/退换货</a>
        <a routerLink="/receivepayment">欠款管理</a>
        <a routerLink="/procurement">采购管理</a>
        <a routerLink="/mate">物料管理</a>
        <a routerLink="/supplier">供应商管理</a>
        <a routerLink="/promised">承诺管理</a>
        <a routerLink="/borrow">借用管理</a>
        <a routerLink="/ruleconfiguration">规则配置</a>
        <a routerLink="/facturer_rebate">厂商返款</a>
        <!-- <a routerLink="/temporarysave">暂存</a> -->
        <a routerLink="/pipeline">pipeline</a>
      </div>
    </div>
  `,
  styles: [`
    .lead-body {
      position: absolute;
      overflow-y:auto;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: #bdecf9;
    }
    .lead-link {
      width: 1000px;
      margin: 80px auto;
    }
    a{
      display: inline-block;
      width: 230px;
      height: 150px;
      margin: 0 8px 20px;
      line-height: 150px;
      background-color: #fff;
      border: 1px solid #fff;
      border-radius: 10px;
      color: #393939;
      font-size: 20px;
      letter-spacing: 4px;
      text-align:center;
      transition: box-shadow .5s linear;
    }
    a:active {
      border: none;
    }
    a:focus {
      
      outline: none;
      text-decoration: none;
    }
    a:hover {
      -webkit-box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
  `]
})
export class DefindexComponent {
  constructor(
    private http: Http
  ) {}

}
