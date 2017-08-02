import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyBarComponent } from './notify-bar.component';

describe('NotifyBarComponent', () => {
  let component: NotifyBarComponent;
  let fixture: ComponentFixture<NotifyBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifyBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
