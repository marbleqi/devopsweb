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
import { Observable, map, mergeMap, catchError, of, zip } from 'rxjs';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    private iconService: NzIconService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private clientService: HttpClient,
    private router: Router,
    private baseService: BaseService
  ) {
    this.iconService.addIcon(...ICONS_AUTO, ...ICONS);
  }

  load(): Observable<void> {
    return this.clientService.get('assets/config/api.json').pipe(
      mergeMap((res: NzSafeAny) => {
        console.debug(`获取API配置`, res.baseUrl, typeof res.baseUrl, typeof res.baseUrl !== 'string');
        if (typeof res.baseUrl !== 'string') {
          throw '未配置有效后端地址！';
        }
        this.baseService.baseUrl = res.baseUrl;
        console.debug(`获取token`, this.tokenService.get());
        const token = this.tokenService.get()?.token;
        // 判断令牌有效性
        if (token) {
          // 当令牌有效时，初始化应用信息的同时，也尝试初始化用户信息
          return this.clientService.get('common/init/startup').pipe(
            mergeMap((res: NzSafeAny) => {
              // 设置应用信息：包括应用名称，说明等
              this.settingService.setApp(res.data.app);
              // 设置浏览器标题栏后缀
              this.titleService.suffix = res.data.app.title || '管理平台';
              // 判断响应结果
              if (res.code) {
                // 当响应异常时，返回异常消息
                throw res.msg;
              } else {
                // 当响应正常时，开始在前端初始化用户基础数据
                // 设置用户信息：包括姓名，头像
                this.settingService.setUser(res.data.user);
                // 设置用户权限点
                this.aclService.setAbility(res.data.ability);
                // 连接通用长连接
                this.baseService.connect();
                // 初始化菜单，角色，用户数据
                return zip(this.baseService.menuInit(), this.baseService.roleInit(), this.baseService.userInit()).pipe(map(() => {}));
              }
            })
          );
        } else {
          // 当令牌无效时，只初始化应用信息
          return this.clientService.get('passport/startup').pipe(
            map((res: NzSafeAny) => {
              if (res.code) {
                throw res.msg;
              } else {
                // 设置应用信息：包括应用名称，说明等
                this.settingService.setApp(res.data.app || {});
                // 设置浏览器标题栏后缀
                this.titleService.suffix = res.data.app.title || '管理平台';
              }
            })
          );
        }
      }),
      catchError(err => {
        console.warn('发生异常：', err);
        this.router.navigateByUrl(this.tokenService.login_url!);
        return of();
      })
    );
  }
}
