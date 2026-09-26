"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const error_middleware_1 = require("./core/middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/categories.routes"));
const accounts_routes_1 = __importDefault(require("./modules/accounts/accounts.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const entities_routes_1 = __importDefault(require("./modules/entities/entities.routes"));
const debts_accounts_routes_1 = __importDefault(require("./modules/debts/accounts/debts-accounts.routes"));
const debts_items_routes_1 = __importDefault(require("./modules/debts/items/debts-items.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/accounts', accounts_routes_1.default);
app.use('/api/transactions', transactions_routes_1.default);
app.use('/api/entities', entities_routes_1.default);
app.use('/api/debt-accounts', debts_accounts_routes_1.default);
app.use('/api/debt-items', debts_items_routes_1.default);
// app.all('*', (req, res, next) => {
//   next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
// });
app.use(error_middleware_1.globalErrorHandler);
app.listen(config_1.config.port, () => {
    console.log(`Server is running on port http://localhost:${config_1.config.port}`);
});
exports.default = app;
