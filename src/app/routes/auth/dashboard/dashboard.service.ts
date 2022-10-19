import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Injectable()
export class AuthDashboardService {
  constructor(private client: _HttpClient) {}
}
