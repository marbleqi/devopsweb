import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';
import { ArrayService } from '@delon/util';
import { io, Socket, SocketOptions } from 'socket.io-client';

@Component({
  selector: 'app-common-home',
  templateUrl: './home.component.html'
})
export class CommonHomeComponent implements OnInit, OnReuseInit {
  mainMenu: any[] = [];
  socket: any;
  constructor(private arrSrv: ArrayService, private baseSrv: BaseService) {}

  ngOnInit(): void {
    this.getData();
  }

  _onReuseInit(): void {
    this.baseSrv.menuChange('common');
  }

  getData(): void {
    this.baseSrv.menuChange('common');
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
