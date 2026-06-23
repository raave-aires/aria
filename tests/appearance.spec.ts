import { expect, type Page, test } from "@playwright/test";

async function instrumentObjectUrls(page: Page) {
	await page.addInitScript(() => {
		const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
		let revokedObjectUrls = 0;

		URL.revokeObjectURL = (url) => {
			revokedObjectUrls += 1;
			originalRevokeObjectUrl(url);
		};

		Object.defineProperty(window, "__ariaRevokedObjectUrls", {
			get: () => revokedObjectUrls,
		});
	});
}

test.beforeEach(async ({ page }) => {
	await instrumentObjectUrls(page);
	await page.goto("/");
});

test("hidrata a aparência padrão e usa o wallpaper local", async ({ page }) => {
	await expect(page.locator("html")).toHaveAttribute(
		"data-transparency",
		"high",
	);
	await expect(page.locator("html")).toHaveAttribute("data-blur", "medium");
	await expect(page.getByTestId("wallpaper")).toHaveAttribute(
		"src",
		/mountain/,
	);
});

test("renderiza a aparência persistida antes da hidratação do Dexie", async ({
	page,
}) => {
	await page.context().addCookies([
		{
			name: "aria-appearance",
			value: encodeURIComponent(
				JSON.stringify({
					theme: "dark",
					transparency: "low",
					blur: "strong",
					tint: true,
					accentMode: "manual",
					accentColor: "#005cc5",
					updatedAt: "2026-06-21T00:00:00.000Z",
				}),
			),
			url: "http://127.0.0.1:3000",
		},
	]);

	await page.goto("/", { waitUntil: "commit" });

	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.locator("html")).toHaveAttribute(
		"data-transparency",
		"low",
	);
	await expect(page.locator("html")).toHaveAttribute("data-blur", "strong");
	await expect(page.locator("html")).toHaveAttribute("data-tint", "on");
	await expect(page.locator("html")).toHaveCSS("--app-accent-rgb", "0 92 197");
});

test("persiste tema e controles de material após recarregar", async ({
	page,
}) => {
	await page
		.getByRole("button", { name: "Abrir configurações de aparência" })
		.click();

	await page
		.getByRole("radiogroup", { name: "Tema" })
		.getByRole("radio", { name: "Escuro" })
		.click();
	await page
		.getByRole("radiogroup", { name: "Transparência" })
		.getByRole("radio", { name: "Média" })
		.click();
	await page
		.getByRole("radiogroup", { name: "Desfoque" })
		.getByRole("radio", { name: "Forte" })
		.click();
	await page.getByRole("switch", { name: "Tint" }).click();

	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.locator("html")).toHaveAttribute(
		"data-transparency",
		"medium",
	);
	await expect(page.locator("html")).toHaveAttribute("data-blur", "strong");
	await expect(page.locator("html")).toHaveAttribute("data-tint", "off");
	await expect
		.poll(() =>
			page
				.locator('[data-slot="popover-content"]')
				.evaluate((element) => getComputedStyle(element).backdropFilter),
		)
		.toContain("blur");

	await page.reload();

	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.locator("html")).toHaveAttribute(
		"data-transparency",
		"medium",
	);
	await expect(page.locator("html")).toHaveAttribute("data-blur", "strong");
	await expect(page.locator("html")).toHaveAttribute("data-tint", "off");
});

