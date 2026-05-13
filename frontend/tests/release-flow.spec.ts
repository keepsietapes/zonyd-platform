import { test, expect } from '@playwright/test';

test('E2E: Release Manager Flow (Happy Path)', async ({ page }) => {
  // Configurar baseURL a través de Playwright para apuntar al frontend
  await page.goto('/');

  // 1. Iniciar sesión usando la "puerta trasera" de desarrollo (click en el logo)
  await page.click('text=Zonyd OS');
  
  // 2. Esperar a que el Release Manager esté visible (Paso 1: Audio)
  await expect(page.locator('text=Sube tu Audio')).toBeVisible();

  // 3. Navegación entre pasos (Verificar el Happy Path de UI)
  const nextButton = page.locator('button:has-text("Siguiente")');
  
  // Mover a Paso 2: Portada
  await nextButton.click();
  await expect(page.locator('text=Portada del Lanzamiento')).toBeVisible();
  
  // Mover a Paso 3: Metadatos
  await nextButton.click();
  await expect(page.locator('text=Detalles del Lanzamiento')).toBeVisible();
  
  // Mover a Paso 4: Splits
  await nextButton.click();
  await expect(page.locator('text=Configuración de Splits')).toBeVisible();

  // Mover a Paso 5: Revisión
  await nextButton.click();
  await expect(page.locator('text=¡Todo listo para el lanzamiento!')).toBeVisible();
});
