import http from "http";
import routes from "./routes.js";

const server = http.createServer((req, res) => {
  const route = routes.find((route) => {
    return route.path === req.url && route.method === req.method;
  });

  if (route) {
    route.handler({ req, res });
  } else {
    res.statusCode = 404;
    res.end("Not found");
  }
});

const port = process.env.PORT || 3000;

server.listen(port || 3000, () => {
  console.log(`Server is running on port ${port}`);
});
