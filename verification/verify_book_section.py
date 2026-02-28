from playwright.sync_api import sync_playwright, expect
import os

def test_book_section():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # Navigate to home
        page.goto("http://localhost:5173/")

        # Wait for loader
        page.wait_for_selector("#book")

        # Locate section
        book_section = page.locator("#book")

        # Scroll to it
        book_section.scroll_into_view_if_needed()

        # Get bounding box to know where we are
        box = book_section.bounding_box()

        # Scroll down to scrub the animation
        # We need to scroll by the pinned amount.
        # endVh is 130, so roughly 1.3 * viewport height.
        # Let's scroll 500px down.
        page.mouse.wheel(0, 600)
        page.wait_for_timeout(1000)

        # Verify visibility again
        expect(book_section.locator(".h2")).to_be_visible()

        # Take screenshot
        os.makedirs("verification", exist_ok=True)
        path = "verification/book_section_visible.png"
        page.screenshot(path=path, full_page=False)
        print(f"Screenshot saved to {path}")

        browser.close()

if __name__ == "__main__":
    test_book_section()
