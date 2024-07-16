import request from 'supertest';
import { app } from '../../index';
import { Server } from 'http';
import { prismaClient } from '../../utils/prisma';

let server: Server;
const port = 8085;

beforeAll(async () => {
  server = app.listen(port, async () => {
    await prismaClient.$connect();
  });
});

beforeEach(async () => {
  await prismaClient.movie.deleteMany();
});

afterAll(async () => {
  await prismaClient.$disconnect();
  server.close();
});

describe('Producers API', () => {
  it('should return the producer with the longest and shortest intervals between awards - first scenario', async () => {
    // Mock data
    const movies = [
      {
        year: 1980,
        title: "Can't Stop the Music",
        studios: 'Associated Film Distribution',
        producer: 'Allan Carr',
        winner: true,
      },
      {
        year: 1984,
        title: "Where the Boys Are '84",
        studios: 'TriStar Pictures',
        producer: 'Allan Carr',
        winner: true,
      },
      {
        year: 1984,
        title: 'Bolero',
        studios: 'Cannon Films',
        producer: 'Bo Derek',
        winner: true,
      },
      {
        year: 1990,
        title: "Ghosts Can't Do It",
        studios: 'Triumph Releasing',
        producer: 'Bo Derek',
        winner: true,
      },
      {
        year: 1997,
        title: 'The Postman',
        studios: 'Warner Bros.',
        producer: 'Kevin Costner, Steve Tisch, Jim Wilson',
        winner: true,
      },
      {
        year: 1999,
        title: 'Wild Wild West',
        studios: 'Warner Bros.',
        producer: 'Jon Peters, Barry Sonnenfeld',
        winner: true,
      },
      {
        year: 1985,
        title: 'Rambo: First Blood Part II',
        studios: 'Columbia Pictures',
        producer: 'Buzz Feitshans',
        winner: true,
      },
      {
        year: 1986,
        title: 'Howard the Duck',
        studios: 'Universal Studios',
        producer: 'Gloria Katz',
        winner: true,
      },
      {
        year: 1987,
        title: 'Leonard Part 6',
        studios: 'Columbia Pictures',
        producer: 'Bill Cosby',
        winner: true,
      },
      {
        year: 1988,
        title: 'Cocktail',
        studios: 'Touchstone Pictures',
        producer: 'Ted Field, Robert W. Cort',
        winner: true,
      },
      {
        year: 1989,
        title: 'Star Trek V: The Final Frontier',
        studios: 'Paramount Pictures',
        producer: 'Harve Bennett',
        winner: true,
      },
      {
        year: 1991,
        title: 'Hudson Hawk',
        studios: 'TriStar Pictures',
        producer: 'Joel Silver',
        winner: true,
      },
      {
        year: 1992,
        title: 'Shining Through',
        studios: '20th Century Fox',
        producer: 'Edward Lewis',
        winner: true,
      },
    ];

    await prismaClient.movie.createMany({ data: movies });

    const response = await request(server).get('/producers');

    expect(response.status).toBe(200);

    const { min, max } = response.body;

    expect(min.length).toBeGreaterThan(0);
    expect(max.length).toBeGreaterThan(0);

    // Menor intervalo
    expect(min).toEqual([
      {
        producer: 'Allan Carr',
        interval: 4,
        previousWin: 1980,
        followingWin: 1984,
      },
    ]);

    // Maior invervalo
    expect(max).toEqual([
      {
        producer: 'Bo Derek',
        interval: 6,
        previousWin: 1984,
        followingWin: 1990,
      },
    ]);
  });

  it('should return the producer with the longest and shortest intervals between awards - second scenario', async () => {
    // Another mock data
    const movies = [
      {
        year: 1980,
        title: 'Movie A',
        studios: 'Studio A',
        producer: 'Producer1',
        winner: true,
      },
      {
        year: 1982,
        title: 'Movie B',
        studios: 'Studio B',
        producer: 'Producer1',
        winner: true,
      },
      {
        year: 1985,
        title: 'Movie C',
        studios: 'Studio C',
        producer: 'Producer2',
        winner: true,
      },
      {
        year: 1990,
        title: 'Movie D',
        studios: 'Studio D',
        producer: 'Producer2',
        winner: true,
      },
      {
        year: 1981,
        title: 'Movie E',
        studios: 'Studio E',
        producer: 'Producer3',
        winner: true,
      },
      {
        year: 1991,
        title: 'Movie F',
        studios: 'Studio F',
        producer: 'Producer3',
        winner: true,
      },
      {
        year: 1983,
        title: 'Movie G',
        studios: 'Studio G',
        producer: 'Producer4',
        winner: true,
      },
      {
        year: 1984,
        title: 'Movie H',
        studios: 'Studio H',
        producer: 'Producer5',
        winner: true,
      },
      {
        year: 1986,
        title: 'Movie I',
        studios: 'Studio I',
        producer: 'Producer6',
        winner: true,
      },
      {
        year: 1988,
        title: 'Movie J',
        studios: 'Studio J',
        producer: 'Producer7',
        winner: true,
      },
    ];

    await prismaClient.movie.createMany({ data: movies });

    const response = await request(server).get('/producers');

    expect(response.status).toBe(200);

    const { min, max } = response.body;

    expect(min.length).toBeGreaterThan(0);
    expect(max.length).toBeGreaterThan(0);

    expect(min).toEqual([
      {
        producer: 'Producer1',
        interval: 2,
        previousWin: 1980,
        followingWin: 1982,
      },
    ]);

    expect(max).toEqual([
      {
        producer: 'Producer3',
        interval: 10,
        previousWin: 1981,
        followingWin: 1991,
      },
    ]);
  });
});
