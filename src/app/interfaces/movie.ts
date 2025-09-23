export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  description: string;
  releaseDate: Date;
  genre: string[];
  duration: number;
  rating: number;
  director?: string;
  cast?: string[];
}
