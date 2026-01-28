import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { accountController } from "./accounts.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", accountController.getAllAccounts);
router.get("/:id", accountController.getAccountById);
router.post("/", accountController.createAccount);
router.patch("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deactivateAccount);

export default router;

