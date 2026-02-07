import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransaccionPage } from './transaccion.page';

describe('TransaccionPage', () => {
  let component: TransaccionPage;
  let fixture: ComponentFixture<TransaccionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TransaccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
