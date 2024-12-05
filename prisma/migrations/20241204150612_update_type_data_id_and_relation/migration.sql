/*
  Warnings:

  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `login_time` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expiresIn` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expiresIn` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `email_verified` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Added the required column `id` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Token` DROP FOREIGN KEY `Token_ibfk_1`;

-- DropIndex
DROP INDEX `user_id` ON `Session`;

-- DropIndex
DROP INDEX `user_id` ON `Token`;

-- AlterTable
ALTER TABLE `Profile` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Session` ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `login_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `expiresIn` DATETIME NOT NULL,
    MODIFY `user_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Token` MODIFY `expiresIn` DATETIME NOT NULL,
    MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `email_verified` DATETIME NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- RedefineIndex
CREATE UNIQUE INDEX `Profile_user_id_key` ON `Profile`(`user_id`);
DROP INDEX `user_id` ON `Profile`;
