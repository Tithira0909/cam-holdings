
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        print("Navigating to home...")
        page.goto("http://localhost:5173")

        # Wait for loader to disappear
        print("Waiting for loader to disappear...")
        try:
            page.wait_for_selector("#lux-loader", state="detached", timeout=10000)
        except:
            print("Loader didn't detach, trying to hide it manually just in case...")
            page.evaluate("document.getElementById('lux-loader').style.display = 'none'")

        # Scroll to book section
        print("Scrolling to #book section...")
        book_section = page.locator("#book")
        book_section.scroll_into_view_if_needed()

        # Wait a bit for layout to settle
        time.sleep(2)

        # Take screenshot of the section
        print("Taking screenshot...")
        book_section.screenshot(path="verification/book_section_v2.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
