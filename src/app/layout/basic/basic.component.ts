import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { MenuService, Menu } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { ArrayService } from '@delon/util';

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

  constructor(private readonly arraySrv: ArrayService, private menuSrv: MenuService, private baseSrv: BaseService) {}

  ngOnInit(): void {
    this.baseSrv.menuWebSub.subscribe(link => {
      console.debug('收到前端菜单切换消息');
      if (this.link !== link) {
        this.link = link;
        this.fresh();
      }
    });
    this.baseSrv.menuApiSub.subscribe(() => {
      console.debug('收到后端菜单更新消息');
      this.fresh();
    });
  }

  fresh() {
    const menuList = this.arraySrv
      .arrToTree(
        Array.from(this.baseSrv.menuMap.values())
          .filter(item => item.status)
          .sort((a, b) => a.orderId - b.orderId)
          .map(item => {
            if (item.pMenuId === 0) {
              // 主菜单返回逻辑
              return {
                menuId: item.menuId,
                pMenuId: item.pMenuId,
                text: item.config.text,
                group: true,
                link: item.config.link,
                acl: item.abilities.length ? item.abilities : undefined
              };
            } else {
              // 子菜单返回逻辑
              return {
                menuId: item.menuId,
                pMenuId: item.pMenuId,
                text: item.config.text,
                link: item.config.link,
                icon: item.config.icon ? `anticon-${item.config.icon}` : null,
                reuse: item.config.reuse,
                acl: item.abilities.length ? item.abilities : undefined
              };
            }
          }),
        { idMapName: 'menuId', parentIdMapName: 'pMenuId', rootParentIdValue: 0 }
      )
      .map((item: Menu) => {
        item.children?.push({ text: '返回', link: 'common/home', icon: 'anticon-left' });
        return item;
      })
      .filter(item => item.link === this.link);
    console.debug('完成菜单数据初始化！', menuList);
    this.menuSrv.clear();
    this.menuSrv.add(menuList);
  }
}
