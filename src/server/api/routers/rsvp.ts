import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { meeting, rsvp } from "@/server/db/schema";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: "Redis credentials are not configured.",
	});
}

const redis = new Redis({
	url: redisUrl,
	token: redisToken,
});

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

const WINDOW_SECONDS = 120; // 2 minutes
const LIMIT = 5;

function windowKey(id: string) {
	const nowSeconds = Math.floor(Date.now() / 1000);
	const windowStart = Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
	return `rsvp:${id}:${windowStart}`;
}

async function checkOnly(id: string) {
	const key = windowKey(id);
	const count = (await redis.get<number>(key)) ?? 0;
	return count < LIMIT;
}

async function consumeOnSuccess(id: string) {
	const key = windowKey(id);
	const tx = redis.multi();
	tx.incr(key);
	tx.expire(key, WINDOW_SECONDS);
	await tx.exec();
}

export const rsvpRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100).trim(),
				class: z.string().min(1).max(50).trim(),
				meetingId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const headerIp =
				ctx?.headers.get("x-forwarded-for") || ctx?.headers.get("x-real-ip");
			const ip = Array.isArray(headerIp) ? headerIp[0] : String(headerIp || "");
			const userId = ctx?.session?.user?.id ?? "anon";
			const ipId = ip || "anon";

			// Check limit without consuming
			const okUser = await checkOnly(userId);
			const okIp = await checkOnly(ipId);
			if (!okUser || !okIp) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message:
						"Rate limit exceeded. Try again later. (Registration is optional)",
				});
			}

			const targetMeeting = await ctx.db
				.select()
				.from(meeting)
				.where(eq(meeting.id, input.meetingId))
				.limit(1);

			const [target] = targetMeeting;

			if (!target) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meeting not found.",
				});
			}

			if (target.canceled) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "This meeting is canceled.",
				});
			}

			const existing = await ctx.db
				.select()
				.from(rsvp)
				.where(
					and(
						eq(rsvp.name, input.name),
						eq(rsvp.class, input.class),
						eq(rsvp.meetingId, input.meetingId),
					),
				);

			if (Array.isArray(existing) && existing.length > 10) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Record exists, try adding your lastname if you havent.",
				});
			}

			await ctx.db.insert(rsvp).values({
				id: crypto.randomUUID(),
				name: input.name,
				class: input.class,
				meetingId: input.meetingId,
			});

			// Consume only after a successful insert
			await Promise.all([consumeOnSuccess(userId), consumeOnSuccess(ipId)]);
		}),

	listByMeeting: adminProcedure
		.input(z.object({ meetingId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			return ctx.db
				.select()
				.from(rsvp)
				.where(eq(rsvp.meetingId, input.meetingId))
				.orderBy(desc(rsvp.createdAt));
		}),
});
