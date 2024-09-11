import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeMenuComponent } from './coffee-menu.component';

describe('CoffeeMenuComponent', () => {
  let component: CoffeeMenuComponent;
  let fixture: ComponentFixture<CoffeeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoffeeMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoffeeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
