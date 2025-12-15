"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const breakpointDisplayVariants = cva(
	"pointer-events-none z-50 select-none rounded-b bg-foreground px-2 py-1 text-background",
	{
		variants: {
			position: {
				fixed: "fixed top-0 right-[50%] translate-x-1/2",
				relative: "relative",
				absolute: "absolute top-0 right-[50%] translate-x-1/2",
			},
		},
		defaultVariants: {
			position: "fixed",
		},
	},
);

// Canonical ordering of breakpoints from smallest to largest
// This defines the semantic order - actual pixel values are defined in Tailwind config
const BREAKPOINT_ORDER = [
	"xxs",
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
] as const;

type BreakpointKey = (typeof BREAKPOINT_ORDER)[number];

// Default Tailwind breakpoints (standard v3/v4)
const DEFAULT_BREAKPOINTS: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl"];

interface BreakpointDisplayProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof breakpointDisplayVariants> {
	/**
	 * Additional breakpoints to include beyond the default Tailwind breakpoints.
	 * These will be automatically sorted by semantic order (xxs < xs < sm < md < lg < xl < 2xl < 3xl).
	 * Actual pixel values are defined in your Tailwind configuration.
	 * @example extraBreakpoints={["xxs", "xs", "3xl"]}
	 */
	extraBreakpoints?: BreakpointKey[];
}

