import { expect, test, type Page } from '@playwright/test'

/**
 * In the installed iOS PWA, WebKit can leave `dvh` shorter than the screen
 * after the keyboard closes (exercise notes, workout note) or after the app
 * comes back from the background. Anything sized with dvh then stops short and
 * the page background shows below it, while `position: fixed` elements stay
 * put. Desktop browsers can't reproduce that, so we inject it: every `Ndvh`
 * resolves STALE_PX × N/100 short, as on the phone.
 */
const STALE_PX = 60

async function simulateStaleDvh(page: Page) {
  await page.addInitScript((stalePx) => {
    // Values already shortened, so re-reading a patched style doesn't shorten it twice
    const shortened = new WeakMap<CSSStyleDeclaration, Map<string, string>>()
    const patchStyle = (style: CSSStyleDeclaration) => {
      for (const prop of Array.from(style)) {
        const value = style.getPropertyValue(prop)
        const done = shortened.get(style) ?? new Map<string, string>()
        if (!value.includes('dvh') || done.get(prop) === value) continue
        const short = value.replace(/(\d+(?:\.\d+)?)dvh/g, (_, n) => `calc(${n}dvh - ${(stalePx * Number(n)) / 100}px)`)
        style.setProperty(prop, short, style.getPropertyPriority(prop))
        done.set(prop, style.getPropertyValue(prop))
        shortened.set(style, done)
      }
    }
    const patchRules = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) patchStyle(rule.style)
        if ('cssRules' in rule) patchRules((rule as CSSGroupingRule).cssRules)
      }
    }
    const patchSheets = () => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          patchRules(sheet.cssRules)
        } catch {
          // Cross-origin sheet (Google Fonts): unreadable, and has no dvh anyway
        }
      }
    }
    const patchInline = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('[style*="dvh"]').forEach((el) => patchStyle(el.style))
    }

    new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.target instanceof HTMLElement) patchStyle(m.target.style)
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            patchStyle(node.style)
            patchInline(node)
          }
          if (node instanceof HTMLLinkElement || node instanceof HTMLStyleElement) {
            node.addEventListener('load', patchSheets)
            patchSheets()
          }
        })
      }
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] })
    document.addEventListener('DOMContentLoaded', patchSheets)
    window.addEventListener('load', patchSheets)
  }, STALE_PX)
}

/** What sits on the bottom edge of the screen: the workout UI, or something behind it */
function bottomEdge(page: Page) {
  return page.evaluate(() => {
    const y = window.innerHeight - 1
    return [0.1, 0.5, 0.9].map((fx) => {
      const el = document.elementFromPoint(window.innerWidth * fx, y)
      if (el?.closest('[data-testid="workout-screen"]')) return 'workout'
      return el ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}` : 'nothing'
    })
  })
}

test('the workout screen reaches the bottom edge in every phase, even with stale dvh', async ({ page }) => {
  test.setTimeout(90_000)
  await simulateStaleDvh(page)
  await page.clock.install({ time: new Date('2026-11-24T10:00:00+01:00') })
  // Antagonisti e spalle: timed holds and rep sets, as in the bug report
  await page.goto('#/workout/8/casa-a/active')
  await expect(page.getByTestId('workout-screen')).toBeVisible()

  // The injection must be live, or the test proves nothing
  const rootMinHeight = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('root')!).minHeight))
  expect(rootMinHeight).toBe(page.viewportSize()!.height - STALE_PX)

  const checked = new Set<string>()
  const expectFilled = async (phase: string) => {
    checked.add(phase)
    expect(await bottomEdge(page), `bottom edge during ${phase}`).toEqual(['workout', 'workout', 'workout'])
  }

  for (let step = 0; step < 500; step++) {
    if (await page.getByText('Allenamento Completato!').count()) {
      await expectFilled('complete')
      // Writing the workout note is what raises the keyboard on the phone
      await page.getByPlaceholder(/Note sull'allenamento/).fill('Spalle ok')
      await page.getByPlaceholder(/Note sull'allenamento/).blur()
      await expectFilled('complete + note')
      break
    }
    const start = page.getByRole('button', { name: /^Inizia/ })
    if (await start.count()) {
      await expectFilled('preview')
      await start.first().click()
    } else if (await page.getByRole('button', { name: 'Serie fatta' }).count()) {
      await expectFilled('reps')
      await page.getByRole('button', { name: 'Serie fatta' }).click()
    } else if (await page.getByLabel('Passa al prossimo esercizio').count()) {
      await expectFilled('exercise done')
      await page.getByLabel('Passa al prossimo esercizio').click()
    } else if (await page.getByLabel('Salta timer').count()) {
      await expectFilled('timer')
      await page.getByLabel('Salta timer').click()
    } else {
      await page.clock.runFor(1_000) // transition between phases
      continue
    }
    await page.clock.runFor(500)
  }

  expect([...checked].sort()).toEqual(
    ['complete', 'complete + note', 'exercise done', 'preview', 'reps', 'timer'].sort(),
  )
})
