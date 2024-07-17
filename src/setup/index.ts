import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/pino';
import { MovieRecord } from '../types';
import { setCache } from '../utils/redis';

/**
 * Populate the database memory with the movies from the CSV file.
 */
export async function populateDatabaseMemory(): Promise<void> {
  try {
    const filePath = path.join(
      __dirname,
      '../..',
      'resources',
      'movielist.csv',
    );

    logger.info('⏳ Reading data from CSV file...');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });

    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: [';'],
      trim: true,
      ignore_last_delimiters: true,
      relax_column_count: true,
    });

    for await (const record of parser) {
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
