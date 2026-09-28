import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import { createAccountSchema, updateAccountSchema } from "./accounts.validators";
import { accountController } from "./accounts.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", accountController.getAllAccounts);
router.get("/:id", accountController.getAccountById);
router.post("/", validate(createAccountSchema), accountController.createAccount);
router.patch("/:id", validate(updateAccountSchema), accountController.updateAccount);
router.delete("/:id", accountController.deactivateAccount);

export default router;

