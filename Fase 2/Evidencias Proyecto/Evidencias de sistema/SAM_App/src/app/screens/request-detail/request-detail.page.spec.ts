import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestDetailPage } from './request-detail.page';

describe('RequestDetailPage', () => {
  let component: RequestDetailPage;
  let fixture: ComponentFixture<RequestDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
