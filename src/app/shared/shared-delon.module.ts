import { EllipsisModule } from '@delon/abc/ellipsis';
import { OnboardingModule } from '@delon/abc/onboarding';
import { PageHeaderModule } from '@delon/abc/page-header';
import { ResultModule } from '@delon/abc/result';
import { ReuseTabModule } from '@delon/abc/reuse-tab';
import { SEModule } from '@delon/abc/se';
import { STModule } from '@delon/abc/st';
import { SVModule } from '@delon/abc/sv';

export const SHARED_DELON_MODULES = [
  OnboardingModule,
  PageHeaderModule,
  STModule,
  ReuseTabModule,
  SEModule,
  SVModule,
  ResultModule,
  EllipsisModule
];
