import client from '../config/client';

export const getRoles = () => {
  return client.get('/roles', { params: { status: '1' } });
}