import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BaseService } from '@core';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, TitleService } from '@delon/theme';
import { ICONS, ICONS_AUTO } from '@src';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, map, mergeMap, catchError, of } from 'rxjs';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    private iconSrv: NzIconService,
    private settingSrv: SettingsService,
    private aclSrv: ACLService,
    private titleSrv: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenSrv: ITokenService,
    private client: HttpClient,
    private router: Router,
    private baseSrv: BaseService
  ) {
    this.iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  load(): Observable<void> {
    return this.client.get('assets/config/api.json').pipe(
      mergeMap((res: NzSafeAny) => {
        console.debug(`获取API配置`, res.baseUrl, typeof res.baseUrl, typeof res.baseUrl !== 'string');
        if (typeof res.baseUrl !== 'string') {
          throw '未配置有效后端地址！';
        }
        this.baseSrv.baseUrl = res.baseUrl;
        console.debug(`获取token`, this.tokenSrv.get());
        const token = this.tokenSrv.get()?.token;
        if (token) {
          return this.client.get('common/init/startup').pipe(
            mergeMap((res: NzSafeAny) => {
              // 设置应用信息：包括应用名称，说明等
              this.settingSrv.setApp(res['data'].app);
              // 设置浏览器标题栏后缀
              this.titleSrv.suffix = res['data'].app.title || '管理平台';
              if (res.code) {
                throw res.msg;
              } else {
                // 设置用户信息：包括姓名，头像
                this.settingSrv.setUser(res['data'].user);
                // 设置用户权限点
                this.aclSrv.setAbility(res['data'].ability);
                // 连接通用长连接
                this.baseSrv.connect();
                // 初始化菜单信息和用户信息
                return this.baseSrv.menuinit().pipe(mergeMap(() => this.baseSrv.userinit()));
              }
            })
          );
        } else {
          return this.client.get('passport/startup').pipe(
            map((res: NzSafeAny) => {
              if (res.code) {
                throw res.msg;
              } else {
                // 设置应用信息：包括应用名称，说明等
                this.settingSrv.setApp(res['data'].app || {});
                // 设置浏览器标题栏后缀
                this.titleSrv.suffix = res['data'].app.title || '管理平台';
              }
            })
          );
        }
      }),
      catchError(err => {
        console.warn('发生异常：', err);
        this.router.navigateByUrl(this.tokenSrv.login_url!);
        return of();
      })
    );
  }
}
