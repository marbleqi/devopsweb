import { Component, Inject, OnInit } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { TitleService, SettingsService, App } from '@delon/theme';

@Component({
  selector: 'layout-passport',
  templateUrl: './passport.component.html',
  styleUrls: ['./passport.component.less']
})
export class LayoutPassportComponent implements OnInit {
  name!: string;
  description!: string;
  company!: string;
  domain!: string;
  icp!: string;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private titleSrv: TitleService,
    private settingSrv: SettingsService
  ) {}

  ngOnInit(): void {
    this.tokenService.clear();
    const app: App = this.settingSrv.getApp();
    this.name = app?.name || '运维平台';
    this.description = app?.description || '平台在手，天下我有';
    this.company = app?.['company'] || '***公司';
    this.domain = app?.['domain'] || '***.com';
    this.icp = app?.['icp'] || '*ICP备*号-*';
    this.titleSrv.suffix = app?.['title'] || '管理平台';
  }
}
