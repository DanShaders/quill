const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const ports = {
  proxy: parseInt(process.env.npm_package_config_ports_proxy, 10),
  karma: parseInt(process.env.npm_package_config_ports_karma, 10),
  webpack: parseInt(process.env.npm_package_config_ports_webpack, 10),
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/karma') || req.url === '/assets/favicon.png') {
    proxy.web(req, res, { ignorePath: false, target: { port: ports.karma } });
  } else {
    const target = `http://localhost:${ports.webpack}/${req.url}`;
    proxy.web(req, res, {
      ignorePath: true,
      target,
    });
  }
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

proxy.on('error', e => {
  console.error(e);
});

console.log('Proxy listening on ' + ports.proxy);
server.listen(ports.proxy, '0.0.0.0');
