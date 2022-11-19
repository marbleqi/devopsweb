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
  KongGrantService,
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
  KongGrantComponent,
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
  KongConsumerEditComponent,
  KongGrantComponent
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
    KongPluginService,
    KongGrantService
  ]
})
export class KongModule {}
