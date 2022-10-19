import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import {
  AuthAbilityService,
  AuthMenuService,
  AuthRoleService,
  AuthUserService,
  AuthTokenService,
  AuthDashboardService,
  AuthAbilityComponent,
  AuthAbilityGrantComponent,
  AuthMenuEditComponent,
  AuthRoleEditComponent,
  AuthRoleGrantComponent,
  AuthUserEditComponent,
  AuthUserResetComponent,
  AuthMenuComponent,
  AuthRoleComponent,
  AuthUserComponent,
  AuthTokenComponent,
  AuthDashboardComponent,
  AuthRoutingModule
} from '.';

const COMPONENTS: Array<Type<void>> = [
  AuthAbilityComponent,
  AuthMenuComponent,
  AuthRoleComponent,
  AuthUserComponent,
  AuthTokenComponent,
  AuthDashboardComponent,
  AuthAbilityGrantComponent,
  AuthMenuEditComponent,
  AuthRoleEditComponent,
  AuthUserEditComponent,
  AuthUserResetComponent,
  AuthRoleGrantComponent
];

@NgModule({
  imports: [SharedModule, AuthRoutingModule],
  declarations: COMPONENTS,
  providers: [AuthAbilityService, AuthMenuService, AuthRoleService, AuthUserService, AuthTokenService, AuthDashboardService]
})
export class AuthModule {}
