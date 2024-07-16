import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/pino';
import { MovieRecord } from '../types';
import { prismaClient } from '../utils/prisma';

/**
 * Populate the database with the movies from the CSV file.
 */
export async function populateDatabase(): Promise<void> {
  try {
    const filePath = path.join(__dirname, '../..', 'resources', 'movies.csv');

    logger.info('⏳ Reading data from CSV file...');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });

    const moviesPromises = [];
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

      moviesPromises.push(
        prismaClient.movie.create({
          data: {
            title: movie.title,
            year: parseInt(movie.year),
            producer: movie.producers,
            studios: movie.studios,
            winner: movie.winner === 'yes',
          },
        }),
      );
    }

    await Promise.all(moviesPromises);

    logger.info('✅ Database populated successfully.');
  } catch (error) {
    logger.error(`❌ Failed to populate database: ${error}`);
    process.exit(1);
  }
}
