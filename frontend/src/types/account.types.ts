export interface Account {
  id: string;
  userID?: string;
  name: string;
  bank: string;
  type: string;        // Ej: "Tarjeta de Crédito"
  tag: string;         // Ej: "crédito"
  description?: string;
  lastDigits?: string;
  amount?: number;
  creditLimit?: number;
  closingDay?: number;
  dueDate?: number;    // Día de vencimiento
  status?: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

// Tipo estricto para el body que se envía al crear una cuenta (POST)
export interface CreateAccountInput {
  name: string;
  bank: string;
  type: string;
  tag: string;
  amount?: number;
  description?: string;
  lastDigits?: string;
  creditLimit?: number;
  closingDay?: number;
  dueDate?: number;
}

export const ACCOUNT_TYPES = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Billetera virtual", label: "Billetera virtual" },
  { value: "Caja de ahorro", label: "Caja de Ahorro / Débito" },
  { value: "Cuenta corriente", label: "Cuenta Corriente" },
  { value: "Tarjeta de Crédito", label: "Tarjeta de Crédito" },
];

export const ACCOUNT_TAGS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "billetera", label: "Billetera virtual" },
  { value: "ahorro", label: "Caja de Ahorro / Débito" },
  { value: "corriente", label: "Cuenta Corriente" },
  { value: "crédito", label: "Tarjeta de Crédito" },
];