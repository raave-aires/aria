import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("mostra DuckDuckGo e permite escolher outro motor", async ({ page }) => {
  const engineButton = page.getByRole("button", {
    name: "Selecionar motor de busca: DuckDuckGo",
  });

  await expect(
    page.getByRole("textbox", { name: "Buscar na web" }),
  ).toHaveAttribute("placeholder", "Pesquisar com DuckDuckGo");

  await engineButton.click();
  await page.getByRole("option", { name: "Google" }).click();

  await expect(
    page.getByRole("button", {
      name: "Selecionar motor de busca: Google",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Buscar na web" }),
  ).toHaveAttribute("placeholder", "Pesquisar com Google");
});

test("apelido no texto tem prioridade sobre o motor selecionado", async ({
  page,
}) => {
  await page.route("https://www.google.com/search**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Google results" }),
  );

  const searchInput = page.getByRole("textbox", { name: "Buscar na web" });
  await searchInput.fill("g café especial");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(/google\.com\/search\?q=caf%C3%A9%20especial/);
});

test("apelido atualiza o motor exibido antes de enviar a pesquisa", async ({
  page,
}) => {
  const searchInput = page.getByRole("textbox", { name: "Buscar na web" });

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

  const searchInput = page.getByRole("textbox", { name: "Buscar na web" });
  await searchInput.fill("aria");

  const suggestion = page.getByRole("option", { name: "aria framework" });
  await expect(suggestion).toBeVisible();
  await suggestion.click();

  await expect(page).toHaveURL(/duckduckgo\.com\/\?q=aria%20framework/);
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

  const searchInput = page.getByRole("textbox", { name: "Buscar na web" });
  await searchInput.fill("música");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(
    /youtube\.com\/results\?search_query=m%C3%BAsica/,
  );
});
