import prisma from "../../../prisma/prisma.js";
import dayjs from "dayjs";

const findOne = async (where, include) => {
	return await prisma.user.findFirst({
		where,
		select: {
			id: true,
			username: true,
			email: true,
			email_verified: true,
			role: true,
		},
		include: include || undefined,
	});
};

const findMany = async (where, include) => {
	return await prisma.user.findMany({
		where: where || undefined,
		select: {
			id: true,
			username: true,
			email: true,
			email_verified: true,
			role: true,
		},
		include: include || undefined,
	});
};

const paginate = async (page = 1, filter = {}, orderBy = { id: "asc" }) => {
	const page = page < 1 ? 1 : page;
	const take = 20;
	const skip = take * page - take;

	const totalUser = await prisma.user.count({ where: filter });

	const userData = await prisma.user.findMany({
		where: filter,
		select: {
			id: true,
			username: true,
			email: true,
			email_verified: true,
			role: true,
		},
		skip,
		take,
		include: { Profile: true },
		orderBy,
	});

	return {
		data: userData,
		totalCount: totalUser,
		currentPage: page,
		totalPages: Math.ceil(totalCount / take),
	};
};

const findOrCreate = async (where, data) => {
	return await prisma.$transaction(async (prisma) => {
		const existingUser = await prisma.user.findFirst({ where });
		if (!existingUser) {
			const newUser = await prisma.user.create({
				data,
				select: {
					id: true,
					username: true,
					email: true,
					email_verified: true,
					role: true,
				},
			});

			return { existingUser: null, newUser };
		} else {
			return { existingUser, newUser: null };
		}
	});
};

const create = async (data) => {
	return await prisma.user.create({
		data,
		select: {
			id: true,
			username: true,
			email: true,
			email_verified: true,
			role: true,
		},
	});
};

const createMany = async (data, skipDuplicates) => {
	return await prisma.user.createMany({
		data,
		skipDuplicates,
	});
};

const update = async (where, data) => {
	return await prisma.user.update({
		where,
		data,
		select: {
			id: true,
			username: true,
			email: true,
			email_verified: true,
			role: true,
		},
	});
};

const updateMany = async (where, data) => {
	return await prisma.user.updateMany({
		where,
		data,
	});
};

const updateOrCreate = async (where, data) => {
	return await prisma.user.upsert({
		where,
		create: data,
		update: data,
		select: {
			id: true,
			username: true,
			email: true,
			email_verified: true,
			role: true,
		},
	});
};

const destroy = async (where) => await prisma.user.delete({ where });

const destroyMany = async (where) => await prisma.user.deleteMany({ where });

const verifyEmail = async (userId) => {
	return await prisma.user.update({
		where: { id: userId },
		data: { email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss") },
	});
};

export default {
	findOne,
	findMany,
	paginate,
	findOrCreate,
	create,
	createMany,
	update,
	updateMany,
	updateOrCreate,
	destroy,
	destroyMany,
	verifyEmail,
};
