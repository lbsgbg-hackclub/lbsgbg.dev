import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgTableCreator,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `lbsgbg-dev_${name}`);

// AUTH
export const user = createTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	yswsEligibility: boolean("ysws_eligibility").default(false).notNull(),
	verificationStatus: text("verification_status")
		.default("unverified")
		.notNull(),
	slackId: text("slack_id").unique(),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
});

export const session = createTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by"),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = createTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = createTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const meeting = createTable(
	"meeting",
	{
		id: text("id").primaryKey(),
		startsAt: timestamp("starts_at").notNull(),
		location: text("location").notNull(),
		workshopTitle: text("workshop_title"),
		workshopDescription: text("workshop_description"),
		canceled: boolean("canceled").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("meeting_startsAt_idx").on(table.startsAt)],
);

export const rsvp = createTable(
	"rsvp",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		class: text("class").notNull(),
		meetingId: text("meeting_id")
			.notNull()
			.references(() => meeting.id, { onDelete: "cascade" }),
		wasPresent: boolean("showed_up").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("rsvp_name_meeting_idx").on(
			table.name,
			table.class,
			table.meetingId,
		),
		index("rsvp_meeting_idx").on(table.meetingId),
	],
);

export const rsvpRelations = relations(rsvp, ({ one }) => ({
	meeting: one(meeting, {
		fields: [rsvp.meetingId],
		references: [meeting.id],
	}),
}));

export const meetingRelations = relations(meeting, ({ many }) => ({
	rsvps: many(rsvp),
}));
