import { TmdbMovie } from './../interfaces/tmdb-movie';
import { TmdbService } from './tmdb.service';
import { inject, Injectable, signal } from '@angular/core';
import { Movie } from '../interfaces/movie';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private genreMap: { [key: number]: string } = {
    28: 'Acción',
    12: 'Aventura',
    16: 'Animación',
    35: 'Comedia',
    80: 'Crimen',
    99: 'Documental',
    18: 'Drama',
    10751: 'Familia',
    14: 'Fantasía',
    36: 'Historia',
    27: 'Terror',
    10402: 'Música',
    9648: 'Misterio',
    10749: 'Romance',
    878: 'Ciencia Ficción',
    10770: 'Película de TV',
    53: 'Thriller',
    10752: 'Bélica',
    37: 'Western',
  };

  private readonly FALLBACK_MOVIES: Movie[] = [
    {
      id: 1,
      title: 'Los 4 Fantásticos: Primeros pasos',
      posterUrl: 'assets/posters/los_4_fantasticos.png',
      description:
        'Reboot de "Los Cuatro Fantásticos", ahora dentro del MCU. Ambientada en el vibrante telón de fondo de un mundo retro-futurista inspirado en los años 60, presenta a la Primera Familia de Marvel mientras se enfrentan a su desafío más terrorífico hasta la fecha. Obligados a equilibrar sus roles como héroes con la fortaleza de su vínculo familiar, deben defender la Tierra de un dios espacial voraz llamado Galactus y su enigmático Heraldo, Silver Surfer. Y si el plan de Galactus de devorar todo el planeta y a todos en él no fuera lo suficientemente malo, de repente se vuelve muy personal.',
      releaseDate: new Date(2025, 7, 24),
      genre: ['Acción', 'Aventura', 'Ciencia Ficción'],
      duration: 115,
      rating: 6.8,
    },
    {
      id: 2,
      title: 'Jujutsu Kaisen: Hidden Inventory',
      posterUrl: 'assets/posters/jujutsu_kaisen_hidden_inventory.jpg',
      description:
        'Antes de ser enemigos, Satoru Gojo y Suguru Geto eran compañeros de instituto y amigos. Los dos poderosos hechiceros reciben el encargo de proteger a Riko Amanai, una estudiante que ha sido designada para ser sacrificada como Recipiente de Plasma Estelar hasta que pueda cumplir con su deber. Perseguidos por una secta religiosa y otros usuarios de maldiciones, son los únicos hechiceros capaces de llevar a cabo tan difícil tarea, pero esta misión marcará sus destinos y desafiará a los dos hechiceros de formas inimaginables. El querido y profundamente emotivo arco argumental “Hidden Inventory / Premature Death” del fenómeno mundial JUJUTSU KAISEN regresa a la gran pantalla, alcanzando nuevas cotas tanto para los fans como para los recién llegados.',
      releaseDate: new Date(2025, 7, 30),
      genre: ['Acción', 'Anime'],
      duration: 110,
      rating: 7.5,
    },
    {
      id: 3,
      title: 'Superman',
      posterUrl: 'assets/posters/superman_2025.jpg',
      description:
        "'Superman' vuelve a la gran pantalla de la mano de James Gunn, presidente de DC Studios y director de la saga de películas de 'Guardianes de la Galaxia'. Superman vuelve a enfrentarse a nuevos enemigos y sobre todo desconocidos peligros que amenazan de nuevo a la humanidad, pero esta vez veremos más del conflicto interno del mítico superhéroe.",
      releaseDate: new Date(2025, 7, 11),
      genre: ['Acción', 'Aventura', 'Fantasía'],
      duration: 129,
      rating: 6,
    },
    {
      id: 4,
      title: 'Pulp Fiction',
      description:
        'Las vidas de dos sicarios de la mafia, un boxeador, un gánster y su esposa y un par de bandidos de un restaurante se entrelazan en cuatro historias de violencia y redención.',
      posterUrl: 'assets/posters/pulp_fiction.jpg',
      releaseDate: new Date(2025, 7, 11),
      rating: 8.9,
      genre: ['Crimen', 'Drama'],
      duration: 154,
    },
  ];

  private hasDataBeenFetched = false;

  private _movies = signal<Movie[]>([]);

  private mapTmdbToMovie(tmdbMovie: TmdbMovie): Movie {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      posterUrl: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
      releaseDate: new Date(tmdbMovie.release_date),
      rating: Math.round(tmdbMovie.vote_average * 10) / 10,
      genre: this.mapGenreId(tmdbMovie.genre_ids),
      duration: 120, //TODO: Seek which API call offers the film duration; 120min for now.
    };
  }

  loading = signal<boolean>(false);
  tmdbService = inject(TmdbService);

  constructor() {
    // Test TMDB Connection
    // this.tmdbService.getPopularMovies().subscribe({
    //   next: (data) => console.log('TMDB Response: ', data),
    //   error: (error) => console.log('TMDB Error: ', error),
    // });
  }

  get movies() {
    return this._movies.asReadonly();
  }

  getMovieById(id: number) {
    // In a real application, this will be an API call
    return this._movies().find((movie) => movie.id === id);
  }

  private mapGenreId(genreIds: number[]): string[] {
    return genreIds.map((id) => this.genreMap[id] || 'Desconocido');
  }

  fetchMovies() {
    if (this.hasDataBeenFetched) return;
    this.hasDataBeenFetched = true;
    this.loading.set(true);
    this.tmdbService.getPopularMovies().subscribe({
      next: (response) => {
        const tmdbMovies = response.results.map((tmdbMovie) =>
          this.mapTmdbToMovie(tmdbMovie)
        );
        this._movies.set(tmdbMovies);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to fetch movies: ', error);
        this._movies.set(this.FALLBACK_MOVIES);
        this.loading.set(false);
      },
    });
  }
}
