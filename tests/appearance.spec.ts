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

  await page.reload();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute(
    "data-transparency",
    "medium",
  );
  await expect(page.locator("html")).toHaveAttribute("data-blur", "strong");
  await expect(page.locator("html")).toHaveAttribute("data-tint", "off");
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
