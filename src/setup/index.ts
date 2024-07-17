import { logger } from '../utils/pino';
import { MovieRecord } from '../types';
import { redis, setCache } from '../utils/redis';
import { retrieveMovieListFromCSV } from '../utils/csv';

/**
 * Populate the database memory with the movies from the CSV file.
 */
export async function populateDatabaseMemory(): Promise<void> {
  try {
    const movies = await retrieveMovieListFromCSV();
    // Clear the database memory before populating it.
    await redis.flushdb();

    for await (const record of movies) {
      const movie: MovieRecord = record;
      const movieKey = `movie:${movie.title}`;

      const movieValue = JSON.stringify({
        title: movie.title,
        year: movie.year,
        producers: movie.producers,
        studios: movie.studios,
        winner: movie.winner === 'yes',
      });

      setCache(movieKey, movieValue);
    }

    logger.info('✅ Database memory populated successfully.');
  } catch (error) {
    logger.error(`❌ Failed to populate database memory: ${error}`);
    process.exit(1);
  }
}
