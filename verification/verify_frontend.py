
from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Home Page
        print("Navigating to Home Page...")
        page.goto("http://localhost:5175/index.html")
        page.wait_for_load_state("networkidle")
        # Scroll to Exclusive Properties
        try:
            section = page.locator("#re-preview")
            section.scroll_into_view_if_needed()
            time.sleep(1) # Allow animations/fetch
            page.screenshot(path="verification/home_page.png")
            print("Home Page screenshot saved.")
        except Exception as e:
            print(f"Error on Home Page: {e}")

        # 2. Real Estate Page
        print("Navigating to Real Estate Page...")
        page.goto("http://localhost:5175/real-estate.html")
        page.wait_for_load_state("networkidle")
        try:
            section = page.locator("#properties")
            section.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path="verification/real_estate_page.png")
            print("Real Estate Page screenshot saved.")
        except Exception as e:
            print(f"Error on Real Estate Page: {e}")

        # 3. Property Page (with a fake slug/id to trigger error or dummy if I didn't seed db)
        # Since DB is likely empty or connection failed (I can't guarantee DB connection in this env),
        # I expect "No properties" on home/real-estate, and "Not Found" on property page.
        # This confirms the frontend logic is working (handling empty/error states).
        print("Navigating to Property Page...")
        page.goto("http://localhost:5175/property.html?id=999")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path="verification/property_page.png")
        print("Property Page screenshot saved.")

        # 4. Admin Dashboard (Inject Token)
        print("Navigating to Admin Dashboard...")
        # Inject token
        page.add_init_script("""
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('first_name', 'Test');
            localStorage.setItem('last_name', 'Admin');
        """)
        page.goto("http://localhost:5175/dashboard.html")
        page.wait_for_load_state("networkidle")

        # Click Real Estate Sidebar Link
        try:
            page.click('[data-view="real-estate"]')
            time.sleep(1)
            page.screenshot(path="verification/dashboard_page.png")
            print("Dashboard Page screenshot saved.")
        except Exception as e:
            print(f"Error on Dashboard: {e}")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
