import { Component, OnInit } from '@angular/core';
import { BaseService } from '@core';
import { OnReuseInit } from '@delon/abc/reuse-tab';

import { AuthDashboardService } from '..';

@Component({
  selector: 'app-auth-dashboard',
  templateUrl: './dashboard.component.html'
})
export class AuthDashboardComponent implements OnInit, OnReuseInit {
  constructor(private dashboardService: AuthDashboardService, private baseService: BaseService) {}

  ngOnInit(): void {
    this.baseService.menuWebSub.next('auth');
  }

  _onReuseInit(): void {
    this.baseService.menuWebSub.next('auth');
  }
}