test("aplica a cor de destaque aos controles ativos e ao tint", async ({
	page,
}) => {
	await page
		.getByRole("button", { name: "Abrir configurações de aparência" })
		.click();

	const manualChoice = page
		.getByRole("radio", { name: "Manual" })
		.locator("..");
	await manualChoice.click();
	await page.getByLabel("Cor de destaque manual").evaluate((input) => {
		const colorInput = input as HTMLInputElement;
		const nativeValueSetter = Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set;
		nativeValueSetter?.call(colorInput, "#005cc5");
		colorInput.dispatchEvent(new Event("input", { bubbles: true }));
		colorInput.dispatchEvent(new Event("change", { bubbles: true }));
	});

	await expect(page.locator("html")).toHaveCSS("--app-accent-rgb", "0 92 197");
	await expect(manualChoice).toHaveCSS("background-color", "rgb(0, 92, 197)");

	const popover = page.locator('[data-slot="popover-content"]');
	await expect(popover).toHaveCSS("background-image", /linear-gradient/);
	await expect(page.getByRole("switch", { name: "Tint" })).toHaveCSS(
		"background-color",
		"rgb(0, 92, 197)",
	);
	await page.getByRole("switch", { name: "Tint" }).click();
	await expect(popover).toHaveCSS("background-image", "none");
});

test("mantém os níveis de transparência e desfoque visualmente distintos", async ({
	page,
}) => {
	await page
		.getByRole("button", { name: "Abrir configurações de aparência" })
		.click();

	const transparency = page.getByRole("radiogroup", { name: "Transparência" });
	await transparency.getByRole("radio", { name: "Baixa" }).click();
	await expect(page.locator("html")).toHaveCSS("--app-panel-opacity", ".84");

	await transparency.getByRole("radio", { name: "Alta" }).click();
	await expect(page.locator("html")).toHaveCSS("--app-panel-opacity", ".38");

	const blur = page.getByRole("radiogroup", { name: "Desfoque" });
	await blur.getByRole("radio", { name: "Suave" }).click();
	await expect(page.locator("html")).toHaveCSS("--app-surface-blur", "8px");

	await blur.getByRole("radio", { name: "Forte" }).click();
	await expect(page.locator("html")).toHaveCSS("--app-surface-blur", "56px");
});

test("mostra apenas os controles de aparência relevantes", async ({ page }) => {
	await page
		.getByRole("button", { name: "Abrir configurações de aparência" })
		.click();

	const blur = page.getByRole("radiogroup", { name: "Desfoque" });
	const manualColor = page.getByLabel("Cor de destaque manual");

	await expect(blur).toBeVisible();
	await expect(manualColor).toHaveCount(0);

	await page
		.getByRole("radiogroup", { name: "Transparência" })
		.getByRole("radio", { name: "Desligada" })
		.click();
	await expect(blur).toHaveCount(0);

	await page
		.getByRole("radiogroup", { name: "Transparência" })
		.getByRole("radio", { name: "Baixa" })
		.click();
	await expect(blur).toBeVisible();

	await page
		.getByRole("radiogroup", { name: "Modo da cor de destaque" })
		.getByRole("radio", { name: "Manual" })
		.click();
	await expect(manualColor).toBeVisible();

	await page
		.getByRole("radiogroup", { name: "Modo da cor de destaque" })
		.getByRole("radio", { name: "Automática" })
		.click();
	await expect(manualColor).toHaveCount(0);
});

test("salva, restaura e remove wallpaper Blob", async ({ page }) => {
	await page
		.getByRole("button", { name: "Abrir configurações de aparência" })
		.click();

	const fileInput = page.getByLabel("Escolher imagem de wallpaper");
	await fileInput.setInputFiles({
		name: "por-do-sol.svg",
		mimeType: "image/svg+xml",
		buffer: Buffer.from(
			'<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="#c65943"/></svg>',
		),
	});

	await expect(page.getByTestId("wallpaper")).toHaveAttribute("src", /^blob:/);
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					(window as typeof window & { __ariaRevokedObjectUrls?: number })
						.__ariaRevokedObjectUrls ?? 0,
			),
		)
		.toBeGreaterThan(0);

	await page.reload();
	await expect(page.getByTestId("wallpaper")).toHaveAttribute("src", /^blob:/);

	await page
		.getByRole("button", { name: "Abrir configurações de aparência" })
		.click();
	await page
		.getByRole("button", { name: "Restaurar wallpaper padrão" })
		.click();

	await expect(page.getByTestId("wallpaper")).toHaveAttribute(
		"src",
		/mountain/,
	);
});
