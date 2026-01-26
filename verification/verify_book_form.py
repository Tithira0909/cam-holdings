from playwright.sync_api import sync_playwright, expect
import os

def test_book_form():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # Navigate to home
        page.goto("http://localhost:5173/")

        # Wait for book section
        page.wait_for_selector("#book")

        # Scroll to view
        page.locator("#book").scroll_into_view_if_needed()

        # Scrub animation
        page.mouse.wheel(0, 600)
        page.wait_for_timeout(1000)

        # Verify split layout elements
        expect(page.locator(".book-text .h2")).to_be_visible()
        expect(page.locator(".book-form-card")).to_be_visible()

        # Fill form
        page.fill("#bf-name", "John Doe")
        page.fill("#bf-email", "john@example.com")
        page.fill("#bf-phone", "0771234567")
        page.select_option("#bf-service", "Real Estate")
        page.fill("#bf-message", "Looking for a luxury apartment.")

        # Submit
        page.click("button[type='submit']")

        # Verify success message
        success = page.locator("#bookSuccess")
        expect(success).to_be_visible()
        expect(success).to_contain_text("Request submitted successfully")

        # Take screenshot
        os.makedirs("verification", exist_ok=True)
        path = "verification/book_form_success.png"
        page.screenshot(path=path, full_page=False)
        print(f"Screenshot saved to {path}")

        browser.close()

if __name__ == "__main__":
    test_book_form()
