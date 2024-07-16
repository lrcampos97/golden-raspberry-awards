import { Movie } from '@prisma/client';
import { ProducerInterval } from '../../types';
import { logger } from '../../utils/pino';
import { prismaClient } from '../../utils/prisma';
import { Request, Response } from 'express';

type ProducerWinsType = { [producer: string]: number[] };

export async function producersHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const movies = await prismaClient.movie.findMany({
      where: { winner: true },
    });

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

      // coletar os intervalos
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

    // Maior intervalo entre os premios dos produtores
    let maxIntervals: ProducerInterval[] = [];
    const maxInterval = Math.max(
      ...allIntervals.map((interval) => interval.interval),
    );
    maxIntervals = allIntervals.filter(
      (interval) => interval.interval === maxInterval,
    );

    // Menor intervalo
    let minIntervals: ProducerInterval[] = [];
    const minInterval = Math.min(
      ...allIntervals.map((interval) => interval.interval),
    );
    minIntervals = allIntervals.filter(
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

export function getProducerWins(movies: Movie[]): ProducerWinsType | undefined {
  try {
    const producerWins: { [producer: string]: number[] } = {};

    movies.forEach((movie) => {
      // We should only consider records with valid producer and year to calculate the interval
      if (!movie.producer || !movie.year) {
        logger.warn(`Invalid movie record skipped: ${JSON.stringify(movie)}`);
        return;
      }

      if (!producerWins[movie.producer]) {
        producerWins[movie.producer] = [];
      }
      producerWins[movie.producer].push(movie.year);
    });

    return producerWins;
  } catch (err) {
    logger.error(`Failed to get wins from each producers: ${err}`);
  }
}
