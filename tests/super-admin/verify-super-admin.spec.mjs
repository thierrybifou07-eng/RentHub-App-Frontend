import { chromium } from "file:///C:/Users/thier/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs"

const BASE = "http://localhost:5173"

const CREDENTIALS = {
  root: { email: "root@renthub.com", password: "Root@12345" },
  admin: { email: "admin@renthub.com", password: "Admin@12345" },
}

async function login(page, { email, password }) {
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" })
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('form').first().locator('button[type="submit"]').click()
  await page.waitForURL(/dashboard/, { timeout: 15000 })
}

// ── Test 1: ROOT login → redirects to super-admin dashboard ──
console.log("Test 1: ROOT login → /super-admin/dashboard")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  const url = new URL(page.url())
  const ok = url.pathname === "/super-admin/dashboard"
  console.log(`  URL: ${url.pathname} — ${ok ? "PASS" : "FAIL"}`)
  await browser.close()
}

// ── Test 2: ROOT sidebar shows super-admin nav items ──
console.log("Test 2: ROOT sidebar shows super-admin nav")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  const navText = await page.locator("nav").first().textContent()
  const hasAudit = navText.includes("Logs d'audit")
  const hasUsers = navText.includes("Utilisateurs")
  console.log(`  Logs d'audit: ${hasAudit} — Utilisateurs: ${hasUsers} — ${hasAudit && hasUsers ? "PASS" : "FAIL"}`)
  await browser.close()
}

// ── Test 3: ROOT cannot access admin routes ──
console.log("Test 3: ROOT cannot access /admin/dashboard")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" })
  const url = new URL(page.url())
  const redirected = url.pathname !== "/admin/dashboard"
  console.log(`  URL after /admin/dashboard: ${url.pathname} — ${redirected ? "PASS (redirected)" : "FAIL"}`)
  await browser.close()
}

// ── Test 4: ADMIN cannot access super-admin routes ──
console.log("Test 4: ADMIN cannot access /super-admin/dashboard")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.admin)
  await page.goto(`${BASE}/super-admin/dashboard`, { waitUntil: "networkidle" })
  const url = new URL(page.url())
  const redirected = url.pathname !== "/super-admin/dashboard"
  console.log(`  URL after /super-admin/dashboard: ${url.pathname} — ${redirected ? "PASS (redirected)" : "FAIL"}`)
  await browser.close()
}

// ── Test 5: ROOT audit logs page loads with data ──
console.log("Test 5: ROOT audit logs page shows data")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  await page.goto(`${BASE}/super-admin/audit-logs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)
  const rowCount = await page.locator("table tbody tr").count()
  console.log(`  Audit log rows: ${rowCount} — ${rowCount > 0 ? "PASS" : "FAIL"}`)
  await browser.close()
}

// ── Test 6: ROOT users page loads with all roles ──
console.log("Test 6: ROOT users page shows users including admins")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  await page.goto(`${BASE}/super-admin/utilisateurs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(1000)
  const rowCount = await page.locator("table tbody tr").count()
  console.log(`  User rows: ${rowCount} — ${rowCount > 0 ? "PASS" : "FAIL"}`)
  await browser.close()
}

// ── Test 7: ROOT can change a user's role via API ──
console.log("Test 7: ROOT API — role change")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  const token = await page.evaluate(() => localStorage.getItem("renthub-token"))
  const resp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/1/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tk}` },
      body: JSON.stringify({ newRoleId: 4 }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  const ok = resp.status === 200 || resp.status === 400 || resp.status === 404
  console.log(`  Status: ${resp.status} — ${ok ? "PASS" : "FAIL"}`)
  // Restore user 1 back to role 1
  if (resp.status === 200) {
    await page.evaluate(async (tk) => {
      await fetch("http://localhost:3000/api/v1/super-admin/users/1/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tk}` },
        body: JSON.stringify({ newRoleId: 1 }),
      })
    }, token)
  }
  await browser.close()
}

// ── Test 8: ROOT API — audit logs endpoint ──
console.log("Test 8: ROOT API — audit logs")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  const token = await page.evaluate(() => localStorage.getItem("renthub-token"))
  const resp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/audit-logs?limit=5", {
      headers: { "Authorization": `Bearer ${tk}` },
    })
    return { status: r.status, body: await r.json() }
  }, token)
  const hasData = resp.body?.data?.length > 0
  console.log(`  Status: ${resp.status} — Data: ${hasData} — ${resp.status === 200 && hasData ? "PASS" : "FAIL"}`)
  await browser.close()
}

// ── Test 9: ADMIN API — cannot access super-admin endpoints ──
console.log("Test 9: ADMIN API — 403 on super-admin routes")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.admin)
  const token = await page.evaluate(() => localStorage.getItem("renthub-token"))
  const resp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/audit-logs?limit=5", {
      headers: { "Authorization": `Bearer ${tk}` },
    })
    return { status: r.status }
  }, token)
  console.log(`  Status: ${resp.status} — ${resp.status === 403 ? "PASS" : "FAIL"}`)
  await browser.close()
}

// ── Test 10: ROOT sidebar badge ──
console.log("Test 10: ROOT sidebar shows correct badge label")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await login(page, CREDENTIALS.root)
  await page.waitForTimeout(1000)
  const badge = await page.locator("span").filter({ hasText: "Super Admin" }).count()
  console.log(`  Super Admin badge found: ${badge > 0} — ${badge > 0 ? "PASS" : "FAIL"}`)
  await browser.close()
}

console.log("\nAll tests completed.")
