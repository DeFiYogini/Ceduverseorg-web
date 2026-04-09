const http = require('http');
console.error('[health-only] starting');
console.log('[health-only] starting stdout');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('ok');
});
server.listen(5000, () => {
  console.error('[health-only] listening on 5000');
  console.log('[health-only] listening on 5000');
});
