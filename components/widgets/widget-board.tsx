import type * as React from "react";

export function WidgetBoard({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="widgets-heading"
      className="grid w-full max-w-5xl grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <h2 id="widgets-heading" className="sr-only">
        Widgets
      </h2>
      {children}
    </section>
  );
}
