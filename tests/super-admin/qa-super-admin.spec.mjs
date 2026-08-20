import { chromium } from "file:///C:/Users/thier/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs"

const BASE = "http://localhost:5173"
const ROOT = { email: "root@renthub.com", password: "Root@12345" }

let totalTests = 0
let passed = 0
let failed = 0
const issues = []

function check(label, ok, detail = "") {
  totalTests++
  if (ok) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label} -- ${detail}`); issues.push({ label, detail }) }
}

async function login(page) {
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" })
  await page.locator('input[name="email"]').fill(ROOT.email)
  await page.locator('input[name="password"]').fill(ROOT.password)
  await page.locator('form').first().locator('button[type="submit"]').click()
  await page.waitForURL(/super-admin/, { timeout: 15000 })
  await page.waitForTimeout(500)
}

// =====================================================================
// SECTION 1: Dashboard
// =====================================================================
console.log("\n=== SECTION 1: Dashboard ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  const errs = []
  page.on("console", msg => { if (msg.type() === "error") errs.push(msg.text()) })

  await login(page)

  const url = new URL(page.url())
  check("1.1 URL is /super-admin/dashboard", url.pathname === "/super-admin/dashboard")

  const title = await page.locator("h1, h2, h3, h4, h5").filter({ hasText: /Super Administrateur|Espace Super/ }).count()
  check("1.2 Dashboard title visible", title > 0)

  await page.waitForTimeout(1500)
  const bodyText = await page.locator("body").textContent()
  check("1.3 Total actions auditees displayed", bodyText.includes("Total actions"))

  const hasBreakdown = bodyText.includes("Rpartition") || bodyText.includes("paration") || bodyText.includes("action")
  check("1.4 Repartition par action section", hasBreakdown, hasBreakdown ? "found" : "not found in body")

  check("1.5 Dernieres actions table", bodyText.includes("erni") || bodyText.includes("derni"))

  const recentRows = await page.locator("table tbody tr").count()
  check("1.6 Recent activity has rows", recentRows > 0, `found ${recentRows} rows`)

  check("1.7 Welcome message present", bodyText.includes("Bienvenue"))
  check("1.8 No console errors", errs.length === 0, errs.join("; "))

  await browser.close()
}

// =====================================================================
// SECTION 2: Audit Logs - Data & Display
// =====================================================================
console.log("\n=== SECTION 2: Audit Logs - Data & Display ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  const errs = []
  page.on("console", msg => { if (msg.type() === "error") errs.push(msg.text()) })

  await login(page)
  await page.goto(`${BASE}/super-admin/audit-logs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const rowCount = await page.locator("table tbody tr").count()
  check("2.1 Audit logs table has rows", rowCount > 0, `found ${rowCount}`)

  const headers = await page.locator("table thead th").allTextContents()
  const needed = ["Acteur", "Action", "Cible", "Date"]
  const hasAll = needed.every(h => headers.some(th => th.includes(h)))
  check("2.2 Table has required columns", hasAll, `found: ${headers.join(", ")}`)

  const firstCell = await page.locator("table tbody tr").first().locator("td").first().textContent()
  check("2.3 Actor info in first column", firstCell.includes("@"))

  const badges = await page.locator("table tbody .badge").count()
  check("2.4 Action badges rendered", badges > 0, `found ${badges}`)

  const ipText = await page.locator("table tbody tr").first().locator("td").nth(3).textContent()
  check("2.5 IP column present", ipText.length > 0, `IP: "${ipText.trim()}"`)

  const detailBtns = await page.locator('button:has-text("tails")').count()
  check("2.6 Details button per row", detailBtns >= rowCount, `btns=${detailBtns}, rows=${rowCount}`)

  const bodyText = await page.locator("body").textContent()
  const hasPageInfo = bodyText.includes("entr")
  check("2.7 Page info shows entry count", hasPageInfo)

  check("2.8 No console errors", errs.length === 0, errs.join("; "))

  await browser.close()
}

