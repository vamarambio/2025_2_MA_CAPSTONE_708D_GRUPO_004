import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportReportPage } from './export-report.page';

describe('ExportReportPage', () => {
  let component: ExportReportPage;
  let fixture: ComponentFixture<ExportReportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
