/*
  Warnings:

  - You are about to drop the column `description` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tagsontodos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `todos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tags` DROP FOREIGN KEY `tags_user_foreign`;

-- DropForeignKey
ALTER TABLE `tagsontodos` DROP FOREIGN KEY `tags_todo_foreign`;

-- DropForeignKey
ALTER TABLE `tagsontodos` DROP FOREIGN KEY `todos_tag_foreign`;

-- AlterTable
ALTER TABLE `todos` DROP COLUMN `description`,
    ADD COLUMN `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `address`,
    DROP COLUMN `phone`;

-- DropTable
DROP TABLE `tags`;

-- DropTable
DROP TABLE `tagsontodos`;
