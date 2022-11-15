import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Injectable()
export class CommonHomeService {
  constructor(private clientService: _HttpClient) {}
}
