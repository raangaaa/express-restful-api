-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bio` TEXT NULL,
    `url` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `userId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

