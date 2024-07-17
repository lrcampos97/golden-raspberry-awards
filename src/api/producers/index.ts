import { MovieRecord, ProducerInterval } from '../../types';
import { logger } from '../../utils/pino';
import { Request, Response } from 'express';
import { redis } from '../../utils/redis';

type ProducerWinsType = { [producer: string]: number[] };

export async function producersHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Get all movies from redis.
    const moviesKeys = await redis.keys('movie:*');
    const moviesPromises = moviesKeys.map((key) => redis.get(key));
    const moviesData = await Promise.all(moviesPromises);
    const movies: MovieRecord[] = moviesData
      .filter((data) => data !== null)
      .map((data) => JSON.parse(data))
      .filter((movie) => movie.winner);

    const producerWins = getProducerWins(movies);

    if (!producerWins) {
      res.json({
        min: [],
        max: [],
      });
      return;
    }

    const allIntervals: ProducerInterval[] = [];

    for (const [producer, wins] of Object.entries(producerWins)) {
      // Sort years first
      wins.sort((a, b) => a - b);

      for (let i = 1; i < wins.length; i++) {
        const interval = wins[i] - wins[i - 1];
        const intervalData: ProducerInterval = {
          producer,
          interval,
          previousWin: wins[i - 1],
          followingWin: wins[i],
        };

        allIntervals.push(intervalData);
      }
    }

    const maxInterval = Math.max(
      ...allIntervals.map((interval) => interval.interval),
    );
    const maxIntervals = allIntervals.filter(
      (interval) => interval.interval === maxInterval,
    );

    const minInterval = Math.min(
      ...allIntervals.map((interval) => interval.interval),
    );
    const minIntervals = allIntervals.filter(
      (interval) => interval.interval === minInterval,
    );

    res.json({
      min: minIntervals,
      max: maxIntervals,
    });
  } catch (err) {
    logger.error(`Failed to calculate producers intervals: ${err}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export function getProducerWins(
  movies: MovieRecord[],
): ProducerWinsType | undefined {
  try {
    const producerWins: { [producer: string]: number[] } = {};

    movies.forEach((movie) => {
      // We should only consider records with valid producer and year to calculate the interval
      if (!movie.producers || !movie.year) {
        logger.warn(`Invalid movie record skipped: ${JSON.stringify(movie)}`);
        return;
      }

      // Split multiple producers if present
      const producers = movie.producers.split(',').map((p) => p.trim());

      producers.forEach((producer) => {
        if (!producerWins[producer]) {
          producerWins[producer] = [];
        }
        // Avoid adding duplicate years
        const movieYear = Number(movie.year);
        if (!producerWins[producer].includes(movieYear)) {
          producerWins[producer].push(movieYear);
        }
      });
    });

    return producerWins;
  } catch (err) {
    logger.error(`Failed to get wins from each producer: ${err}`);
  }
}
