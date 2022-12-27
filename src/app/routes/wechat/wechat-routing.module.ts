import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WechatCompanyComponent, WechatMerchantComponent, WechatOrderComponent, WechatRefundComponent, WechatComplaintComponent } from '.';

const routes: Routes = [
  { path: 'company', component: WechatCompanyComponent },
  { path: 'merchant', component: WechatMerchantComponent },
  { path: 'order', component: WechatOrderComponent },
  { path: 'refund', component: WechatRefundComponent },
  { path: 'complaint', component: WechatComplaintComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WechatRoutingModule {}
