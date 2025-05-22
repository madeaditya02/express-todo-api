-- DropForeignKey
ALTER TABLE `todos` DROP FOREIGN KEY `todos_user_foreign`;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_user_foreign` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
