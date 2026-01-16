from playwright.sync_api import sync_playwright
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Home Page (Lightness & Layout)
        print("Navigating to Home...")
        page.goto("http://localhost:5175/")
        time.sleep(2) # Wait for GSAP/Loading
        page.screenshot(path="verification/home_page.png", full_page=True)
        print("Captured home_page.png")

        # 2. Verify Real Estate / Property Page
        # Since backend is down, this will likely show empty/loading, but we check structure.
        print("Navigating to Property Page...")
        page.goto("http://localhost:5175/property.html?id=1")
        time.sleep(1)
        page.screenshot(path="verification/property_page.png", full_page=True)
        print("Captured property_page.png")

        # 3. Verify Dashboard
        print("Navigating to Dashboard...")
        page.goto("http://localhost:5175/dashboard.html")
        time.sleep(1)
        # Click the Real Estate tab if possible, or just screenshot the initial view
        try:
            page.click('a[href="#view-real-estate"]') # Assuming this selector exists from dashboard.js logic
            time.sleep(0.5)
        except:
            print("Could not click Real Estate tab (might need login or structure differs)")

        page.screenshot(path="verification/dashboard_page.png", full_page=True)
        print("Captured dashboard_page.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
