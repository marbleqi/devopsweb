import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-kong-grant',
  templateUrl: './grant.component.html'
})
export class KongGrantComponent implements OnInit {
  constructor(private http: _HttpClient) {}

  ngOnInit(): void {
    console.debug('');
  }
}
