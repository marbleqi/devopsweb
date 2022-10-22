import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';

import { AuthDashboardService } from '..';

@Component({
  selector: 'app-auth-dashboard',
  templateUrl: './dashboard.component.html'
})
export class AuthDashboardComponent implements OnInit {
  constructor(private readonly dashboardSrv: AuthDashboardService, private readonly baseSrv: BaseService) {}

  ngOnInit(): void {
    this.baseSrv.menuWebSub.next('auth');
  }

  _onReuseInit(): void {
    this.baseSrv.menuWebSub.next('auth');
  }
}
