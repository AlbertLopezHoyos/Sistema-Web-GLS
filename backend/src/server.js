import app from './app.js';
import env from './config/env.js';

app.listen(env.port, () => {
  console.log(`Sistema Web GLS API escuchando en http://localhost:${env.port}`);
});
