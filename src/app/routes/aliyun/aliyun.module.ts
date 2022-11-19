import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  AliyunAccesskeyService,
  AliyunCasService,
  AliyunCmsService,
  AliyunDnsService,
  AliyunDomainService,
  AliyunEcsService,
  AliyunDashboardService,
  AliyunAccesskeyEditComponent,
  AliyunAccesskeyComponent,
  AliyunCasEditComponent,
  AliyunCasComponent,
  AliyunCmsComponent,
  AliyunDnsEditComponent,
  AliyunDnsComponent,
  AliyunDomainEditComponent,
  AliyunDomainComponent,
  AliyunEcsComponent,
  AliyunDashboardComponent,
  AliyunRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [
  AliyunAccesskeyComponent,
  AliyunAccesskeyEditComponent,
  AliyunCasComponent,
  AliyunCmsComponent,
  AliyunDomainComponent,
  AliyunDnsComponent,
  AliyunEcsComponent,
  AliyunCasEditComponent,
  AliyunDnsEditComponent,
  AliyunDomainEditComponent,
  AliyunDashboardComponent
];

@NgModule({
  imports: [SharedModule, AliyunRoutingModule],
  declarations: COMPONENTS,
  providers: [
    AliyunAccesskeyService,
    AliyunCasService,
    AliyunCmsService,
    AliyunDomainService,
    AliyunDnsService,
    AliyunEcsService,
    AliyunDashboardService
  ]
})
export class AliyunModule {}
