import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as tagController from "../controllers/tagController";

const tagRoute = Router();

tagRoute.use(authMiddleware);
tagRoute.get("/", tagController.showUserTags);
tagRoute.post("/", tagController.createTag);
tagRoute.put("/:tagId", tagController.editTag);
tagRoute.delete("/:tagId", tagController.deleteTag);

export default tagRoute;