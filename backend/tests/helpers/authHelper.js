import request from 'supertest';

export const loginAs = async (app, email, password = 'demo123') => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password, remember: false });
  return { res, cookie: res.headers['set-cookie'] };
};

export const authRequest = (app, method, path, cookie) => {
  const req = request(app)[method](path);
  if (cookie) req.set('Cookie', cookie);
  return req;
};
