import type * as React from "react";

export function WidgetBoard({ children }: { children: React.ReactNode }) {
	return (
		<section
			aria-labelledby="widgets-heading"
			className="widget-board grid w-full max-w-5xl justify-items-center gap-4"
		>
			<h2 id="widgets-heading" className="sr-only">
				Widgets
			</h2>
			{children}
		</section>
	);
}
