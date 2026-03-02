import { test, expect } from '@playwright/test';

test('Rutgers preset happy path renders leave time', async ({ page }) => {
  await page.route('**/api/compute', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        leaveBy: '2026-01-12T12:34:00.000Z',
        explanation: 'Mocked explanation',
        alerts: [{ agency: 'PATH', summary: 'Minor delays', severity: 'warning' }],
        recommended: {
          departTime: '2026-01-12T12:44:00.000Z',
          arriveTime: '2026-01-12T13:53:00.000Z',
          totalDuration: 69,
          transfersCount: 3,
          riskScore: 3.5,
          source: 'mock',
          legs: [
            {
              mode: 'LIGHT_RAIL',
              agency: 'HBLR',
              from: 'Home',
              to: 'Exchange Place',
              scheduledDepart: '2026-01-12T12:44:00.000Z',
              scheduledArrive: '2026-01-12T12:55:00.000Z',
              reliabilityScore: 0.8,
              alerts: []
            }
          ]
        },
        backup: null
      })
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Abigail → Rutgers 9:00 AM/i }).click();
  await page.getByRole('button', { name: /Compute Leave Time/i }).click();
  await expect(page.getByRole('heading', { name: /Leave by/i })).toBeVisible();
});
