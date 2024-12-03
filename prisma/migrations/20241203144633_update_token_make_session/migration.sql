/*
  Warnings:

  - You are about to drop the column `TokenType` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `email_verified` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Added the required column `expiresIn` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_type` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Token` DROP COLUMN `TokenType`,
    DROP COLUMN `expires`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expiresIn` DATETIME NOT NULL,
    ADD COLUMN `token_type` ENUM('PasswordReset', 'VerifyEmail') NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `refresh_token`,
    MODIFY `email_verified` DATETIME NULL;

-- CreateTable
CREATE TABLE `Session` (
    `userId` INTEGER NOT NULL,
    `refresh_token` VARCHAR(255) NOT NULL,
    `user_agent` TEXT NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `login_time` DATETIME NOT NULL,

    UNIQUE INDEX `userId`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
