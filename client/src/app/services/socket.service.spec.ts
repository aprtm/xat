import { TestBed, inject } from '@angular/core/testing';

import { SocketService } from './sockets.service';

describe('SocketsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocketService]
    });
  });

  it('should be created', inject([SocketService], (service: SocketService) => {
    expect(service).toBeTruthy();
  }));
});
