// 外部依赖
import { Injectable } from '@angular/core';
import { SFSchemaEnum } from '@delon/form';
import { _HttpClient, Menu, SettingsService, TitleService } from '@delon/theme';
import { ArrayService } from '@delon/util';
import { Result } from '@shared';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';

/**基础服务，需要在多处多次调用 */
@Injectable({ providedIn: 'root' })
export class BaseService {
  /**后端地址 */
  baseUrl: string;
  /**当前主菜单链接 */
  link: string;
  /**用户对象最新操作ID */
  private userOperateId: number;
  /**用户ID与用户姓名的Map */
  private userMap: Map<number, string>;
  /**用户选项订阅主体 */
  userSub: BehaviorSubject<SFSchemaEnum[]>;
  /**菜单对象最新操作ID */
  private menuOperateId: number;
  /**缓存的菜单Map */
  menuMap: Map<number, any>;
  /**菜单订阅主体 */
  menuSub: BehaviorSubject<Menu[]>;
  /**侧边栏菜单清单 */
  private menuList: Menu[];
  /**排序订阅主体 */
  sortSub: BehaviorSubject<string>;
  /** 长连接对象 */
  socket!: Socket;

  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param arrSrv 注入的数组服务
   * @param settingSrv 注入的数组服务
   * @param titleSrv 注入的数组服务
   */
  constructor(
    private readonly client: _HttpClient,
    private readonly arrSrv: ArrayService,
    private readonly settingSrv: SettingsService,
    private readonly titleSrv: TitleService
  ) {
    this.baseUrl = '';
    this.link = '';
    this.userOperateId = 0;
    this.userMap = new Map<number, string>();
    this.userSub = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.menuOperateId = 0;
    this.menuMap = new Map<number, any>();
    this.menuSub = new BehaviorSubject<Menu[]>([]);
    this.menuList = [];
    this.sortSub = new BehaviorSubject<string>('');
  }

  /**
   * 初始化用户数据
   *
   * @returns Observable
   */
  userInit(): Observable<void> {
    console.debug('初始化用户数据！');
    return this.client.get('common/init/user', { operateId: this.userOperateId }).pipe(
      map(res => {
        console.debug('接口中的用户数据', res);
        if (!res.code && res.data.length) {
          for (const userItem of res.data) {
            this.userMap.set(userItem.userId, userItem.userName);
            if (this.userOperateId < userItem.operateId) {
              this.userOperateId = userItem.operateId;
            }
          }
        }
        console.debug('完成用户数据初始化！', this.userMap);
        const userList: SFSchemaEnum[] = Array.from(this.userMap).map(item => ({ value: item[0], label: item[1], title: item[1] }));
        this.userSub.next(userList);
        console.debug('最新用户清单', userList);
      })
    );
  }

  /**
   * 用户ID换用户姓名
   *
   * @param userId 用户ID
   * @returns 用户姓名
   */
  userName(userId: number): string {
    return this.userMap.get(userId) || '';
  }

  userList(): SFSchemaEnum[] {
    return Array.from(this.userMap).map((item: any) => ({ value: item[0], label: item[1] }));
  }

  roleList(): SFSchemaEnum[] {
    return Array.from(this.userMap).map((item: any) => ({ value: item[0], label: item[1] }));
  }

  /**
   * 初始化菜单数据
   *
   * @returns Observable
   */
  menuInit(): Observable<void> {
    console.debug('初始化菜单数据！');
    return this.client.get('common/init/menu', { operateId: this.menuOperateId }).pipe(
      map((res: Result) => {
        console.debug('接口中的菜单数据', res);
        if (!res.code && res.data.length) {
          for (const menuItem of res.data) {
            this.menuMap.set(menuItem.menuId, menuItem);
            if (this.menuOperateId < menuItem.operateId) {
              this.menuOperateId = menuItem.operateId;
            }
          }
        }
        this.menuList = this.arrSrv
          .arrToTree(
            Array.from(this.menuMap.values())
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
          });
        console.debug('完成菜单数据初始化！', this.menuList);
      })
    );
  }

  /**
   * 触发刷新侧边栏菜单
   *
   * @param link 侧边栏菜单的主菜单链接
   */
  menuChange(link?: string): void {
    console.debug('主菜单链接', link);
    if (link) {
      this.link = link;
    }
    /**侧边栏菜单 */
    const menuList: Menu[] = this.menuList.filter(item => item.link === this.link);
    // 弹出菜单栏数据
    if (menuList.length) {
      console.debug('发送的菜单', menuList);
      this.menuSub.next(menuList);
    }
  }

  /**建立通知长连接 */
  connect(): void {
    console.debug('建立通知长连接！');
    const wsurl = `${this.baseUrl}common`;
    if (!this.socket || this.socket.disconnected) {
      this.socket = io(wsurl);
      this.socket.on('connect', () => {
        console.debug('已连接成功', this.socket);
      });
    }

    // 系统事件
    this.socket.on('disconnect', (msg: any) => {
      console.debug('disconnect', msg);
    });
    this.socket.on('disconnecting', () => {
      console.debug('disconnecting');
    });
    this.socket.on('error', () => {
      console.debug('error');
    });

    // 自定义事件
    this.socket.on('log', (data: any) => {
      console.debug('收到log消息：', data);
    });
    this.socket.on('setting', (data: any) => {
      console.debug('收到setting消息：', data);
      if (data === 'sys') {
        this.client.get('common/init/sys').subscribe((res: NzSafeAny) => {
          this.settingSrv.setApp(res.data);
          this.titleSrv.suffix = res.data.title;
          console.debug('系统配置已实时更新');
        });
      }
    });

    // 重新初始化用户信息
    this.socket.on('user', (data: any) => {
      console.debug('收到user消息：', data);
      this.userInit().subscribe();
    });

    // 重新初始化菜单信息
    this.socket.on('menu', (data: any) => {
      console.debug('收到menu消息：', data);
      this.menuInit().subscribe(() => this.menuChange());
    });

    // 重新初始化排序信息
    this.socket.on('sort', (data: any) => {
      console.debug('收到sort消息：', data);
      this.sortSub.next(data);
    });
  }

  /**断开通知长连接 */
  disconnet(): void {
    this.socket.close();
  }
}
