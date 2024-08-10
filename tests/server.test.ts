// server.test.ts
import { createServer } from '../src/server';
import * as net from 'net';

type Metric = {
    message: string;
    duration: number;
    startTime: Date
}

const startMetrics = () => {
    const startTime = Date.now();
    return (message: string): Metric => {
        return {
            message,
            duration: Date.now() - startTime,
            startTime: new Date(startTime)
        }
    }
}

const SECOND_IN_MS = 1000;

describe('Server Performance Test', () => {
    let server: ReturnType<typeof createServer>;
    const port = 3001;

    beforeAll(() => {
        jest.spyOn(console, 'info').mockImplementation(jest.fn());
        server = createServer(port);
    });

    afterAll(() => {
        server.close();
        jest.clearAllMocks();
    });

    it('should handle 75 connections per second', async () => {
        const connections = 75;
        const message = 'Hello';
        const messageBuffer = Buffer.alloc(2 + message.length);
        messageBuffer.writeUInt16BE(message.length, 0);
        messageBuffer.write(message, 2);

        const clients: Promise<Metric>[] = [];

        const startTime = Date.now();

        for (let i = 0; i < connections; i++) {
            const clientPromise = new Promise<Metric>((resolve, reject) => {
                let metric: Function;
                const client = net.createConnection({ port }, () => {
                    client.write(messageBuffer);
                });

                client.on('connect', () => {
                    metric = startMetrics();
                })

                client.on('data', (data) => {
                    const length = data.readUInt16BE(0);
                    const response = data.subarray(2, 2 + length).toString();
                    resolve(metric(response));
                    client.end();
                });

                client.on('error', (err) => {
                    reject(err);
                });
            });

            clients.push(clientPromise);
            await new Promise(r => setTimeout(r, SECOND_IN_MS / connections));
        }

        const metrics = await Promise.all(clients);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Assert that all clients received the correct response
        metrics.forEach((metric) => {
            expect(metric.message).toBe(`Echo: ${message}`);
            expect(metric.duration).toBeLessThan(50);
        });


        console.table(metrics);

        const firstMessageTime = metrics[0].startTime.getTime();
        const lastMessageTime = metrics[metrics.length -1].startTime.getTime();

        const durationOfSends = lastMessageTime - firstMessageTime;
        expect(durationOfSends).toBeLessThan(SECOND_IN_MS + 500);

        console.log(`Handled ${connections} connections in ${duration} ms`);
        console.log(`Client sent all messages within ${durationOfSends} ms`);
    }, 20000); // Increased timeout for the test if needed
});