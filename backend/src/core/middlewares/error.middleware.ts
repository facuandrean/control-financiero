import { Request, Response, NextFunction } from 'express'; 
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

const FIELD_LABELS_ES: Record<string, string> = {
  name: "Nombre",
  bank: "Banco / Entidad",
  type: "Tipo de cuenta",
  tag: "Etiqueta",
  amount: "Saldo / Monto",
  description: "Descripción",
  lastDigits: "Últimos dígitos de la tarjeta",
  creditLimit: "Límite de crédito",
  closingDay: "Día de cierre",
  dueDate: "Día de vencimiento",
  status: "Estado",
  accountID: "Cuenta de origen",
  toAccountID: "Cuenta de destino",
  categoryID: "Categoría",
  entityID: "Entidad",
  date: "Fecha",
  totalAmount: "Monto total",
  paidAmount: "Monto pagado",
  email: "Correo electrónico",
  password: "Contraseña",
};

/**
 * Traduce y formatea los issues de Zod a mensajes claros y en español para el usuario final.
 */
const formatZodIssue = (issue: any): string => {
  const fieldKey = issue.path[issue.path.length - 1];
  const fieldName = (fieldKey && FIELD_LABELS_ES[String(fieldKey)]) || (fieldKey ? `el campo '${fieldKey}'` : "el campo");

  // Si ya tiene un mensaje personalizado en español, usarlo
  if (
    issue.message &&
    !issue.message.startsWith("Invalid input") &&
    !issue.message.startsWith("Expected ") &&
    !issue.message.toLowerCase().includes("expected ") &&
    !issue.message.toLowerCase().includes("received ") &&
    issue.message !== "Required"
  ) {
    return issue.message;
  }

  // Traducción amigable de mensajes por defecto de Zod
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined" || issue.received === "null") {
        return `Por favor completá ${fieldName}, es obligatorio.`;
      }
      if (issue.expected === "number") {
        return `${fieldName} debe ser un valor numérico válido.`;
      }
      if (issue.expected === "string") {
        return `${fieldName} debe ser un texto válido.`;
      }
      return `${fieldName} tiene un formato no válido.`;

    case "too_small":
      if (issue.type === "string") {
        return `${fieldName} debe contener al menos ${issue.minimum} caracteres.`;
      }
      if (issue.type === "number") {
        return `${fieldName} debe ser mayor o igual a ${issue.minimum}.`;
      }
      return `${fieldName} es menor a lo permitido.`;

    case "too_big":
      if (issue.type === "string") {
        return `${fieldName} no puede superar los ${issue.maximum} caracteres.`;
      }
      if (issue.type === "number") {
        return `${fieldName} no puede superar ${issue.maximum}.`;
      }
      return `${fieldName} supera el límite permitido.`;

    case "invalid_enum_value":
      return `La opción seleccionada para ${fieldName} no es válida.`;

    default:
      return `${fieldName} contiene un dato no válido. Por favor verificalo.`;
  }
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Si el error es una instancia de nuestro AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      errorCode: err.errorCode || 'INTERNAL_ERROR',
      message: err.message,
    });
  }

  // 2. Errores específicos de validación de Zod
  if (err instanceof ZodError) {
    const messages = err.issues.map(formatZodIssue);

    return res.status(400).json({
      status: 'error',
      errorCode: 'VALIDATION_ERROR',
      message: messages.join('. '),
      errors: messages,
    });
  }

  // 3. Errores de Base de Datos conocidos (Restricciones únicas, etc.)
  if (err?.message?.includes('UNIQUE constraint failed')) {
    let friendlyMsg = 'Ya existe un registro con esos datos.';
    if (err.message.includes('users.email')) {
      friendlyMsg = 'Ya existe una cuenta registrada con este correo electrónico.';
    }
    return res.status(400).json({
      status: 'error',
      errorCode: 'DUPLICATE_ENTRY',
      message: friendlyMsg,
    });
  }

  // 4. Error genérico (500) - Loguear detalle interno solo en consola de servidor
  console.error('[Error no controlado]:', err);

  // Mensaje amigable al usuario sin exponer detalles internos de la base de datos o del sistema
  return res.status(500).json({
    status: 'error',
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'Ocurrió un error inesperado al procesar la solicitud. Por favor, intentá nuevamente.',
  });
};