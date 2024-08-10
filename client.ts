import * as net from 'net';

const client = new net.Socket();
const port = 5000;

client.connect(port, 'localhost', () => {
  console.log(`Connected to server on port ${port}`);

  // Function to send a message with a length prefix
  function sendMessage(message: string) {
    const messageBuffer = Buffer.from(message, 'utf-8');
    const lengthBuffer = Buffer.alloc(2);
    lengthBuffer.writeUInt16BE(messageBuffer.length, 0);
    
    client.write(lengthBuffer)
    client.write(messageBuffer);
    console.log(`Sent message: ${message}`);
  }

  // Example messages to send
  for(let i =0; i < 5; i++) {
    sendMessage(`${i}: Hello, world!`);
    sendMessage(`${i}: Another message`);
  }
});

client.on('data', (data) => {
  console.log(`Received data: ${data.toString()}`);
});

client.on('close', () => {
  console.log('Connection closed');
});
