import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

if (!prisma) {
	prisma = new PrismaClient();
}

export default prisma;