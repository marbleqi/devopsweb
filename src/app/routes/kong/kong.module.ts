import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { KongHostService, KongHostEditComponent, KongHostComponent, KongRoutingModule } from '.';

const COMPONENTS: Array<Type<void>> = [KongHostComponent, KongHostEditComponent];

@NgModule({
  imports: [SharedModule, KongRoutingModule],
  declarations: COMPONENTS,
  providers: [KongHostService]
})
export class KongModule {}
