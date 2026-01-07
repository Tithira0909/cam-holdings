from playwright.sync_api import sync_playwright, expect
import time

def verify_dashboard():
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

        # Check if dashboard view is active
        # Wait for dashboard view to be visible
        expect(page.locator('#view-dashboard')).to_be_visible()

        # Check for Stats
        expect(page.locator('#count-registered-users')).not_to_have_text('-', timeout=10000)

        # Take screenshot
        page.screenshot(path='verification/dashboard_verified.png')

        print("Dashboard verified successfully")
        browser.close()

if __name__ == "__main__":
    verify_dashboard()
