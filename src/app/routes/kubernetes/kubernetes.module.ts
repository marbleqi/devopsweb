import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { KubernetesRoutingModule } from './kubernetes-routing.module';

const COMPONENTS: Array<Type<void>> = [];

@NgModule({
  imports: [SharedModule, KubernetesRoutingModule],
  declarations: COMPONENTS
})
export class KubernetesModule {}
