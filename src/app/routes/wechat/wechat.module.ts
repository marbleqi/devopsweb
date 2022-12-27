import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  WechatCompanyService,
  WechatMerchantService,
  WechatOrderService,
  WechatRefundService,
  WechatComplaintService,
  WechatCompanyEditComponent,
  WechatCompanyComponent,
  WechatMerchantEditComponent,
  WechatMerchantComponent,
  WechatOrderComponent,
  WechatRefundComponent,
  WechatComplaintComponent,
  WechatRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [
  WechatCompanyComponent,
  WechatMerchantComponent,
  WechatOrderComponent,
  WechatRefundComponent,
  WechatComplaintComponent,
  WechatCompanyEditComponent,
  WechatMerchantEditComponent
];

@NgModule({
  imports: [SharedModule, WechatRoutingModule],
  declarations: COMPONENTS,
  providers: [WechatCompanyService, WechatMerchantService, WechatOrderService, WechatRefundService, WechatComplaintService]
})
export class WechatModule {}
