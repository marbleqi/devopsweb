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
  constructor(private arrSrv: ArrayService, private baseSrv: BaseService) {
    this.baseSrv.menuApiSub.subscribe(() => this.getData());
  }

  ngOnInit(): void {
    this.baseSrv.menuWebSub.next('common');
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('common');
  }

  getData(): void {
    this.mainMenu = this.arrSrv.arrToTree(
      Array.from(this.baseSrv.menuMap.values())
        .filter(item => item.status)
        .sort((a, b) => a.orderId - b.orderId)
        .map((item: any) => ({
          menuId: item.menuId,
          pMenuId: item.pMenuId,
          text: item.config.text,
          link: item.config.link,
          icon: item.config.icon,
          acl: item.abilities.length ? item.abilities : undefined
        })),
      { idMapName: 'menuId', parentIdMapName: 'pMenuId', rootParentIdValue: 0 }
    );
  }
}
