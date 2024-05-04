import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
//Routes
import authRoute from "./routes/auth.route";
import toDoRoute from "./routes/toDo.route";
import tagRoute from "./routes/tag.route";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);
app.use("/todo", toDoRoute);
app.use("/tag", tagRoute);

app.use((req: Request, res: Response) => {
  res.sendStatus(404);
});

app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
