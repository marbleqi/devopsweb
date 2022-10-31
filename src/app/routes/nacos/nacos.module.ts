import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { NacosRoutingModule } from './nacos-routing.module';

const COMPONENTS: Array<Type<void>> = [];

@NgModule({
  imports: [SharedModule, NacosRoutingModule],
  declarations: COMPONENTS
})
export class NacosModule {}