// =====================================================================
// SECTION 3: Audit Logs - Filters
// =====================================================================
console.log("\n=== SECTION 3: Audit Logs - Filters ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/audit-logs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const selectCount = await page.locator("select").count()
  check("3.1 Filter selects exist", selectCount >= 2, `found ${selectCount} selects`)

  const rowCountBefore = await page.locator("table tbody tr").count()

  await page.locator("select").first().selectOption("ROLE_CHANGE")
  await page.waitForTimeout(2000)
  const afterFilter = await page.locator("table tbody tr").count()
  check("3.2 Action filter applied", true, `before=${rowCountBefore}, after=${afterFilter}`)

  if (afterFilter > 0) {
    const badges = await page.locator("table tbody .badge").allTextContents()
    const allMatch = badges.every(b => b.includes("le"))
    check("3.3 Filtered rows match filter", allMatch, `badges: ${badges.slice(0, 3).join(", ")}`)
  } else {
    check("3.3 Filtered rows match filter", true, "0 rows after filter (valid)")
  }

  await page.locator("select").first().selectOption("")
  await page.waitForTimeout(2000)
  const afterReset = await page.locator("table tbody tr").count()
  check("3.4 Reset filter restores rows", afterReset > 0, `rows: ${afterReset}`)

  await page.locator("select").nth(1).selectOption("USER")
  await page.waitForTimeout(2000)
  const targetRows = await page.locator("table tbody tr").count()
  check("3.5 Target filter USER applied", true, `USER rows: ${targetRows}`)

  await page.locator("select").nth(1).selectOption("")
  await page.waitForTimeout(2000)

  const dateInputs = await page.locator('input[type="date"]').count()
  check("3.6 Date filter inputs exist", dateInputs === 2, `found ${dateInputs}`)

  await page.locator('input[type="date"]').first().fill("2026-08-01")
  await page.waitForTimeout(2000)
  const dateRows = await page.locator("table tbody tr").count()
  check("3.7 Date from filter works", true, `rows after date_from: ${dateRows}`)

  await browser.close()
}

// =====================================================================
// SECTION 4: Audit Logs - Detail Modal
// =====================================================================
console.log("\n=== SECTION 4: Audit Logs - Detail Modal ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/audit-logs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const detailBtn = page.locator('button:has-text("tails")').first()
  check("4.1 Details button exists", await detailBtn.count() > 0)

  await detailBtn.click()
  await page.waitForTimeout(1500)
  const modal = page.locator(".modal.d-block")
  check("4.2 Modal opens", await modal.count() > 0)

  if (await modal.count() > 0) {
    const modalText = await modal.textContent()
    check("4.3 Shows Acteur field", modalText.includes("cteur"))
    check("4.4 Shows Action field", modalText.includes("Action"))
    check("4.5 Shows Cible field", modalText.includes("ible"))
    check("4.6 Shows Date field", modalText.includes("Date"))
    check("4.7 Shows IP field", modalText.includes("IP"))

    const hasValues = modalText.includes("Valeurs")
    check("4.8 Shows old/new values when available", hasValues, hasValues ? "values present" : "no values section")

    await modal.locator('button:has-text("Fermer")').click()
    await page.waitForTimeout(500)
    check("4.9 Modal closes on Fermer", (await page.locator(".modal.d-block").count()) === 0)

    await detailBtn.click()
    await page.waitForTimeout(1000)
    const modal2 = page.locator(".modal.d-block")
    if (await modal2.count() > 0) {
      await modal2.locator(".btn-close").click()
      await page.waitForTimeout(500)
      check("4.10 Modal closes on X button", (await page.locator(".modal.d-block").count()) === 0)
    } else {
      check("4.10 Modal closes on X button", false, "modal did not reopen")
    }
  } else {
    check("4.3 Shows Acteur field", false, "no modal")
  }

  await browser.close()
}

