import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateRequestPage } from './create-request.page';

describe('CreateRequestPage', () => {
  let component: CreateRequestPage;
  let fixture: ComponentFixture<CreateRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
