import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieSwipeComponent } from './movie-swipe.component';

describe('MovieSwipeComponent', () => {
  let component: MovieSwipeComponent;
  let fixture: ComponentFixture<MovieSwipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieSwipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieSwipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
