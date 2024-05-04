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
    const result = await prisma.tag.findMany({
      where: {
        userId: req.user!.id,
        id: req.params.id
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
    const sameTag = await prisma.tag.findFirst({
      where: {
        userId: req.user!.id,
        name: parsedBody.name
      }
    });
    if (sameTag != null) {
      res.status(400).json({ message: "The same tag name already exist" });
      return;
    }
    await prisma.tag.create({
      data: {
        userId: req.user!.id,
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
    const { tagId } = req.params;

    const parsedBody = tagSchema.parse({
      name: name
    });
    tagIdSchema.parse(tagId);

    // Check if current user has same tag
    const sameTag = await prisma.tag.findFirst({
      where: {
        userId: req.user!.id,
        name: parsedBody.name
      }
    });
    if (sameTag != null) {
      return res.status(400).json({ message: "The same tag name already exist" });
    }

    // Check if selected tag belongs to the user
    const userTag = await prisma.tag.findUnique({
      where: {
        id: tagId
      }
    });
    if (userTag?.userId != req.user!.id) {
      return res.status(404).json({ message: "User don't have tag with selected id" });
    }

    await prisma.tag.update({
      where: {
        id: tagId
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
    const userTag = await prisma.tag.findUnique({
      where: {
        id: tagId
      }
    });
    if (userTag?.userId != req.user!.id) {
      return res.status(404).json({ message: "User don't have tag with selected id" });
    }

    const result = await prisma.tag.delete({
      where: {
        id: tagId
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