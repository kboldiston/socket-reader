import * as net from 'net';

// Create a server instance
export const createServer = (port: number) => { 
    const server = net.createServer((socket) => {
        console.info('Client connected');

        // Buffer to accumulate incomplete data chunks
        let buffer = Buffer.alloc(0);

        // Handle the 'readable' event
        socket.on('readable', () => {
            let chunk;
            // Read data as long as there's something to read
            while (null !== (chunk = socket.read())) {
                // Append incoming data to the buffer
                buffer = Buffer.concat([buffer, chunk]);

                // Process buffer as long as it has at least 2 bytes for length and enough data for a full message
                while (buffer.length >= 2) {
                    // Read the length of the incoming message (2 bytes)
                    const messageLength = buffer.readUInt16BE(0);

                    // Check if the full message is available
                    if (buffer.length >= messageLength + 2) {
                        // Extract the full message
                        const message = buffer.subarray(2, messageLength + 2);

                        // Remove the processed message from the buffer
                        buffer = buffer.subarray(messageLength + 2);

                        // Handle the message
                        console.info('Received:', message.toString());

                        // Respond to the client
                        const response = `Echo: ${message.toString()}`;
                        const responseLength = Buffer.byteLength(response);
                        const lengthBuffer = Buffer.alloc(2);
                        const messageBuffer = Buffer.alloc(responseLength);
                        lengthBuffer.writeUInt16BE(responseLength, 0);
                        messageBuffer.write(response);

                        socket.write(lengthBuffer);
                        socket.write(messageBuffer);
                    } else {
                        // Wait for more data
                        break;
                    }
                }
            }
        });

        socket.on('end', () => {
            console.info('Client disconnected');
        });

        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });


    // Listen on a specific port
    return server.listen(port, () => {
        console.info('Server listening on port 3000');
    });
};