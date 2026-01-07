from playwright.sync_api import sync_playwright, expect
import time

def verify_inquiries():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login First
        page.goto('http://localhost:5173/login.html')
        page.fill('#username', 'admin')
        page.fill('#password', 'password123')
        page.click('button[type="submit"]')

        # Wait for navigation to dashboard
        page.wait_for_url('**/dashboard.html')

        # Click on All Inquiries
        page.click('button[data-view="inquiries"]')

        # Check if inquiries view is active
        expect(page.locator('#view-inquiries')).to_be_visible()

        # Wait a bit for "loading" to potentially fail or finish
        time.sleep(1)

        # Take screenshot of the Inquiries View
        page.screenshot(path='verification/inquiries_view.png')

        print("Inquiries view verified")
        browser.close()

if __name__ == "__main__":
    verify_inquiries()
