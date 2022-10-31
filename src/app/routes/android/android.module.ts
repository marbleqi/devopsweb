import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { AndroidRoutingModule } from './android-routing.module';

const COMPONENTS: Array<Type<void>> = [];

@NgModule({
  imports: [SharedModule, AndroidRoutingModule],
  declarations: COMPONENTS
})
export class AndroidModule {}
