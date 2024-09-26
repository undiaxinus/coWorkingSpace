import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecietComponent } from './reciet.component';

describe('RecietComponent', () => {
  let component: RecietComponent;
  let fixture: ComponentFixture<RecietComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecietComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecietComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
