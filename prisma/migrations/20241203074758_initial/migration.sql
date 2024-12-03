/*
  Warnings:

  - You are about to alter the column `expires` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `email_verified` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `Token` MODIFY `expires` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email_verified` DATETIME NULL;
