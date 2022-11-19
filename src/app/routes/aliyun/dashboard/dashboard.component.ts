import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-aliyun-dashboard',
  templateUrl: './dashboard.component.html'
})
export class AliyunDashboardComponent implements OnInit {
  constructor(private http: _HttpClient) {}

  ngOnInit(): void {
    console.debug('');
  }
}
