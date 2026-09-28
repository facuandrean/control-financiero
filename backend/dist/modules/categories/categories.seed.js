"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultCategories = exports.DEFAULT_CATEGORIES = void 0;
const crypto_1 = __importDefault(require("crypto"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../core/db/db");
const categories_schema_1 = require("./categories.schema");
exports.DEFAULT_CATEGORIES = [
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
const seedDefaultCategories = async (userID, tx) => {
    const runner = tx || db_1.db;
    const categoriesToInsert = exports.DEFAULT_CATEGORIES.map((cat) => ({
        id: crypto_1.default.randomUUID(),
        userID,
        name: cat.name,
        status: 'Active',
        description: cat.description,
        createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
    }));
    await runner.insert(categories_schema_1.categories).values(categoriesToInsert);
};
exports.seedDefaultCategories = seedDefaultCategories;
