import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService, SocialService } from '@delon/auth';
import { TitleService, SettingsService, App, _HttpClient, ModalHelper } from '@delon/theme';
import { Result } from '@shared';
import { stringify } from 'qs';
import { finalize } from 'rxjs';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  loading = false;
  pwd = false;
  wxwork = false;
  dingtalk = false;
  info: string = '';
  constructor(
    fb: FormBuilder,
    private router: Router,
    private titleSrv: TitleService,
    private settingSrv: SettingsService,
    @Optional() @Inject(ReuseTabService) private reuseTabSrv: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenSrv: ITokenService,
    private socialSrv: SocialService,
    private startupSrv: StartupService,
    private client: _HttpClient,
    private modal: ModalHelper,
    private cdr: ChangeDetectorRef
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
    console.debug('登陆页构建');
  }

  get userName(): AbstractControl {
    return this.form.get('userName')!;
  }
  get password(): AbstractControl {
    return this.form.get('password')!;
  }

  ngOnInit(): void {
    this.titleSrv.setTitle('登录');
    const app: App = this.settingSrv.getApp();
    this.pwd = app?.['password'] || false;
    this.wxwork = app?.['wxwork'] || false;
    this.dingtalk = app?.['dingtalk'] || false;
    // 如果判断用户的企业微信APP访问
    if (navigator.userAgent.includes('wxwork')) {
      this.client.get('passport/qrurl/wxwork').subscribe(res => {
        if (!res.code) {
          let params: object = res.data;
          params = {
            ...params,
            redirect_uri: `${window.location.origin}/passport/callback/wxwork`,
            response_type: 'code',
            scope: 'snsapi_base'
          };
          const url = `https://open.weixin.qq.com/connect/oauth2/authorize?${stringify(params)}#wechat_redirect`;
          this.socialSrv.login(url, '/', { type: 'href' });
        }
      });
    }
    // 如果判断用户的钉钉APP访问
    if (navigator.userAgent.includes('dingtalk')) {
      // this.todingtalk();
      this.info = navigator.userAgent;
    }
  }

  /**页面重定向到钉钉登陆地址 */
  todingtalk(): void {
    this.client.get('passport/qrurl/dingtalk').subscribe(res => {
      if (!res.code) {
        const params = {
          redirect_uri: `${window.location.origin}/passport/callback/dingtalk`,
          response_type: 'code',
          client_id: res.data.appkey,
          scope: 'openid',
          prompt: 'consent'
        };
        window.location.href = `https://login.dingtalk.com/oauth2/auth?${stringify(params)}`;
      }
    });
  }

  open(type: 'wxwork' | 'dingtalk'): void {
    if (type === 'wxwork') {
      // this.modal.createStatic(LoginWxworkComponent, {}, { size: 'sm', modalOptions: { nzCentered: true } }).subscribe();
    } else {
      this.todingtalk();
    }
  }

  submit(): void {
    this.userName.markAsDirty();
    this.userName.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.userName.invalid || this.password.invalid) {
      return;
    }

    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
    this.loading = true;
    this.cdr.detectChanges();
    this.client
      .post('passport/login', {
        loginName: this.userName.value,
        loginPsw: this.password.value
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((res: Result) => {
        if (res.code) {
          this.error = res.msg;
          this.cdr.detectChanges();
          return;
        }
        this.error = '';
        // 清空路由复用信息
        this.reuseTabSrv.clear();
        // 设置用户Token信息
        const data: ITokenModel = res.data;
        this.tokenSrv.set(data);
        console.debug('获取令牌', this.tokenSrv.get());
        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        this.startupSrv.load().subscribe(() => {
          let url = this.tokenSrv.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          this.router.navigateByUrl(url);
        });
      });
  }
}
