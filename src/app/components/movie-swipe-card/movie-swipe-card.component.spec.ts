import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieSwipeCardComponent } from './movie-swipe-card.component';

describe('MovieSwipeCardComponent', () => {
  let component: MovieSwipeCardComponent;
  let fixture: ComponentFixture<MovieSwipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieSwipeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieSwipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
