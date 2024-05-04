import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

// Controller
import * as toDoController from "../controllers/toDoController";

const toDoRoute = Router();

toDoRoute.use(authMiddleware);

toDoRoute.get("/", toDoController.getToDos);
toDoRoute.post("/", toDoController.createToDo);
toDoRoute.put("/:toDoId", toDoController.editToDo);
toDoRoute.delete("/:toDoId", toDoController.deleteToDo);

toDoRoute.all("/", toDoController.noParamFallback);
toDoRoute.all("*", toDoController.urlNotFound);

export default toDoRoute;
