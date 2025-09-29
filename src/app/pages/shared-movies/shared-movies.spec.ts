import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMovies } from './shared-movies';

describe('SharedMovies', () => {
  let component: SharedMovies;
  let fixture: ComponentFixture<SharedMovies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedMovies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedMovies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
