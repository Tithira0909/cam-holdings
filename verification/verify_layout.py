from playwright.sync_api import sync_playwright, expect
import time

def verify_layout():
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

        # Verify Sidebar Existence
        expect(page.locator('.sidebar')).to_be_visible()

        # Verify collapsible menu item (Users)
        users_menu = page.locator('.menu-item', has_text='Users')
        expect(users_menu).to_be_visible()

        # Click to expand
        users_menu.click()

        # Check sublink visibility
        expect(users_menu.locator('.submenu')).to_be_visible()

        # Screenshot
        page.screenshot(path='verification/layout_verified.png')

        print("Layout verification complete")
        browser.close()

if __name__ == "__main__":
    verify_layout()
