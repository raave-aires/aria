import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("mostra DuckDuckGo e permite escolher outro motor", async ({ page }) => {
  const engineButton = page.getByRole("button", {
    name: "Selecionar motor de busca: DuckDuckGo",
  });

  await expect(
    page.getByRole("combobox", { name: "Buscar na web" }),
  ).toHaveAttribute("placeholder", "Pesquisar com DuckDuckGo");

  await engineButton.click();
  await page.getByRole("option", { name: "Google" }).click();

  await expect(
    page.getByRole("button", {
      name: "Selecionar motor de busca: Google",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Buscar na web" }),
  ).toHaveAttribute("placeholder", "Pesquisar com Google");
});

test("compacta o seletor e aplica vidro fosco com espaço entre as opções", async ({
  page,
}) => {
  const engineButton = page.getByRole("button", {
    name: "Selecionar motor de busca: DuckDuckGo",
  });

  await expect(engineButton).toHaveText("");
  await expect(engineButton.locator("img")).toHaveAttribute(
    "src",
    /duckduckgo/,
  );

  await engineButton.click();

  const dropdown = page.locator('[data-slot="command-list"]');
  await expect(dropdown).toHaveClass(/surface-panel/);

  await expect(dropdown).toHaveCSS("--app-surface-blur", "24px");

  const options = page.getByRole("option");
  const firstOption = await options.nth(0).boundingBox();
  const secondOption = await options.nth(1).boundingBox();

  expect(firstOption).not.toBeNull();
  expect(secondOption).not.toBeNull();
  expect(secondOption?.y).toBeGreaterThan(
    (firstOption?.y ?? 0) + (firstOption?.height ?? 0),
  );

  await expect(
    page.getByRole("option", { name: "Wikipédia" }).locator("img"),
  ).toHaveAttribute("src", /wikipedia/);
  await expect(
    page.getByRole("option", { name: "YouTube" }).locator("img"),
  ).toHaveAttribute("src", /youtube/);
  await expect(
    page.getByRole("option", { name: /DuckDuckGo/ }).getByText("Atual"),
  ).toBeVisible();

  const badge = page
    .getByRole("option", { name: /DuckDuckGo/ })
    .getByText("Atual");
  const shortcut = page
    .getByRole("option", { name: /Brave Search/ })
    .locator('[data-slot="command-shortcut"]');
  const badgeBox = await badge.boundingBox();
  const shortcutBox = await shortcut.boundingBox();

  expect(badgeBox).not.toBeNull();
  expect(shortcutBox).not.toBeNull();
  expect(
    Math.abs((badgeBox?.right ?? 0) - (shortcutBox?.right ?? 0)),
  ).toBeLessThanOrEqual(1);
});

test("mantém apenas um dropdown aberto e o fecha ao clicar fora", async ({
  page,
}) => {
  await page.route("**/api/search-suggestions**", (route) =>
    route.fulfill({ json: { suggestions: ["aria framework"] } }),
  );

  const searchInput = page.getByRole("combobox", { name: "Buscar na web" });
  await searchInput.fill("aria");
  await expect(
    page.getByRole("option", { name: "aria framework" }),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Selecionar motor de busca: DuckDuckGo",
    })
    .click();

  await expect(page.getByRole("option", { name: "Google" })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "aria framework" }),
  ).toHaveCount(0);

  await page.mouse.click(10, 10);
  await expect(page.locator('[data-slot="command-list"]')).toHaveCount(0);
});

test("permite navegar os dropdowns com as setas", async ({ page }) => {
  await page.route("**/api/search-suggestions**", (route) =>
    route.fulfill({ json: { suggestions: ["aria framework", "aria router"] } }),
  );

  const searchInput = page.getByRole("combobox", { name: "Buscar na web" });
  await searchInput.fill("aria");
  await expect(
    page.getByRole("option", { name: "aria framework" }),
  ).toBeVisible();

  await searchInput.press("ArrowDown");
  await expect(
    page.locator('[data-slot="command-item"][data-selected="true"]'),
  ).toHaveCount(1);

  await page
    .getByRole("button", {
      name: "Selecionar motor de busca: DuckDuckGo",
    })
    .click();
  await searchInput.press("ArrowDown");
  await expect(
    page.locator('[data-slot="command-item"][data-selected="true"]'),
  ).toHaveCount(1);
});

