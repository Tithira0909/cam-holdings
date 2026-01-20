
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Load Home Page
        print("Loading Home Page...")
        page.goto("http://localhost:5173/")
        expect(page.get_by_role("heading", name="Build premium spaces with")).to_be_visible(timeout=10000)

        # 2. Check loading="lazy" on #megaPreviewImg
        print("Checking loading='lazy'...")
        mega_img = page.locator("#megaPreviewImg")
        expect(mega_img).to_have_attribute("loading", "lazy")

        # 3. Check loading="lazy" on #itPreviewImg
        it_img = page.locator("#itPreviewImg")
        expect(it_img).to_have_attribute("loading", "lazy")

        # 4. Scroll to ensure no errors
        print("Scrolling...")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1000)

        # 5. Screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/scroll_perf.png")
        print("Done.")
        browser.close()

if __name__ == "__main__":
    run()