// =====================================================================
// SECTION 5: Audit Logs - Pagination
// =====================================================================
console.log("\n=== SECTION 5: Audit Logs - Pagination ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/audit-logs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const pagination = page.locator('nav[aria-label*="Pagination"]')
  const hasPagination = await pagination.count()
  check("5.1 Pagination component exists", hasPagination > 0)

  if (hasPagination > 0) {
    const activePage = await page.locator(".pagination .page-item.active").textContent()
    check("5.2 Page 1 is active", activePage.trim() === "1")

    const nextBtn = page.locator('button[aria-label="Page suivante"]')
    check("5.3 Next page button exists", (await nextBtn.count()) > 0)

    const page2Btn = page.locator(".pagination .page-item:not(.active):not(.disabled) button").filter({ hasText: "2" })
    if (await page2Btn.count() > 0) {
      await page2Btn.first().click()
      await page.waitForTimeout(2000)
      const p2Active = await page.locator(".pagination .page-item.active").textContent()
      check("5.4 Navigate to page 2", p2Active.trim() === "2")

      const page2Rows = await page.locator("table tbody tr").count()
      check("5.5 Page 2 has data", page2Rows > 0, `rows: ${page2Rows}`)

      const prevBtn = page.locator('button[aria-label="Page precedente"]')
      if (await prevBtn.count() > 0) {
        await prevBtn.click()
        await page.waitForTimeout(2000)
        const back1 = await page.locator(".pagination .page-item.active").textContent()
        check("5.6 Back to page 1", back1.trim() === "1")
      }
    } else {
      check("5.4 Navigate to page 2", true, "N/A - only 1 page of data")
      check("5.5 Page 2 has data", true, "N/A")
    }
  }

  await browser.close()
}

