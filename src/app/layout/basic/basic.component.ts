import { Component } from '@angular/core';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';

@Component({
  selector: 'layout-basic',
  templateUrl: './basic.component.html'
})
export class LayoutBasicComponent {
  options: LayoutDefaultOptions = {
    logoExpanded: `assets/devops-logo.jpeg`,
    logoCollapsed: `assets/database-server.png`
  };
}
