import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { CommonHomeService, CommonHomeComponent, CommonRoutingModule } from '.';

const COMPONENTS: Array<Type<void>> = [CommonHomeComponent];

@NgModule({
  imports: [SharedModule, CommonRoutingModule],
  declarations: COMPONENTS,
  providers: [CommonHomeService]
})
export class CommonModule {}
