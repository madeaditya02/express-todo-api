import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors, { CorsOptions } from 'cors';

//Routes
import authRoute from "./routes/auth.route";
import toDoRoute from "./routes/toDo.route";
import tagRoute from "./routes/tag.route";

dotenv.config();
const app = express();

const corsOptions: CorsOptions = {
  origin: ['http://localhost:3000','http://localhost:5173']
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use("/auth", authRoute);
app.use("/todo", toDoRoute);
app.use("/tag", tagRoute);

app.use((req: Request, res: Response) => {
  res.sendStatus(404);
});

app.listen(3001, () => {
  console.log(`Server is running at http://localhost:3001`);
});
