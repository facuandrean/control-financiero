/**
 * Clase personalizada para manejar errores operativos de la aplicación.
 * Permite capturar el mensaje, el status code y un código de error interno.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, errorCode?: string) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    // Marcamos el error como 'operacional' para diferenciarlo de errores de programación o del sistema
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}