import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

test("renderiza o widget e permite abrir as opções", async ({ page }) => {
	const widget = page.getByTestId("weather-widget");

	await expect(widget).toBeVisible();
	await expect(widget.getByRole("heading", { name: "Clima" })).toBeVisible();

	await page.getByRole("button", { name: "Opções do widget de clima" }).click();
	await expect(
		page.getByRole("menuitem", { name: "Alterar cidade" }),
	).toBeVisible();
	await expect(page.getByRole("menuitem", { name: "Detalhado" })).toBeVisible();
});

test("alterna o compacto entre resumo e previsão", async ({ page }) => {
	const compactTabs = page.getByRole("tablist", {
		name: "Conteúdo do widget compacto",
	});

	await expect(compactTabs.getByRole("tab")).toHaveCount(2);
	await compactTabs.getByRole("tab", { name: "Mostrar previsão" }).click();
	await expect(
		page.getByRole("tablist", { name: "Período da previsão" }),
	).toBeVisible();

	await compactTabs.getByRole("tab", { name: "Mostrar resumo" }).click();
	await expect(page.getByText("Sensação", { exact: true })).toBeVisible();
});

test("busca cidades globais na caixa de localização", async ({ page }) => {
	await page.route("**/api/geocode?*", (route) =>
		route.fulfill({
			json: {
				results: [
					{
						name: "Tóquio",
						label: "Tóquio, Tóquio, Japão",
						latitude: 35.6762,
						longitude: 139.6503,
						timezone: "Asia/Tokyo",
						country: "Japão",
						countryCode: "JP",
						state: "Tóquio",
					},
				],
			},
		}),
	);

	await page.getByRole("button", { name: "Opções do widget de clima" }).click();
	await page.getByRole("menuitem", { name: "Alterar cidade" }).click();
	await page.getByRole("textbox", { name: "Buscar cidade" }).fill("Tóquio");

	await expect(
		page.getByRole("option", { name: /Tóquio, Tóquio, Japão/ }),
	).toBeVisible();

	await page.getByRole("option", { name: /Tóquio, Tóquio, Japão/ }).click();

	await expect
		.poll(async () => {
			const weatherCookie = (await page.context().cookies()).find(
				(cookie) => cookie.name === "aria-weather",
			);
			return weatherCookie ? decodeURIComponent(weatherCookie.value) : "";
		})
		.toContain("Asia/Tokyo");
});

test("expande o widget e alterna a previsão sem chamada direta ao Open-Meteo", async ({
	page,
}) => {
	const openMeteoRequests: string[] = [];
	page.on("request", (request) => {
		if (request.url().includes("open-meteo.com")) {
			openMeteoRequests.push(request.url());
		}
	});

	await page.getByRole("button", { name: "Opções do widget de clima" }).click();
	await page.getByRole("menuitem", { name: "Detalhado" }).click();

	const tablist = page.getByRole("tablist", { name: "Período da previsão" });
	await expect(tablist).toBeVisible();
	await expect(tablist.getByRole("tab", { name: "Horas" })).toHaveAttribute(
		"aria-selected",
		"true",
	);
	await expect(page.getByTestId("weather-hours-more")).toBeVisible();

	const hourlyCards = page.locator(".weather-hourly-scroll article");
	const hourlyScroller = page.locator(".weather-hourly-scroll");
	await expect(hourlyCards.nth(2)).toBeVisible();
	const thirdCard = await hourlyCards.nth(2).boundingBox();
	const scroller = await hourlyScroller.boundingBox();

	if (!thirdCard || !scroller) {
		throw new Error("Não foi possível medir os cartões horários.");
	}

	expect(thirdCard.x + thirdCard.width).toBeLessThanOrEqual(
		scroller.x + scroller.width,
	);
	await expect
		.poll(() =>
			hourlyScroller.evaluate(
				(element) => element.scrollWidth > element.clientWidth,
			),
		)
		.toBe(true);

	await tablist.getByRole("tab", { name: "Dias" }).click();
	await expect(tablist.getByRole("tab", { name: "Dias" })).toHaveAttribute(
		"aria-selected",
		"true",
	);
	await expect(page.getByText("Amanhã", { exact: true })).toBeVisible();
	expect(openMeteoRequests).toEqual([]);
});
