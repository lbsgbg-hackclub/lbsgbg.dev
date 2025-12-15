import Image from "next/image";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Button } from "./ui/button";

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string;
	children?: ReactNode;
	iconSrc?: string;
	iconAlt?: string;
	iconSize?: number;
};

export default function LinkButton({
	href,
	children,
	iconSrc,
	iconAlt = "Icon",
	iconSize = 20,
	target,
	rel,
	...props
}: LinkButtonProps) {
	// Ensure safe defaults for external links
	const isExternal = href?.startsWith("http");
	const safeTarget = target ?? (isExternal ? "_blank" : undefined);
	const safeRel =
		rel ?? (safeTarget === "_blank" ? "noreferrer noopener" : undefined);
	const restProps = props.className
		? Object.fromEntries(
				Object.entries(props).filter(([key]) => key !== "className"),
			)
		: props;

	return (
		<Button
			asChild
			className={`hover:-translate-y-0.5 h-11 rounded-none border bg-linear-to-r text-white transition ${props.className}`}
			variant="secondary"
		>
			<a href={href} rel={safeRel} target={safeTarget} {...restProps}>
				<span className="inline-flex items-center justify-center gap-2">
					{iconSrc ? (
						<Image
							alt={iconAlt}
							height={iconSize}
							src={iconSrc}
							unoptimized
							width={iconSize}
						/>
					) : null}
					{children}
				</span>
			</a>
		</Button>
	);
}
