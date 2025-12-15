import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { meeting } from "@/server/db/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	const role = ctx.session?.user?.role;
	const roles = (
		ctx.session as unknown as { user?: { roles?: string[] } } | undefined
	)?.user?.roles;
	const isAdmin =
		role === "admin" || (Array.isArray(roles) && roles.includes("admin"));

	if (!isAdmin) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}

	return next();
});

export const meetingRouter = createTRPCRouter({
	next: publicProcedure.query(async ({ ctx }) => {
		const now = new Date();
		const nextMeeting = await ctx.db
			.select()
			.from(meeting)
			.where(and(eq(meeting.canceled, false), gte(meeting.startsAt, now)))
			.orderBy(meeting.startsAt)
			.limit(1);

		return nextMeeting[0] ?? null;
	}),

	list: adminProcedure.query(async ({ ctx }) => {
		return ctx.db
			.select()
			.from(meeting)
			.orderBy(desc(meeting.startsAt))
			.limit(50);
	}),

	create: adminProcedure
		.input(
			z.object({
				startsAt: z.coerce.date(),
				location: z.string().min(1).max(200),
				workshopTitle: z.string().max(200).optional(),
				workshopDescription: z.string().max(2000).optional(),
				canceled: z.boolean().optional(),
				id: z.string().uuid().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const id = input.id ?? crypto.randomUUID();
			await ctx.db.insert(meeting).values({
				id,
				startsAt: input.startsAt,
				location: input.location,
				workshopTitle: input.workshopTitle,
				workshopDescription: input.workshopDescription,
				canceled: input.canceled ?? false,
			});

			return { id };
		}),

	update: adminProcedure
		.input(
			z
				.object({
					id: z.string().uuid(),
					startsAt: z.coerce.date().optional(),
					location: z.string().min(1).max(200).optional(),
					workshopTitle: z.string().max(200).optional(),
					workshopDescription: z.string().max(2000).optional(),
					canceled: z.boolean().optional(),
				})
				.refine(
					(data) =>
						data.startsAt !== undefined ||
						data.location !== undefined ||
						data.workshopTitle !== undefined ||
						data.workshopDescription !== undefined ||
						data.canceled !== undefined,
					{
						message: "At least one field must be provided to update.",
					},
				),
		)
		.mutation(async ({ ctx, input }) => {
			const updates: Partial<typeof meeting.$inferInsert> = {};
			if (input.startsAt !== undefined) updates.startsAt = input.startsAt;
			if (input.location !== undefined) updates.location = input.location;
			if (input.workshopTitle !== undefined)
				updates.workshopTitle = input.workshopTitle;
			if (input.workshopDescription !== undefined)
				updates.workshopDescription = input.workshopDescription;
			if (input.canceled !== undefined) updates.canceled = input.canceled;

			const updated = await ctx.db
				.update(meeting)
				.set(updates)
				.where(eq(meeting.id, input.id))
				.returning();

			if (!updated.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			return updated[0];
		}),

	cancel: adminProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const canceled = await ctx.db
				.update(meeting)
				.set({ canceled: true })
				.where(eq(meeting.id, input.id))
				.returning();

			if (!canceled.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found",
				});
			}

			return canceled[0];
		}),
});
