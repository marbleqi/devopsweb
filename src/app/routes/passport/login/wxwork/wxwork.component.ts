import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { _HttpClient } from '@delon/theme';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { stringify } from 'qs';

@Component({
  selector: 'app-routes-wxwork',
  templateUrl: './wxwork.component.html'
})
export class LoginWxworkComponent implements OnInit {
  wxworkqr!: SafeResourceUrl;

  constructor(private modal: NzModalRef, private sanitizer: DomSanitizer, public clientService: _HttpClient) {}

  ngOnInit(): void {
    this.clientService.get('passport/qrurl/wxwork').subscribe(res => {
      if (!res.code) {
        let params: object = res.data;
        params = {
          ...params,
          redirect_uri: `${window.location.origin}/passport/callback/wxwork`,
          href: `${window.location.origin}/assets/wxwork-qr.css`
        };
        this.wxworkqr = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?${stringify(params)}`
        );
      }
    });
  }

  close(): void {
    this.modal.destroy();
  }
}
