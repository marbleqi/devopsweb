import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  KongHostService,
  KongProjectService,
  KongHostEditComponent,
  KongHostComponent,
  KongProjectEditComponent,
  KongProjectComponent,
  KongServiceComponent,
  KongNewComponent,
  KongRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [
  KongHostEditComponent,
  KongHostComponent,
  KongNewComponent,
  KongProjectEditComponent,
  KongProjectComponent,
  KongServiceComponent
];

@NgModule({
  imports: [SharedModule, KongRoutingModule],
  declarations: COMPONENTS,
  providers: [KongHostService, KongProjectService]
})
export class KongModule {}