function BreakpointDisplay({
	className,
	position,
	extraBreakpoints = [],
	...props
}: BreakpointDisplayProps) {
	// Combine default and extra breakpoints, remove duplicates, and sort by semantic order
	const activeBreakpoints = React.useMemo(() => {
		const combined = [...DEFAULT_BREAKPOINTS, ...extraBreakpoints];
		const unique = Array.from(new Set(combined));

		// Sort by their position in the canonical BREAKPOINT_ORDER array
		return unique.sort((a, b) => {
			return BREAKPOINT_ORDER.indexOf(a) - BREAKPOINT_ORDER.indexOf(b);
		});
	}, [extraBreakpoints]);

	// Create a Set for O(1) lookup
	const activeSet = React.useMemo(
		() => new Set(activeBreakpoints),
		[activeBreakpoints],
	);

	// Determine the first and last active breakpoints
	const firstBreakpoint = activeBreakpoints[0];
	const lastBreakpoint = activeBreakpoints[activeBreakpoints.length - 1];

	// Helper to check if a breakpoint is the next active one after current
	const getNextActiveBreakpoint = (
		current: BreakpointKey,
	): BreakpointKey | null => {
		const currentIndex = BREAKPOINT_ORDER.indexOf(current);
		for (let i = currentIndex + 1; i < BREAKPOINT_ORDER.length; i++) {
			const breakpoint = BREAKPOINT_ORDER[i];
			if (breakpoint && activeSet.has(breakpoint)) {
				return breakpoint;
			}
		}
		return null;
	};

	return (
		<div
			className={cn(breakpointDisplayVariants({ position }), className)}
			{...props}
		>
			{/* Minimum - shows below the first breakpoint */}
			{firstBreakpoint === "xxs" && (
				<p className="block xxs:hidden font-semibold">Minimum</p>
			)}
			{firstBreakpoint === "xs" && (
				<p className="block xs:hidden font-semibold">Minimum</p>
			)}
			{firstBreakpoint === "sm" && (
				<p className="block font-semibold sm:hidden">Minimum</p>
			)}
			{firstBreakpoint === "md" && (
				<p className="block font-semibold md:hidden">Minimum</p>
			)}
			{firstBreakpoint === "lg" && (
				<p className="block font-semibold lg:hidden">Minimum</p>
			)}
			{firstBreakpoint === "xl" && (
				<p className="block font-semibold xl:hidden">Minimum</p>
			)}
			{firstBreakpoint === "2xl" && (
				<p className="block font-semibold 2xl:hidden">Minimum</p>
			)}
			{firstBreakpoint === "3xl" && (
				<p className="block 3xl:hidden font-semibold">Minimum</p>
			)}

			{/* XXS breakpoint */}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "xs" && (
				<p className="xxs:block hidden xs:hidden font-semibold">XXS</p>
			)}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "sm" && (
				<p className="xxs:block hidden font-semibold sm:hidden">XXS</p>
			)}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "md" && (
				<p className="xxs:block hidden font-semibold md:hidden">XXS</p>
			)}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "lg" && (
				<p className="xxs:block hidden font-semibold lg:hidden">XXS</p>
			)}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "xl" && (
				<p className="xxs:block hidden font-semibold xl:hidden">XXS</p>
			)}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "2xl" && (
				<p className="xxs:block hidden font-semibold 2xl:hidden">XXS</p>
			)}
			{activeSet.has("xxs") && getNextActiveBreakpoint("xxs") === "3xl" && (
				<p className="xxs:block 3xl:hidden hidden font-semibold">XXS</p>
			)}
			{activeSet.has("xxs") && lastBreakpoint === "xxs" && (
				<p className="xxs:block hidden font-semibold">XXS</p>
			)}

			{/* XS breakpoint */}
			{activeSet.has("xs") && getNextActiveBreakpoint("xs") === "sm" && (
				<p className="xs:block hidden font-semibold sm:hidden">XS</p>
			)}
			{activeSet.has("xs") && getNextActiveBreakpoint("xs") === "md" && (
				<p className="xs:block hidden font-semibold md:hidden">XS</p>
			)}
			{activeSet.has("xs") && getNextActiveBreakpoint("xs") === "lg" && (
				<p className="xs:block hidden font-semibold lg:hidden">XS</p>
			)}
			{activeSet.has("xs") && getNextActiveBreakpoint("xs") === "xl" && (
				<p className="xs:block hidden font-semibold xl:hidden">XS</p>
			)}
			{activeSet.has("xs") && getNextActiveBreakpoint("xs") === "2xl" && (
				<p className="xs:block hidden font-semibold 2xl:hidden">XS</p>
			)}
			{activeSet.has("xs") && getNextActiveBreakpoint("xs") === "3xl" && (
				<p className="xs:block 3xl:hidden hidden font-semibold">XS</p>
			)}
			{activeSet.has("xs") && lastBreakpoint === "xs" && (
				<p className="xs:block hidden font-semibold">XS</p>
			)}

			{/* SM breakpoint */}
			{activeSet.has("sm") && getNextActiveBreakpoint("sm") === "md" && (
				<p className="hidden font-semibold sm:block md:hidden">SM</p>
			)}
			{activeSet.has("sm") && getNextActiveBreakpoint("sm") === "lg" && (
				<p className="hidden font-semibold sm:block lg:hidden">SM</p>
			)}
			{activeSet.has("sm") && getNextActiveBreakpoint("sm") === "xl" && (
				<p className="hidden font-semibold sm:block xl:hidden">SM</p>
			)}
			{activeSet.has("sm") && getNextActiveBreakpoint("sm") === "2xl" && (
				<p className="hidden font-semibold sm:block 2xl:hidden">SM</p>
			)}
			{activeSet.has("sm") && getNextActiveBreakpoint("sm") === "3xl" && (
				<p className="3xl:hidden hidden font-semibold sm:block">SM</p>
			)}
			{activeSet.has("sm") && lastBreakpoint === "sm" && (
				<p className="hidden font-semibold sm:block">SM</p>
			)}

			{/* MD breakpoint */}
			{activeSet.has("md") && getNextActiveBreakpoint("md") === "lg" && (
				<p className="hidden font-semibold md:block lg:hidden">MD</p>
			)}
			{activeSet.has("md") && getNextActiveBreakpoint("md") === "xl" && (
				<p className="hidden font-semibold md:block xl:hidden">MD</p>
			)}
			{activeSet.has("md") && getNextActiveBreakpoint("md") === "2xl" && (
				<p className="hidden font-semibold md:block 2xl:hidden">MD</p>
			)}
			{activeSet.has("md") && getNextActiveBreakpoint("md") === "3xl" && (
				<p className="3xl:hidden hidden font-semibold md:block">MD</p>
			)}
			{activeSet.has("md") && lastBreakpoint === "md" && (
				<p className="hidden font-semibold md:block">MD</p>
			)}

			{/* LG breakpoint */}
			{activeSet.has("lg") && getNextActiveBreakpoint("lg") === "xl" && (
				<p className="hidden font-semibold lg:block xl:hidden">LG</p>
			)}
			{activeSet.has("lg") && getNextActiveBreakpoint("lg") === "2xl" && (
				<p className="hidden font-semibold lg:block 2xl:hidden">LG</p>
			)}
			{activeSet.has("lg") && getNextActiveBreakpoint("lg") === "3xl" && (
				<p className="3xl:hidden hidden font-semibold lg:block">LG</p>
			)}
			{activeSet.has("lg") && lastBreakpoint === "lg" && (
				<p className="hidden font-semibold lg:block">LG</p>
			)}

			{/* XL breakpoint */}
			{activeSet.has("xl") && getNextActiveBreakpoint("xl") === "2xl" && (
				<p className="hidden font-semibold xl:block 2xl:hidden">XL</p>
			)}
			{activeSet.has("xl") && getNextActiveBreakpoint("xl") === "3xl" && (
				<p className="3xl:hidden hidden font-semibold xl:block">XL</p>
			)}
			{activeSet.has("xl") && lastBreakpoint === "xl" && (
				<p className="hidden font-semibold xl:block">XL</p>
			)}

			{/* 2XL breakpoint */}
			{activeSet.has("2xl") && getNextActiveBreakpoint("2xl") === "3xl" && (
				<p className="3xl:hidden hidden font-semibold 2xl:block">2XL</p>
			)}
			{activeSet.has("2xl") && lastBreakpoint === "2xl" && (
				<p className="hidden font-semibold 2xl:block">2XL</p>
			)}

			{/* 3XL breakpoint */}
			{activeSet.has("3xl") && lastBreakpoint === "3xl" && (
				<p className="3xl:block hidden font-semibold">3XL</p>
			)}
		</div>
	);
}

export { BreakpointDisplay, breakpointDisplayVariants };
export type { BreakpointDisplayProps, BreakpointKey };
