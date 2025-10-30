import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassroomHistoryPage } from './classroom-history.page';

describe('ClassroomHistoryPage', () => {
  let component: ClassroomHistoryPage;
  let fixture: ComponentFixture<ClassroomHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassroomHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
