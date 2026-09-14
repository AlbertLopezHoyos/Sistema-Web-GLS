import { fail } from '../utils/apiResponse.js';

export const notFound = (req, res) => fail(res, 'Ruta no encontrada', 404);
