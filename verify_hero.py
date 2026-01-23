import sys
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001/index.html", timeout=5000)
        except:
            print("Server error")
            return

        # Check Hero visibility and structure
        hero = page.locator(".hero").first

        # Check computed styles
        padding_top = hero.evaluate("el => getComputedStyle(el).paddingTop")
        print(f"Hero Padding Top: {padding_top}")

        # Should be roughly 122px (var(--navH))
        if "122px" in padding_top:
             print("SUCCESS: Hero padding accounts for Nav.")
        else:
             print("WARNING: Hero padding might be off.")

        # Check visibility
        is_visible = hero.is_visible()
        if is_visible:
            print("SUCCESS: Hero is visible.")
        else:
            print("FAILURE: Hero is hidden.")

        # Check if background image is loaded (via style)
        bg = page.locator(".hero-bg").first
        bg_image = bg.evaluate("el => getComputedStyle(el).backgroundImage")
        print(f"Hero BG: {bg_image}")

        if "url" in bg_image:
             print("SUCCESS: Hero background image set.")
        else:
             print("FAILURE: Hero background missing.")

        browser.close()

if __name__ == "__main__":
    verify()
