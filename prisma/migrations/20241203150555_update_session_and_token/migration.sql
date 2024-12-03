/*
  Warnings:

  - You are about to alter the column `login_time` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `created_at` on the `Token` table. All the data in the column will be lost.
  - You are about to alter the column `expiresIn` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `email_verified` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Added the required column `expiresIn` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Session` ADD COLUMN `expiresIn` DATETIME NOT NULL,
    MODIFY `login_time` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `Token` DROP COLUMN `created_at`,
    MODIFY `expiresIn` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email_verified` DATETIME NULL;
