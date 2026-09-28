import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { db } from '../../core/db/db';
import { categories } from './categories.schema';

export interface DefaultCategoryTemplate {
  name: string;
  description: string;
}

export const DEFAULT_CATEGORIES: DefaultCategoryTemplate[] = [
  { name: 'Supermercado', description: 'Alimentos, bebidas y compras de despensa' },
  { name: 'Vivienda', description: 'Alquiler, expensas y mantenimiento del hogar' },
  { name: 'Transporte', description: 'Combustible, transporte público y peajes' },
  { name: 'Servicios', description: 'Luz, gas, agua, internet, telefonía y suscripciones' },
  { name: 'Entretenimiento', description: 'Cine, salidas, recitales y ocio' },
  { name: 'Salud', description: 'Farmacia, consultas médicas y cuidados de la salud' },
  { name: 'Restaurantes', description: 'Comidas afuera, delivery y cafetería' },
  { name: 'Ropa', description: 'Indumentaria, calzado y accesorios' },
  { name: 'Educación', description: 'Cursos, libros y capacitaciones' },
  { name: 'Sueldo', description: 'Ingresos por empleo o actividad principal' },
  { name: 'Inversiones', description: 'Rendimientos, dividendos e intereses' },
  { name: 'Otros Ingresos', description: 'Ventas, ingresos esporádicos o reembolsos' },
];

/**
 * Inserta un conjunto de categorías por defecto para un nuevo usuario.
 * @param userID Identificador único del usuario recién creado.
 * @param tx Instancia opcional de transacción de Drizzle ORM.
 */
export const seedDefaultCategories = async (
  userID: string,
  tx?: any
): Promise<void> => {
  const runner = tx || db;

  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
    id: crypto.randomUUID(),
    userID,
    name: cat.name,
    status: 'Active',
    description: cat.description,
    createdAt: sql`CURRENT_TIMESTAMP`,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }));

  await runner.insert(categories).values(categoriesToInsert);
};
