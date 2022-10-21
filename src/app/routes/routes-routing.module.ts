import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { startPageGuard } from '@core';
import { ACLGuard } from '@delon/acl';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env';
// layout
import { LayoutBasicComponent, LayoutBlankComponent, LayoutPassportComponent } from '@layout';

// dashboard pages
import { CallbackComponent, UserLoginComponent } from '.';
// single pages

const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [startPageGuard, SimpleGuard],
    children: [
      { path: '', redirectTo: 'sys', pathMatch: 'full' },
      { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
      // 业务子模块
      { path: 'common', loadChildren: () => import('./common/common.module').then(m => m.CommonModule) },
      {
        path: 'sys',
        canActivate: [ACLGuard],
        data: { guard: [100] },
        loadChildren: () => import('./sys/sys.module').then(m => m.SysModule)
      },
      {
        path: 'auth',
        canActivate: [ACLGuard],
        data: { guard: [200] },
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
      },
      {
        path: 'wxwork',
        canActivate: [ACLGuard],
        data: { guard: [300] },
        loadChildren: () => import('./wxwork/wxwork.module').then(m => m.WxworkModule)
      },
      {
        path: 'dingtalk',
        canActivate: [ACLGuard],
        data: { guard: [400] },
        loadChildren: () => import('./dingtalk/dingtalk.module').then(m => m.DingtalkModule)
      }
    ]
  },
  // 空白布局
  {
    path: 'blank',
    component: LayoutBlankComponent,
    children: []
  },
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: 'login', component: UserLoginComponent, data: { title: '登录' } },
      { path: 'callback/:type', component: CallbackComponent, data: { title: '扫码认证' } }
    ]
  },
  // 单页不包裹Layout
  { path: '**', redirectTo: 'exception/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top'
    })
  ],
  exports: [RouterModule]
})
export class RouteRoutingModule {}
