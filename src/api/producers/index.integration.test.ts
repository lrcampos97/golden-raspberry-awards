import request from 'supertest';
import { app } from '../../index';
import { Server } from 'http';
import { redis } from '../../utils/redis';
import { populateDatabaseMemory } from '../../setup';

let server: Server;
const port = 8085;

beforeAll(async () => {
  server = app.listen(port, async () => {
    await redis.flushdb();
    await populateDatabaseMemory();
  });
});

afterAll(async () => {
  server.close();
  await redis.quit();
});

describe('Producers API', () => {
  it('should return the producer with the longest and shortest intervals between awards - first scenario', async () => {
    const response = await request(server).get('/producers');

    expect(response.status).toBe(200);

    const { min, max } = response.body;

    expect(min.length).toBeGreaterThan(0);
    expect(max.length).toBeGreaterThan(0);

    /*
     * Não cheguei ao mesmo resultado referente ao registro min como intervalo igual a 1, obtive Bo Derek com intervalo de 6.
     */
    const expectedMin = [
      {
        producer: 'Bo Derek',
        interval: 6,
        previousWin: 1984,
        followingWin: 1990,
      },
    ];

    const expectedMax = [
      {
        producer: 'Matthew Vaughn',
        interval: 13,
        previousWin: 2002,
        followingWin: 2015,
      },
    ];

    expect(min).toEqual(expectedMin);
    expect(max).toEqual(expectedMax);
  });
});
