import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  KongHostService,
  KongProjectService,
  KongCertificateService,
  KongTargetService,
  KongUpstreamService,
  KongServiceService,
  KongRouteService,
  KongConsumerService,
  KongPluginService,
  KongHostEditComponent,
  KongHostComponent,
  KongProjectComponent,
  KongCertificateEditComponent,
  KongCertificateComponent,
  KongTargetEditComponent,
  KongTargetComponent,
  KongUpstreamEditComponent,
  KongUpstreamComponent,
  KongServiceEditComponent,
  KongServiceComponent,
  KongRouteEditComponent,
  KongRouteComponent,
  KongConsumerEditComponent,
  KongConsumerComponent,
  KongPluginEditComponent,
  KongPluginComponent,
  KongNewComponent,
  KongRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [
  KongHostEditComponent,
  KongHostComponent,
  KongNewComponent,
  KongProjectComponent,
  KongServiceEditComponent,
  KongServiceComponent,
  KongRouteEditComponent,
  KongRouteComponent,
  KongConsumerComponent,
  KongCertificateComponent,
  KongUpstreamComponent,
  KongTargetComponent,
  KongPluginComponent,
  KongPluginEditComponent,
  KongTargetEditComponent,
  KongUpstreamEditComponent,
  KongCertificateEditComponent,
  KongConsumerEditComponent
];

@NgModule({
  imports: [SharedModule, KongRoutingModule],
  declarations: COMPONENTS,
  providers: [
    KongHostService,
    KongProjectService,
    KongServiceService,
    KongRouteService,
    KongConsumerService,
    KongCertificateService,
    KongUpstreamService,
    KongTargetService,
    KongPluginService
  ]
})
export class KongModule {}