test("apelido no texto tem prioridade sobre o motor selecionado", async ({
  page,
}) => {
  await page.route("https://www.google.com/search**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Google results" }),
  );

  const searchInput = page.getByRole("combobox", { name: "Buscar na web" });
  await searchInput.fill("g café especial");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(/google\.com\/search\?q=caf%C3%A9%20especial/);
});

test("apelido atualiza o motor exibido antes de enviar a pesquisa", async ({
  page,
}) => {
  const searchInput = page.getByRole("combobox", { name: "Buscar na web" });

  await searchInput.fill("b teste");

  await expect(
    page.getByRole("button", {
      name: "Selecionar motor de busca: Brave Search",
    }),
  ).toBeVisible();

  await expect(page.locator('section[aria-label="Pesquisa na web"]')).toHaveCSS(
    "max-width",
    "896px",
  );
});

test("exibe e envia uma sugestão retornada pela API interna", async ({
  page,
}) => {
  await page.route("**/api/search-suggestions**", (route) =>
    route.fulfill({ json: { suggestions: ["aria framework"] } }),
  );
  await page.route("https://duckduckgo.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "DuckDuckGo results" }),
  );

  const searchInput = page.getByRole("combobox", { name: "Buscar na web" });
  await searchInput.fill("aria");

  const suggestion = page.getByRole("option", { name: "aria framework" });
  await expect(suggestion).toBeVisible();
  await suggestion.click();

  await expect(page).toHaveURL(/duckduckgo\.com\/\?q=aria%20framework/);
});

test("mostra o spinner no título enquanto busca sugestões", async ({
  page,
}) => {
  await page.route("**/api/search-suggestions**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await route.fulfill({ json: { suggestions: ["aria framework"] } });
  });

  await page.getByRole("combobox", { name: "Buscar na web" }).fill("aria");

  const dropdown = page.locator('[data-slot="command-list"]');
  await expect(
    dropdown.getByRole("status", { name: "Buscando sugestões" }),
  ).toBeVisible();
  await expect(dropdown.getByText("Buscando sugestões…")).toHaveCount(0);
});

test("limita as sugestões visíveis e mantém a lista sem scrollbar", async ({
  page,
}) => {
  const suggestions = Array.from(
    { length: 7 },
    (_, index) => `sugestão ${index + 1}`,
  );
  await page.route("**/api/search-suggestions**", (route) =>
    route.fulfill({ json: { suggestions } }),
  );

  await page.getByRole("combobox", { name: "Buscar na web" }).fill("sug");

  const dropdown = page.locator('[data-slot="command-list"]');
  await expect(dropdown.getByRole("option")).toHaveCount(6);
  await expect(dropdown).toHaveCSS("scrollbar-width", "none");
  await expect(page.getByRole("option", { name: "sugestão 7" })).toHaveCount(0);
});

test("continua pesquisando quando o motor não possui sugestões", async ({
  page,
}) => {
  await page.route("https://www.youtube.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "YouTube results" }),
  );

  await page
    .getByRole("button", {
      name: "Selecionar motor de busca: DuckDuckGo",
    })
    .click();
  await page.getByRole("option", { name: "YouTube" }).click();

  const searchInput = page.getByRole("combobox", { name: "Buscar na web" });
  await searchInput.fill("música");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(
    /youtube\.com\/results\?search_query=m%C3%BAsica/,
  );
});

test("restaura o último motor de busca escolhido", async ({ page }) => {
  await page
    .getByRole("button", {
      name: "Selecionar motor de busca: DuckDuckGo",
    })
    .click();
  await page.getByRole("option", { name: "Kagi" }).click();

  await page.reload();

  await expect(
    page.getByRole("button", {
      name: "Selecionar motor de busca: Kagi",
    }),
  ).toBeVisible();
});
