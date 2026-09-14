export class AppError extends Error {
  constructor(message, status = 400, errors = undefined) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(errors, message = 'Datos inválidos') {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Sin permisos') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos') {
    super(message, 409);
  }
}
