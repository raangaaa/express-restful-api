import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

if (!prisma) {
	prisma = new PrismaClient();
}

prisma.$on("query", (e) => {
	logger.log({
		level: "database",
		message: `Query: ${e.query}\nParams: ${e.params}\nDuration: ${e.duration}ms`,
	});
});

export default prisma;