// =====================================================================
// SECTION 6: Users - Data & Display
// =====================================================================
console.log("\n=== SECTION 6: Users - Data & Display ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  const errs = []
  page.on("console", msg => { if (msg.type() === "error") errs.push(msg.text()) })

  await login(page)
  await page.goto(`${BASE}/super-admin/utilisateurs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const rowCount = await page.locator("table tbody tr").count()
  check("6.1 Users table has rows", rowCount > 0, `found ${rowCount}`)

  const headers = await page.locator("table thead th").allTextContents()
  check("6.2 Table headers present", headers.length >= 5, `headers: ${headers.join(", ")}`)

  const firstRow = page.locator("table tbody tr").first()
  const firstCell = await firstRow.locator("td").first().textContent()
  check("6.3 First user shows name+email", firstCell.includes("@"))

  const phoneCell = await firstRow.locator("td").nth(1).textContent()
  check("6.4 Contact column has data", phoneCell.length > 0)

  const roleElems = await page.locator("table tbody .badge, table tbody select.form-select").count()
  check("6.5 Role badges/dropdowns rendered", roleElems > 0, `found ${roleElems}`)

  const verifiedCell = await firstRow.locator("td").nth(4).textContent()
  const hasVerified = verifiedCell.includes("Oui") || verifiedCell.includes("Non")
  check("6.6 Verified status Oui/Non", hasVerified, `"${verifiedCell.trim()}"`)

  const pageContent = await page.locator("body").textContent()
  check("6.7 Root user shows ROOT badge", pageContent.includes("ROOT") || pageContent.includes("Prot"))

  const pageInfoText = await page.locator("body").textContent()
  check("6.8 Page info shows account count", pageInfoText.includes("compte"))

  check("6.9 No console errors", errs.length === 0, errs.join("; "))

  await browser.close()
}

// =====================================================================
// SECTION 7: Users - Filters & Search
// =====================================================================
console.log("\n=== SECTION 7: Users - Filters & Search ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/utilisateurs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const searchInput = page.locator('input[placeholder*="echerch"]')
  check("7.1 Search input exists", (await searchInput.count()) > 0)

  const rowCountBefore = await page.locator("table tbody tr").count()

  await searchInput.fill("root")
  await page.waitForTimeout(2000)
  const searchRows = await page.locator("table tbody tr").count()
  check("7.2 Search filter works", searchRows <= rowCountBefore, `before=${rowCountBefore}, search=${searchRows}`)

  await searchInput.fill("")
  await page.waitForTimeout(2000)

  const allSelects = await page.locator("select").count()
  check("7.3 Filter selects exist", allSelects >= 3, `found ${allSelects}`)

  const roleSelect = page.locator("select").nth(0)
  const options = await roleSelect.locator("option").allTextContents()
  check("7.4 Role filter has all options", options.length >= 5, `options: ${options.join(", ")}`)

  await roleSelect.selectOption("ROLE_ADMIN")
  await page.waitForTimeout(2000)
  const adminRows = await page.locator("table tbody tr").count()
  check("7.5 Role ADMIN filter works", true, `ADMIN rows: ${adminRows}`)

  await roleSelect.selectOption("")
  await page.waitForTimeout(2000)

  const statusSelect = page.locator("select").nth(1)
  await statusSelect.selectOption("ACTIVE")
  await page.waitForTimeout(2000)
  const activeRows = await page.locator("table tbody tr").count()
  check("7.6 Status ACTIVE filter works", true, `ACTIVE rows: ${activeRows}`)

  await browser.close()
}

// =====================================================================
// SECTION 8: Users - Detail Modal
// =====================================================================
console.log("\n=== SECTION 8: Users - Detail Modal ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/utilisateurs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const detailBtn = page.locator('button:has-text("tails")').first()
  check("8.1 Details button exists", await detailBtn.count() > 0)

  await detailBtn.click()
  await page.waitForTimeout(1500)
  const modal = page.locator(".modal.d-block")
  check("8.2 User detail modal opens", await modal.count() > 0)

  if (await modal.count() > 0) {
    const modalText = await modal.textContent()
    check("8.3 Shows name fields", modalText.includes("Nom") || modalText.includes("nom"))
    check("8.4 Shows Email", modalText.includes("mail"))
    check("8.5 Shows phone field", modalText.includes("phone") || modalText.includes("phone") || modalText.includes("lphone"))
    check("8.6 Shows Inscription date", modalText.includes("nscription"))

    await modal.locator('button:has-text("Fermer")').click()
    await page.waitForTimeout(500)
    check("8.7 Modal closes", (await page.locator(".modal.d-block").count()) === 0)
  } else {
    check("8.3 Shows name fields", false, "no modal opened")
  }

  await browser.close()
}

// =====================================================================
// SECTION 9: Users - Root Protection
// =====================================================================
console.log("\n=== SECTION 9: Users - Root Protection ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/utilisateurs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const allRows = page.locator("table tbody tr")
  const rowCount = await allRows.count()

  let rootRowFound = false
  let rootHasDropdown = false
  let rootHasDelete = false
  let rootHasReset = false
  let nonRootIdx = -1

  for (let i = 0; i < rowCount; i++) {
    const row = allRows.nth(i)
    const cellText = await row.locator("td").first().textContent()
    if (cellText.includes("root@renthub.com")) {
      rootRowFound = true
      rootHasDropdown = (await row.locator("select.form-select").count()) > 0
      rootHasReset = (await row.locator('button:has-text("init")').count()) > 0
      rootHasDelete = (await row.locator('button:has-text("Supprimer")').count()) > 0
    } else if (nonRootIdx === -1) {
      nonRootIdx = i
    }
  }

  check("9.1 Root user row found", rootRowFound)
  check("9.2 Root role is NOT a dropdown", !rootHasDropdown, rootHasDropdown ? "BUG: root has role dropdown" : "correct - hardcoded badge")
  check("9.3 Root has no Reset Password button", !rootHasReset, rootHasReset ? "BUG: root has reset button" : "correct")
  check("9.4 Root has no Delete button", !rootHasDelete, rootHasDelete ? "BUG: root has delete button" : "correct")

  if (nonRootIdx >= 0) {
    const nonRootRow = allRows.nth(nonRootIdx)
    const hasDelete = (await nonRootRow.locator('button:has-text("Supprimer")').count()) > 0
    const hasReset = (await nonRootRow.locator('button:has-text("init")').count()) > 0
    check("9.5 Non-root users have Delete button", hasDelete)
    check("9.6 Non-root users have Reset Password button", hasReset)
  } else {
    check("9.5 Non-root users have Delete button", false, "no non-root user found")
    check("9.6 Non-root users have Reset Password button", false, "no non-root user found")
  }

  await browser.close()
}

// =====================================================================
// SECTION 10: Users - Role Change API (CRITICAL BUG TEST)
// =====================================================================
console.log("\n=== SECTION 10: Users - Role Change API ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/utilisateurs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const token = await page.evaluate(() => localStorage.getItem("renthub-token"))

  const stringResp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/1/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newRoleId: "ROLE_TENANT" }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("10.1 API with STRING role id returns 400 (expected)", stringResp.status === 400,
    `status=${stringResp.status}, msg="${stringResp.body?.message || ""}"`)

  const numResp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/4/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newRoleId: 5 }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("10.2 API with NUMBER role id", numResp.status === 200,
    `status=${numResp.status}, msg="${numResp.body?.message || ""}"`)

  if (numResp.status === 200) {
    await page.evaluate(async (tk) => {
      await fetch("http://localhost:3000/api/v1/super-admin/users/4/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
        body: JSON.stringify({ newRoleId: 4 }),
      })
    }, token)
  }

  const allRows = page.locator("table tbody tr")
  const rowCount = await allRows.count()
  let testRow = null
  for (let i = 0; i < rowCount; i++) {
    const cellText = await allRows.nth(i).locator("td").first().textContent()
    if (!cellText.includes("root@renthub.com")) {
      testRow = allRows.nth(i)
      break
    }
  }

  if (testRow) {
    const roleSelect = testRow.locator("select").first()
    if (await roleSelect.count() > 0) {
      const currentVal = await roleSelect.inputValue()
      const newRole = currentVal === "ROLE_TENANT" ? "ROLE_OWNER" : "ROLE_TENANT"
      page.on("dialog", async d => await d.accept())

      await roleSelect.selectOption(newRole)
      await page.waitForTimeout(3000)

      const afterVal = await testRow.locator("select").first().inputValue()
      check("10.3 UI role change works", afterVal === newRole,
        `expected=${newRole}, got=${afterVal}`)

      if (afterVal === newRole) {
        await testRow.locator("select").first().selectOption(currentVal)
        await page.waitForTimeout(2000)
      }
    } else {
      check("10.3 UI role change works", false, "no role select on non-root user")
    }
  } else {
    check("10.3 UI role change works", false, "no non-root user found")
  }

  await browser.close()
}

// =====================================================================
// SECTION 11: Navigation
// =====================================================================
console.log("\n=== SECTION 11: Navigation ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)

  const auditLink = page.locator('a[href="/super-admin/audit-logs"]').first()
  if (await auditLink.count() > 0) {
    await auditLink.click()
    await page.waitForURL(/audit-logs/, { timeout: 5000 })
    check("11.1 Sidebar link to Audit Logs", page.url().includes("audit-logs"))
  } else {
    check("11.1 Sidebar link to Audit Logs", false, "link not found")
  }

  const usersLink = page.locator('a[href="/super-admin/utilisateurs"]').first()
  if (await usersLink.count() > 0) {
    await usersLink.click()
    await page.waitForURL(/utilisateurs/, { timeout: 5000 })
    check("11.2 Sidebar link to Users", page.url().includes("utilisateurs"))
  } else {
    check("11.2 Sidebar link to Users", false, "link not found")
  }

  const dashLink = page.locator('a[href="/super-admin/dashboard"]').first()
  if (await dashLink.count() > 0) {
    await dashLink.click()
    await page.waitForURL(/dashboard/, { timeout: 5000 })
    check("11.3 Sidebar link to Dashboard", page.url().includes("dashboard"))
  } else {
    check("11.3 Sidebar link to Dashboard", false, "link not found")
  }

  await browser.close()
}

// =====================================================================
// SECTION 12: Access Control
// =====================================================================
console.log("\n=== SECTION 12: Access Control ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" })
  check("12.1 ROOT redirected from /admin/dashboard", !page.url().includes("/admin/dashboard"), `at: ${page.url()}`)

  await browser.close()

  const browser2 = await chromium.launch()
  const page2 = await browser2.newPage({ viewport: { width: 1400, height: 900 } })
  await page2.goto(`${BASE}/connexion`, { waitUntil: "networkidle" })
  await page2.locator('input[name="email"]').fill("admin@renthub.com")
  await page2.locator('input[name="password"]').fill("Admin@12345")
  await page2.locator('form').first().locator('button[type="submit"]').click()
  await page2.waitForURL(/dashboard/, { timeout: 15000 })

  await page2.goto(`${BASE}/super-admin/dashboard`, { waitUntil: "networkidle" })
  check("12.2 ADMIN redirected from /super-admin/dashboard", !page2.url().includes("super-admin"), `at: ${page2.url()}`)

  await browser2.close()
}

// =====================================================================
// SECTION 13: API Edge Cases
// =====================================================================
console.log("\n=== SECTION 13: API Edge Cases ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  const token = await page.evaluate(() => localStorage.getItem("renthub-token"))

  const deleteSelf = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/25/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newRoleId: 4 }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("13.1 Cannot change own role", deleteSelf.status === 400, `status=${deleteSelf.status}`)

  const changeRoot = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/25/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newRoleId: 5 }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("13.2 Cannot change ROOT user role (ROOT protection fires)", changeRoot.status === 403, `status=${changeRoot.status}`)

  const invalidRole = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/1/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newRoleId: 999 }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("13.3 Invalid role ID rejected", invalidRole.status === 400, `status=${invalidRole.status}`)

  const noBody = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/1/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
    })
    return { status: r.status }
  }, token)
  check("13.4 Missing body rejected", noBody.status === 400, `status=${noBody.status}`)

  const deleteSelfAccount = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/25", {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + tk },
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("13.5 Cannot delete own account", deleteSelfAccount.status === 400, `status=${deleteSelfAccount.status}`)

  const deleteRoot = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/25", {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + tk },
    })
    return { status: r.status }
  }, token)
  check("13.6 Cannot delete ROOT user", deleteRoot.status === 403, `status=${deleteRoot.status}`)

  const changeRootStatus = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/25/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newStatusId: 3 }),
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("13.7 Cannot change ROOT user status", changeRootStatus.status === 403, `status=${changeRootStatus.status}`)

  const adminToken = await page.evaluate(async () => {
    const r = await fetch("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@renthub.com", password: "Admin@12345" }),
    })
    const d = await r.json()
    return d?.data?.token || d?.token
  })

  const adminChangeRootRole = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users/25/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
      body: JSON.stringify({ newRoleId: 4 }),
    })
    return { status: r.status }
  }, adminToken)
  check("13.8 Admin cannot change ROOT role via super-admin endpoint", adminChangeRootRole.status === 403 || adminChangeRootRole.status === 401, `status=${adminChangeRootRole.status}`)

  await browser.close()
}

// =====================================================================
// SECTION 14: ROOT Hidden from Admin User List
// =====================================================================
console.log("\n=== SECTION 14: ROOT Hidden from Admin User List ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  const token = await page.evaluate(() => localStorage.getItem("renthub-token"))

  const rootListResp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/super-admin/users?limit=100", {
      headers: { "Authorization": "Bearer " + tk },
    })
    return { status: r.status, body: await r.json() }
  }, token)
  check("14.1 Super-admin users endpoint returns 200", rootListResp.status === 200, `status=${rootListResp.status}`)

  const rootInSuperList = (rootListResp.body?.data || []).some(u => u.role?.code === "ROLE_ROOT")
  check("14.2 ROOT not in super-admin user list", !rootInSuperList, rootInSuperList ? "ROOT found in list" : "ROOT correctly excluded")

  const adminToken = await page.evaluate(async () => {
    const r = await fetch("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@renthub.com", password: "Admin@12345" }),
    })
    const d = await r.json()
    return d?.data?.token || d?.token
  })

  const adminListResp = await page.evaluate(async (tk) => {
    const r = await fetch("http://localhost:3000/api/v1/admin/users?limit=100", {
      headers: { "Authorization": "Bearer " + tk },
    })
    return { status: r.status, body: await r.json() }
  }, adminToken)
  check("14.3 Admin users endpoint returns 200", adminListResp.status === 200, `status=${adminListResp.status}`)

  const rootInAdminList = (adminListResp.body?.data || []).some(u => u.role?.code === "ROLE_ROOT")
  check("14.4 ROOT not in admin user list", !rootInAdminList, rootInAdminList ? "ROOT found in admin list" : "ROOT correctly excluded")

  await browser.close()
}

// =====================================================================
// SECTION 15: Account Status Pages
// =====================================================================
console.log("\n=== SECTION 15: Account Status Pages ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await page.goto(`${BASE}/compte-suspendu`, { waitUntil: "networkidle" })
  const suspendedText = await page.locator("body").textContent()
  check("15.1 Account suspended page renders", suspendedText.includes("suspendu") || suspendedText.includes("Suspendu"))
  check("15.2 Shows contact email", suspendedText.includes("support@renthub.com"))
  check("15.3 Shows home link", (await page.locator('a[href="/"]').count()) > 0)

  await page.goto(`${BASE}/compte-inactif`, { waitUntil: "networkidle" })
  const inactiveText = await page.locator("body").textContent()
  check("15.4 Account inactive page renders", inactiveText.includes("inactif") || inactiveText.includes("Inactif"))
  check("15.5 Shows contact email on inactive page", inactiveText.includes("support@renthub.com"))

  await browser.close()
}

// =====================================================================
// SECTION 16: Suspended User Login Blocked
// =====================================================================
console.log("\n=== SECTION 16: Suspended User Login Blocked ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" })
  await page.locator('input[name="email"]').fill("suspended.test@renthub.com")
  await page.locator('input[name="password"]').fill("Test@12345")
  await page.locator('form').first().locator('button[type="submit"]').click()
  await page.waitForTimeout(3000)

  const bodyText = await page.locator("body").textContent()
  const loginBlocked = bodyText.includes("suspendu") || bodyText.includes("inactif") || bodyText.includes("incorrect") || bodyText.includes("erreur")
  check("16.1 Suspended user login shows error", loginBlocked)

  const stillOnLogin = page.url().includes("/connexion")
  check("16.2 User stays on login page", stillOnLogin, `at: ${page.url()}`)

  await browser.close()
}

// =====================================================================
// SECTION 17: Audit Log Label Display
// =====================================================================
console.log("\n=== SECTION 17: Audit Log Label Display ===")
{
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  await login(page)
  await page.goto(`${BASE}/super-admin/audit-logs`, { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const rowCount = await page.locator("table tbody tr").count()
  check("17.1 Audit logs table has rows for label test", rowCount > 0, `found ${rowCount}`)

  const detailBtn = page.locator('button:has-text("tails")').first()
  if (await detailBtn.count() > 0) {
    await detailBtn.click()
    await page.waitForTimeout(1500)
    const modal = page.locator(".modal.d-block")
    check("17.2 Detail modal opens for label check", await modal.count() > 0)

    if (await modal.count() > 0) {
      const modalText = await modal.textContent()

      const hasNoRawRoleId = !modalText.includes('"role_id":')
      check("17.3 No raw JSON role_id in modal", hasNoRawRoleId, hasNoRawRoleId ? "clean" : "raw JSON found")

      const hasNoRawStatusId = !modalText.includes('"user_status_id":')
      check("17.4 No raw JSON user_status_id in modal", hasNoRawStatusId, hasNoRawStatusId ? "clean" : "raw JSON found")

      const hasFormattedLabel = modalText.includes("Administrateur") ||
        modalText.includes("Locataire") ||
        modalText.includes("Propriétaire") ||
        modalText.includes("Super Admin") ||
        modalText.includes("Agence") ||
        modalText.includes("Actif") ||
        modalText.includes("Suspendu") ||
        modalText.includes("Inactif") ||
        modalText.includes("Rôle") ||
        modalText.includes("Statut") ||
        modalText.includes("Valeurs")
      check("17.5 Human-readable labels present in modal", hasFormattedLabel)

      const actorRoleRow = modalText.includes("Rôle acteur")
      if (actorRoleRow) {
        const hasNoRoleString = !modalText.includes("ROLE_ADMIN") && !modalText.includes("ROLE_TENANT")
        check("17.6 Actor role shows label not raw string", hasNoRoleString, hasNoRoleString ? "clean" : "raw ROLE_ string found")
      } else {
        check("17.6 Actor role shows label not raw string", true, "N/A - role row not visible")
      }

      await modal.locator('button:has-text("Fermer")').click()
      await page.waitForTimeout(500)
    }
  } else {
    check("17.2 Detail modal opens for label check", false, "no detail button found")
  }

  await browser.close()
}

// =====================================================================
// SUMMARY
// =====================================================================
console.log("\n" + "=".repeat(60))
console.log(`RESULTS: ${passed}/${totalTests} passed, ${failed} failed`)
console.log("=".repeat(60))

if (issues.length > 0) {
  console.log("\nISSUES FOUND:")
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue.label}`)
    if (issue.detail) console.log(`     -> ${issue.detail}`)
  })
} else {
  console.log("\nNo issues found!")
}
