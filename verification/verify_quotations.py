from playwright.sync_api import sync_playwright, expect
import time

def verify_quotations():
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

        # Click on Quotations
        page.click('button[data-view="quotations"]')

        # Check if view is active
        expect(page.locator('#view-quotations')).to_be_visible()

        # Wait for loading
        time.sleep(1)

        # Screenshot
        page.screenshot(path='verification/quotations_view.png')

        print("Quotations view verified")
        browser.close()

if __name__ == "__main__":
    verify_quotations()
