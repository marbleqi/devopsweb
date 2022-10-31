import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { AliyunRoutingModule } from './aliyun-routing.module';

const COMPONENTS: Array<Type<void>> = [];

@NgModule({
  imports: [SharedModule, AliyunRoutingModule],
  declarations: COMPONENTS
})
export class AliyunModule {}
