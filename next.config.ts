/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env";

/** @type {import("next").NextConfig} */
const config = {
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "icons.hackclub.com",
				port: "",
				pathname: "/api/icons/**",
			},
			{
				protocol: "https",
				hostname: "assets.hackclub.com",
				port: "",
				pathname: "/flag-orpheus-top-*.svg",
			},
		],
	},
};

export default config;
