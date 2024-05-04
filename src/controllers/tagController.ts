import { RequestWithUser } from "../entity/user.entity";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const tagSchema = z.object({
  name: z.string().toLowerCase().trim()
});
const tagIdSchema = z.string().uuid();

export const showUserTags = async (req: RequestWithUser, res: Response) => {
  try {
    const result = await prisma.tags.findMany({
      where: {
        userId: parseInt(req.user!.id),
        id: parseInt(req.params.id)
      }
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.log(err);
  }
}

export const createTag = async (req: RequestWithUser, res: Response) => {
  try {
    const { name } = req.body;
    const parsedBody = tagSchema.parse({
      name: name
    });
    // Check if current user has same tag
    const sameTag = await prisma.tags.findFirst({
      where: {
        userId: parseInt(req.user!.id),
        name: parsedBody.name
      }
    });
    if (sameTag != null) {
      res.status(400).json({ message: "The same tag name already exist" });
      return;
    }
    await prisma.tags.create({
      data: {
        userId: parseInt(req.user!.id),
        name: parsedBody.name,
      }
    });
    res.status(200).json({ message: "Tag successfully created" });
  } catch (err: any) {
    if (err.name == "ZodError") {
      res.status(400).json(err.issues);
      return;
    }
    console.log(err);
  }
}

export const editTag = async (req: RequestWithUser, res: Response) => {
  try {
    const { name } = req.body;
    let { tagId } = req.params;
    
    const parsedBody = tagSchema.parse({
      name: name
    });
    tagIdSchema.parse(tagId);

    // Check if current user has same tag
    const sameTag = await prisma.tags.findFirst({
      where: {
        userId: parseInt(req.user!.id),
        name: parsedBody.name
      }
    });
    if (sameTag != null) {
      return res.status(400).json({ message: "The same tag name already exist" });
    }

    // Check if selected tag belongs to the user
    const userTag = await prisma.tags.findUnique({
      where: {
        id: parseInt(tagId)
      }
    });
    if (userTag?.userId != parseInt(req.user!.id)) {
      return res.status(404).json({ message: "User don't have tag with selected id" });
    }

    await prisma.tags.update({
      where: {
        id: parseInt(tagId)
      },
      data: {
        name: parsedBody.name
      }
    })

    res.status(200).json({ message: "Selected tag successfully updated" });

  } catch (err: any) {
    if (err.name == "ZodError") {
      res.status(400).json(err.issues);
      return;
    }
    console.log(err);
  }
}

export const deleteTag = async (req: RequestWithUser, res: Response) => {
  try {
    const { tagId } = req.params;

    tagIdSchema.parse(tagId);

    // Check if selected tag belongs to the user
    const userTag = await prisma.tags.findUnique({
      where: {
        id: parseInt(tagId)
      }
    });
    if (userTag?.userId != parseInt(req.user!.id)) {
      return res.status(404).json({ message: "User don't have tag with selected id" });
    }

    const result = await prisma.tags.delete({
      where: {
        id: parseInt(tagId)
      }
    });

    res.status(200).json({ message: "Selected tag successfully deleted" });
  } catch (err: any) {
    if (err.name == "ZodError") {
      res.status(400).json(err.issues);
      return;
    }
    console.log(err);
  }
}