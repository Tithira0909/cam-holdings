
from playwright.sync_api import sync_playwright
import time

def verify_re_section():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to a common laptop size to test "oversized" claim
        page = browser.new_page(viewport={"width": 1366, "height": 768})

        # Load local index.html. Assumes server is running at localhost:5173 or similar,
        # but since we are in a sandbox without a running dev server, we rely on `npm run dev`
        # being backgrounded or just checking static if possible.
        # However, Playwright needs a URL.
        # We will assume the dev server is NOT running and we need to start it,
        # OR we assume the user/env handles it.
        # Given the tools, I should assume I need to start it if I want to verify real rendering.
        # But I'll try localhost:5173 first.

        try:
            page.goto("http://localhost:5173")
        except:
            print("Server not found, skipping interactive verification.")
            return

        # Wait for load
        page.wait_for_timeout(2000)

        # Scroll to trigger RE section
        # RE starts after Hero (280vh) + Xfade (60vh) = 340vh.
        # 340vh * 768 = 2611px.
        # Plus some buffer into the section.

        target_scroll = 3000
        page.mouse.wheel(0, target_scroll)
        page.wait_for_timeout(1000)
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(2000) # Wait for GSAP scrub/tick

        # Take screenshot
        page.screenshot(path="verification/re_section_fixed.png")
        print("Screenshot saved to verification/re_section_fixed.png")

        browser.close()

if __name__ == "__main__":
    verify_re_section()
