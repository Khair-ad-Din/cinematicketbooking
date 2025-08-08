import { Injectable, signal } from '@angular/core';
import { Movie } from '../interfaces/movie';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  // Mock movie data (will be replaced with API calls later)
  private _movies = signal<Movie[]>([
    {
      id: 1,
      title: 'Los 4 Fantásticos: Primeros pasos',
      posterUrl: 'assets/posters/los_4_fantasticos.png',
      description:
        'Reboot de "Los Cuatro Fantásticos", ahora dentro del MCU. Ambientada en el vibrante telón de fondo de un mundo retro-futurista inspirado en los años 60, presenta a la Primera Familia de Marvel mientras se enfrentan a su desafío más terrorífico hasta la fecha. Obligados a equilibrar sus roles como héroes con la fortaleza de su vínculo familiar, deben defender la Tierra de un dios espacial voraz llamado Galactus y su enigmático Heraldo, Silver Surfer. Y si el plan de Galactus de devorar todo el planeta y a todos en él no fuera lo suficientemente malo, de repente se vuelve muy personal.',
      releaseDate: new Date(2025, 7, 24),
      genre: ['Action', 'Adventure', 'Sciente Fiction'],
      duration: 115,
      rating: 6.8,
      showtimes: ['11:00 AM', '3:00 PM', '8:00 PM'],
    },
    {
      id: 2,
      title: 'Jujutsu Kaisen: Hidden Inventory',
      posterUrl: 'assets/posters/jujutsu_kaisen_hidden_inventory.jpg',
      description:
        'Antes de ser enemigos, Satoru Gojo y Suguru Geto eran compañeros de instituto y amigos. Los dos poderosos hechiceros reciben el encargo de proteger a Riko Amanai, una estudiante que ha sido designada para ser sacrificada como Recipiente de Plasma Estelar hasta que pueda cumplir con su deber. Perseguidos por una secta religiosa y otros usuarios de maldiciones, son los únicos hechiceros capaces de llevar a cabo tan difícil tarea, pero esta misión marcará sus destinos y desafiará a los dos hechiceros de formas inimaginables. El querido y profundamente emotivo arco argumental “Hidden Inventory / Premature Death” del fenómeno mundial JUJUTSU KAISEN regresa a la gran pantalla, alcanzando nuevas cotas tanto para los fans como para los recién llegados.',
      releaseDate: new Date(2025, 7, 30),
      genre: ['Action', 'Animation'],
      duration: 110,
      rating: 7.5,
      showtimes: ['1:00 PM', '6:00 PM', '9:00 PM'],
    },
    {
      id: 3,
      title: 'Superman',
      posterUrl: 'assets/posters/superman_2025.jpg',
      description:
        "'Superman' vuelve a la gran pantalla de la mano de James Gunn, presidente de DC Studios y director de la saga de películas de 'Guardianes de la Galaxia'. Superman vuelve a enfrentarse a nuevos enemigos y sobre todo desconocidos peligros que amenazan de nuevo a la humanidad, pero esta vez veremos más del conflicto interno del mítico superhéroe.",
      releaseDate: new Date(2025, 7, 11),
      genre: ['Action', 'Adventure', 'Fantasy'],
      duration: 129,
      rating: 6,
      showtimes: ['12:00 PM', '4:00 PM', '10:00 PM'],
    },
    {
      id: 4,
      title: 'Pulp Fiction',
      description:
        'Las vidas de dos sicarios de la mafia, un boxeador, un gánster y su esposa y un par de bandidos de un restaurante se entrelazan en cuatro historias de violencia y redención.',
      posterUrl: 'assets/posters/pulp_fiction.jpg',
      releaseDate: new Date(2025, 7, 11),
      rating: 8.9,
      genre: ['Crime', 'Drama'],
      duration: 154,
      showtimes: ['12:00 PM', '4:00 PM', '10:00 PM'],
    },
  ]);

  loading = signal<boolean>(false);

  constructor() {}

  get movies() {
    return this._movies.asReadonly();
  }

  getMovieById(id: number) {
    // In a real application, this will be an API call
    return this._movies().find((movie) => movie.id === id);
  }

  // Method to fetch movies (will be implemented later)
  fetchMovies() {
    // TODO: Implement API call to fetch movies
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }
}
