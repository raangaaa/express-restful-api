/*
  Warnings:

  - You are about to drop the column `userId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to alter the column `login_time` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expiresIn` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `userId` on the `Token` table. All the data in the column will be lost.
  - You are about to alter the column `expiresIn` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `email_verified` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[user_id]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Token` DROP FOREIGN KEY `Token_ibfk_1`;

-- DropIndex
DROP INDEX `userId` ON `Profile`;

-- DropIndex
DROP INDEX `userId` ON `Session`;

-- DropIndex
DROP INDEX `userId` ON `Token`;

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Session` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `refresh_token` TEXT NOT NULL,
    MODIFY `login_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `expiresIn` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `Token` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `expiresIn` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email_verified` DATETIME NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_id` ON `Profile`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_id` ON `Session`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_id` ON `Token`(`user_id`);

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
