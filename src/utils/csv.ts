import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { MovieRecord } from '../types';
import { logger } from './pino';

export async function retrieveMovieListFromCSV(): Promise<MovieRecord[]> {
  const filePath = path.join(__dirname, '../..', 'resources', 'movielist.csv');

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

  const records: MovieRecord[] = [];

  for await (const record of parser) {
    records.push(record);
  }

  return records;
}
