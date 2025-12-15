import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, genericOAuth } from "better-auth/plugins";
import { env } from "@/env";
import { db } from "@/server/db";
import { ac, admin, user } from "./permissions";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
	}),
	emailAndPassword: {
		enabled: true,
	},
	experimental: { joins: true },
	user: {
		additionalFields: {
			slackId: {
				type: "string",
			},
			verificationStatus: {
				type: "string",
				required: true,
				defaultValue: "unverified",
			},
			yswsEligibility: {
				type: "boolean",
				required: true,
			},
			firstName: {
				type: "string",
			},
			lastName: {
				type: "string",
			},
		},
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "hack-club",
					clientId: env.BETTER_AUTH_HACK_CLUB_CLIENT_ID,
					clientSecret: env.BETTER_AUTH_HACK_CLUB_CLIENT_SECRET,
					authorizationUrl: "https://account.hackclub.com/oauth/authorize",
					tokenUrl: "https://account.hackclub.com/oauth/token",
					redirectURI: `${env.NODE_ENV === "production" ? "https://" : "http://"}${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000"}/api/auth/callback/hack-club`,
					scopes: [
						"openid",
						"email",
						"slack_id",
						"verification_status",
						"name",
					],

					getUserInfo: async (tokens) => {
						const response = await fetch(
							"https://account.hackclub.com/api/v1/me",
							{
								headers: {
									Authorization: `Bearer ${tokens.accessToken}`,
								},
							},
						);

						const data = await response.json();

						return {
							id: data.identity.id,
							email: data.identity.primary_email,
							emailVerified: true,
							slackId: data.identity.slack_id,
							verificationStatus: data.identity.verification_status,
							yswsEligibility: data.identity.ysws_eligible,
							name: `${data.identity.first_name} ${data.identity.last_name}`,
							firstName: data.identity.first_name,
							lastName: data.identity.last_name,
						};
					},
					mapProfileToUser: (profile) => {
						return profile;
					},
				},
			],
		}),
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		nextCookies(),
	],
});

export type Session = typeof auth.$Infer.Session;
