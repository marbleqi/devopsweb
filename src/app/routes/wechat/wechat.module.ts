import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { WechatRoutingModule } from './wechat-routing.module';

const COMPONENTS: Array<Type<void>> = [];

@NgModule({
  imports: [SharedModule, WechatRoutingModule],
  declarations: COMPONENTS
})
export class WechatModule {}
