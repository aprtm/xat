import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsgWindowComponent } from './msg-window.component';

describe('ChatUiComponent', () => {
  let component: MsgWindowComponent;
  let fixture: ComponentFixture<MsgWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsgWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsgWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
