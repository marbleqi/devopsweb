import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { AlipayRoutingModule } from './alipay-routing.module';

const COMPONENTS: Array<Type<void>> = [];

@NgModule({
  imports: [SharedModule, AlipayRoutingModule],
  declarations: COMPONENTS
})
export class AlipayModule {}
