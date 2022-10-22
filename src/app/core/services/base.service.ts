// 外部依赖
import { Injectable } from '@angular/core';
import { SFSchemaEnum } from '@delon/form';
import { _HttpClient, Menu, SettingsService, TitleService } from '@delon/theme';
import { Result } from '@shared';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';

/**基础服务，需要在多处多次调用 */
@Injectable({ providedIn: 'root' })
export class BaseService {
  /**后端地址 */
  baseUrl: string;
  /**菜单对象最新操作ID */
  private menuOperateId: number;
  /**缓存的菜单Map */
  menuMap: Map<number, any>;
  /**菜单后端更新订阅主体 */
  menuApiSub: BehaviorSubject<any>;
  /**菜单前端路由变化订阅主体 */
  menuWebSub: BehaviorSubject<string>;
  /**角色对象最新操作ID */
  private roleOperateId: number;
  /**角色ID与角色姓名的Map */
  private roleMap: Map<number, string>;
  /**角色选项订阅主体 */
  roleSub: BehaviorSubject<SFSchemaEnum[]>;
  /**用户对象最新操作ID */
  private userOperateId: number;
  /**用户ID与用户姓名的Map */
  private userMap: Map<number, string>;
  /**用户选项订阅主体 */
  userSub: BehaviorSubject<SFSchemaEnum[]>;
  /** 长连接对象 */
  socket!: Socket;

  /**
   * 构建函数
   *
   * @param client 注入的http服务
   * @param settingSrv 注入的数组服务
   * @param titleSrv 注入的数组服务
   */
  constructor(private readonly client: _HttpClient, private readonly settingSrv: SettingsService, private readonly titleSrv: TitleService) {
    this.baseUrl = '';
    this.roleOperateId = 0;
    this.roleMap = new Map<number, string>();
    this.roleSub = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.userOperateId = 0;
    this.userMap = new Map<number, string>();
    this.userSub = new BehaviorSubject<SFSchemaEnum[]>([]);
    this.menuOperateId = 0;
    this.menuMap = new Map<number, any>();
    this.menuWebSub = new BehaviorSubject<string>('');
    this.menuApiSub = new BehaviorSubject<any>('init');
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
      })
    );
  }

  /**
   * 初始化角色数据
   *
   * @returns Observable
   */
  roleInit(): Observable<void> {
    console.debug('初始化角色数据！');
    return this.client.get('common/init/role', { operateId: this.roleOperateId }).pipe(
      map(res => {
        console.debug('接口中的角色数据', res);
        if (!res.code && res.data.length) {
          for (const roleItem of res.data) {
            this.roleMap.set(roleItem.roleId, roleItem.roleName);
            if (this.roleOperateId < roleItem.operateId) {
              this.roleOperateId = roleItem.operateId;
            }
          }
        }
        console.debug('完成角色数据初始化！', this.roleMap);
        const roleList: SFSchemaEnum[] = Array.from(this.roleMap).map(item => ({ value: item[0], label: item[1], title: item[1] }));
        this.roleSub.next(roleList);
        console.debug('最新角色清单', roleList);
      })
    );
  }

  /**角色选项列表 */
  roleList(): SFSchemaEnum[] {
    return Array.from(this.roleMap).map((item: any) => ({ value: item[0], label: item[1] }));
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

  /**用户选项列表 */
  userList(): SFSchemaEnum[] {
    return Array.from(this.userMap).map((item: any) => ({ value: item[0], label: item[1] }));
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

    // 重新初始化菜单信息
    this.socket.on('menu', (data: any) => {
      console.debug('收到menu消息：', data);
      this.menuInit().subscribe(() => this.menuApiSub.next(data));
    });

    // 重新初始化角色信息
    this.socket.on('role', (data: any) => {
      console.debug('收到role消息：', data);
      this.roleInit().subscribe();
    });

    // 重新初始化用户信息
    this.socket.on('user', (data: any) => {
      console.debug('收到user消息：', data);
      this.userInit().subscribe();
    });
  }

  /**断开通知长连接 */
  disconnet(): void {
    this.socket.close();
  }
}
