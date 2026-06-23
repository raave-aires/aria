import type * as React from "react";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WidgetSize = "regular" | "tall";
type WidgetProps = Omit<React.ComponentProps<typeof Card>, "size"> & {
	size?: WidgetSize;
};

function Widget({ className, size = "regular", ...props }: WidgetProps) {
	return (
		<Card
			data-slot="widget"
			data-size={size}
			className={cn(
				"widget surface-panel surface-tint self-start gap-0 overflow-hidden rounded-3xl py-0",
				className,
			)}
			{...props}
		/>
	);
}

function WidgetHeader({
	className,
	...props
}: React.ComponentProps<typeof CardHeader>) {
	return (
		<CardHeader
			className={cn("shrink-0 px-5 pt-4 pb-0", className)}
			{...props}
		/>
	);
}

function WidgetContent({
	className,
	...props
}: React.ComponentProps<typeof CardContent>) {
	return (
		<CardContent
			className={cn("min-h-0 flex-1 overflow-hidden px-5 pt-3 pb-4", className)}
			{...props}
		/>
	);
}

function WidgetFooter({
	className,
	...props
}: React.ComponentProps<typeof CardFooter>) {
	return (
		<CardFooter
			className={cn(
				"shrink-0 justify-between gap-3 border-t border-foreground/10 px-5 py-3 !pt-3",
				className,
			)}
			{...props}
		/>
	);
}

function WidgetTitle(props: React.ComponentProps<typeof CardTitle>) {
	return <CardTitle role="heading" aria-level={2} {...props} />;
}

const WidgetDescription = CardDescription;
const WidgetAction = CardAction;

export {
	Widget,
	WidgetAction,
	WidgetContent,
	WidgetDescription,
	WidgetFooter,
	WidgetHeader,
	WidgetTitle,
};
