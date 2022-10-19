import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { MenuService } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';

@Component({
  selector: 'layout-basic',
  templateUrl: './basic.component.html'
})
export class LayoutBasicComponent implements OnInit {
  options: LayoutDefaultOptions = {
    logoExpanded: `assets/devops-logo.jpeg`,
    logoCollapsed: `assets/database-server.png`
  };
  // 当前显示的主菜单，当发生路由变化时，可以比对判断变化，然后刷新
  link: string = '';

  constructor(private menuSrv: MenuService, private baseSrv: BaseService) {}

  ngOnInit(): void {
    this.baseSrv.menuSub.subscribe(res => {
      if (typeof res[0]?.link === 'string') {
        this.link = res[0]?.link;
        this.menuSrv.clear();
        console.debug('获取菜单', res);
        this.menuSrv.add(res);
      }
    });
  }
}
