import prisma from "../../../prisma/prisma.js";
import dayjs from "dayjs";

/**
 * Find a single user based on the given conditions.
 * @async
 * @param {Object} where - The conditions to filter the user.
 * @param {Object} [include] - Additional relations to include in the result.
 * @returns {Promise<Object|null>} - The user object or null if no user is found.
 */
const findOne = async (where, include) => {
    return await prisma.user.findFirst({
        where,
        select: {
            id: true,
            username: true,
            email: true,
            email_verified: true,
            role: true
        },
        include: include || undefined
    });
};

/**
 * Find multiple users based on the given conditions.
 * @async
 * @param {Object} where - The conditions to filter the users.
 * @param {Object} [include] - Additional relations to include in the results.
 * @returns {Promise<Object[]>} - Array of user objects.
 */
const findMany = async (where, include) => {
    return await prisma.user.findMany({
        where: where || undefined,
        select: {
            id: true,
            username: true,
            email: true,
            email_verified: true,
            role: true
        },
        include: include || undefined
    });
};

/**
 * Paginate user results.
 * @async
 * @param {Number} [page=1] - The current page number.
 * @param {Object} [filter={}] - Conditions to filter users.
 * @param {Object} [orderBy={id: "asc"}] - Sorting order.
 * @returns {Promise<Object>} - Paginated result including data, total count, current page, and total pages.
 */
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
            role: true
        },
        skip,
        take,
        include: { Profile: true },
        orderBy
    });

    return {
        data: userData,
        totalCount: totalUser,
        currentPage: page,
        totalPages: Math.ceil(totalCount / take)
    };
};

/**
 * Find a user or create a new one if not found.
 * @async
 * @param {Object} data - The user data to create if not found.
 * @returns {Promise<Object>} - The existing user or the newly created user.
 */
const findOrCreate = async (data) => {
    return await prisma.$transaction(async (prisma) => {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: data.email
            }
        });
        if (!existingUser) {
            const newUser = await prisma.user.create({
                data,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    email_verified: true,
                    role: true,
                    oauth_provider: true
                }
            });

            return { existingUser: null, newUser };
        } else {
            return { existingUser, newUser: null };
        }
    });
};

/**
 * Create a new user.
 * @async
 * @param {Object} data - The user data to create.
 * @returns {Promise<Object>} - The newly created user object.
 */
const create = async (data) => {
    return await prisma.user.create({
        data,
        select: {
            id: true,
            username: true,
            email: true,
            email_verified: true,
            role: true
        }
    });
};

/**
 * Create multiple users.
 * @async
 * @param {Object[]} data - Array of user data to create.
 * @param {Boolean} skipDuplicates - Whether to skip duplicate records.
 * @returns {Promise<Object>} - The result of the operation.
 */
const createMany = async (data, skipDuplicates) => {
    return await prisma.user.createMany({
        data,
        skipDuplicates
    });
};

/**
 * Update a user based on the given conditions.
 * @async
 * @param {Object} where - The conditions to identify the user to update.
 * @param {Object} data - The updated user data.
 * @returns {Promise<Object>} - The updated user object.
 */
const update = async (where, data) => {
    return await prisma.user.update({
        where,
        data,
        select: {
            id: true,
            username: true,
            email: true,
            email_verified: true,
            role: true
        }
    });
};

/**
 * Update multiple users based on the given conditions.
 * @async
 * @param {Object} where - The conditions to identify the users to update.
 * @param {Object} data - The updated user data.
 * @returns {Promise<Object>} - The result of the update operation.
 */
const updateMany = async (where, data) => {
    return await prisma.user.updateMany({
        where,
        data
    });
};

/**
 * Update or create a user.
 * @async
 * @param {Object} where - The conditions to identify the user.
 * @param {Object} data - The data to update or create the user.
 * @returns {Promise<Object>} - The updated or newly created user object.
 */
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
            role: true
        }
    });
};

/**
 * Soft delete a user by setting the delete_at timestamp.
 * @async
 * @param {Object} where - The conditions to identify the user to delete.
 * @returns {Promise<void>}
 */
const destroy = async (where) => {
    await prisma.user.update({
        where,
        data: {
            delete_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
    });
};

/**
 * Soft delete multiple users by setting the delete_at timestamp.
 * @async
 * @param {Object} where - The conditions to identify the users to delete.
 * @returns {Promise<void>}
 */
const destroyMany = async (where) => {
    await prisma.user.updateMany({
        where,
        data: {
            delete_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
    });
};

/**
 * Verify a user's email by updating the email_verified field.
 * @async
 * @param {Number} userId - The ID of the user to verify.
 * @returns {Promise<Object>} - The updated user object.
 */
const verifyEmail = async (userId) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss") }
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
    verifyEmail
};
