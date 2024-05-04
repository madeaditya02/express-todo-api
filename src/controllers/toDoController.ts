import { Request, Response } from "express";
import { RequestWithUser } from "../entity/user.entity";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const toDoSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string().nullable())
});
const IdSchema = z.string().uuid();
const prisma = new PrismaClient();

export const getToDos = async (req: RequestWithUser, res: Response) => {
  try {
    const toDos = await prisma.toDo.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        tags: { include: { tag: { select: { name: true } } } }
      }
    });
    const result = toDos.map((toDo) => {
      return { ...toDo, tags: toDo.tags.map(tag => tag.tag) }
    })
    res.status(200).json(result);
  } catch (err: any) {
    console.log(err.message);
  }
};

export const createToDo = async (req: RequestWithUser, res: Response) => {
  try {
    let { title, description, tags } = req.body
    if (tags == undefined) {
      tags = [];
    }

    toDoSchema.parse({
      title: title,
      description: description,
      tags: tags
    });

    const tagIdList = tags.map((tagId: string) => {
      return {
        id: tagId
      }
    })

    // Check user tags in database
    const userTags = await prisma.tag.findMany({
      where: {
        userId: req.user!.id,
        OR: tagIdList
      }
    });
    // Compare user tags and incoming tags from request
    if (userTags.length < tags.length) {
      return res.status(400).json({ message: "User don't have selected tag(s)" });
    }

    await prisma.toDo.create({
      data: {
        userId: req.user!.id,
        title: title,
        description: description,
        tags: {
          create: tags.map((tagId: string) => {
            return {
              tag: {
                connect: {
                  id: tagId
                }
              }
            }
          })
        }
      }
    });

    res.status(201).json({ message: "To do successfully created" });
  } catch (err: any) {
    if (err.name == "ZodError") {
      res.status(400).json(err.issues);
      return;
    }
    console.log(err);
  }
};

export const editToDo = async (req: RequestWithUser, res: Response) => {
  try {
    let { tags, title, description } = req.body;

    toDoSchema.parse({
      title: title,
      description: description,
      tags: tags
    });
    IdSchema.parse(req.params.id);


    const tagIdList = tags.map((tagId: string) => {
      return {
        id: tagId
      }
    });

    // Check user tags in database
    const userTags = await prisma.tag.findMany({
      where: {
        userId: req.user!.id,
        OR: tagIdList
      }
    });
    // Compare user tags and incoming tags from request
    if (userTags.length < tags.length) {
      return res.status(400).json({ message: "User don't have selected tag(s)" });
    }

    await prisma.toDo.update({
      where: {
        id: req.params.toDoId,
      },
      data: {
        title: title,
        description: description,
        tags: {
          deleteMany: {},
          create: tags.map((tagId: string) => {
            return {
              tag: {
                connect: {
                  id: tagId
                }
              }
            }
          })
        }
      },
    });

    res.status(200).json({
      message: "Selected to do successfully updated",
    });
  } catch (err: any) {
    // An operation failed because it depends on one or more records that were required but not found.
    if (err.code == "P2025") {
      res
        .status(404)
        .json({ message: "User don't have to do with selected id!" });
    } else if (err.name == "ZodError") {
      res.status(400).json(err.issues);
      return;
    }
    console.log(err);
  }
};

export const deleteToDo = async (req: RequestWithUser, res: Response) => {
  try {
    IdSchema.parse(req.params.id);

    // Check to do's user id and request user id
    const userToDo = await prisma.toDo.findFirst({
      where: {
        id: req.params.toDoId,
        userId: req.user!.id
      },
      select: {
        id: true,
        userId: true
      }
    });

    if (userToDo == null) {
      return res.status(404).json({ message: "To do not found" });
    }

    // Delete to do from relation table
    await prisma.tagsOnToDos.deleteMany({
      where: {
        toDoId: req.params.toDoId
      }
    })
    await prisma.toDo.delete({
      where: {
        id: req.params.toDoId,
      },
    });

    res.status(200).json({
      message: "Selected to do successfully deleted",
    });
  } catch (err: any) {
    // The records for relation `ToDoToUser` between the `User` and `ToDo` models are not connected.
    if (err.code == "P2017") {
      res
        .status(404)
        .json({ message: "User don't have to do with selected id!" });
    } else if (err.name == "ZodError") {
      res.status(400).json(err.issues);
      return;
    }
    console.log(err);
  }
};

export const noParamFallback = (req: Request, res: Response) => {
  res.status(400).json({
    message: "Please provide a specified parameter",
  });
};

export const urlNotFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: "URL not found",
  });
};
