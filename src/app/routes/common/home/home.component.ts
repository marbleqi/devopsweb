import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { ArrayService } from '@delon/util';

@Component({
  selector: 'app-common-home',
  templateUrl: './home.component.html'
})
export class CommonHomeComponent implements OnInit, OnReuseInit {
  mainMenu: any[] = [];
  socket: any;
  constructor(private arrService: ArrayService, private baseService: BaseService) {
    this.baseService.menuApiSub.subscribe(() => this.getData());
  }

  ngOnInit(): void {
    this.baseService.menuWebSub.next('common');
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('common');
  }

  getData(): void {
    this.mainMenu = this.arrService.arrToTree(
      Array.from(this.baseService.menuMap.values())
        .filter(item => item.status)
        .sort((a, b) => a.orderId - b.orderId)
        .map((item: any) => ({
          menuId: item.menuId,
          pMenuId: item.pMenuId,
          link: item.link,
          text: item.config.text,
          icon: item.config.icon,
          acl: item.abilities.length ? item.abilities : undefined
        })),
      { idMapName: 'menuId', parentIdMapName: 'pMenuId', rootParentIdValue: 0 }
    );
  }
}
