import { TestBed } from '@angular/core/testing';

import { TenantSubscriptionNamespaceService } from './tenant-subscription-namespace.service';

describe('TenantSubscriptionNamespaceService', () => {
  let service: TenantSubscriptionNamespaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantSubscriptionNamespaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
