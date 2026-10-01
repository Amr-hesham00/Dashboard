import http from 'http';

const TARGET_PORT = 3000;
const PROXY_PORT = 3001;

const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error connecting to port 3000: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.on('upgrade', (req, clientSocket) => {
  const proxyReq = http.request({
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` },
  });

  proxyReq.on('upgrade', (proxyRes, targetSocket) => {
    clientSocket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    targetSocket.pipe(clientSocket);
    clientSocket.pipe(targetSocket);
  });

  proxyReq.on('error', () => {
    clientSocket.destroy();
  });

  proxyReq.end();
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy listening on http://localhost:${PROXY_PORT} and forwarding to http://localhost:${TARGET_PORT}`);
});
