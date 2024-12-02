-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('SuperAdmin', 'Admin', 'User') NOT NULL DEFAULT 'User',
    `email_verified` DATETIME NULL,
    `refresh_token` VARCHAR(191) NULL,

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `bio` TEXT NULL,
    `url` TEXT NULL,
    `pronouns` ENUM('He', 'She', 'They', 'DontSpecify') NULL,
    `gender` ENUM('Male', 'Female') NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `userId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `token` VARCHAR(66) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expires` DATETIME NOT NULL,
    `TokenType` ENUM('PasswordReset', 'VerifyEmail') NOT NULL,

    UNIQUE INDEX `Token_token_key`(`token`),
    UNIQUE INDEX `userId`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

