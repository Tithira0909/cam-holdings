from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login
    page.goto("http://localhost:5173/login.html")
    page.fill("#username", "admin")
    page.fill("#password", "password123")
    page.click("button[type='submit']")

    # Wait for dashboard
    page.wait_for_url("**/dashboard.html")
    print("Logged in")

    # Click Services Type sidebar
    page.click("button[data-view='service-types']")
    expect(page.locator("#view-service-types")).to_be_visible()
    print("Navigated to Service Types")

    # Click Add New Service Type
    page.click("#openServiceTypeModalBtn")
    expect(page.locator("#serviceTypeModal")).to_have_class(pk="modal-overlay active") # Check if active class is added

    # Fill Form
    page.fill("#st_name", "Test Service")
    page.fill("#st_slug", "test-service")
    page.fill("#st_desc", "This is a test description.")

    # Upload files
    page.set_input_files("#st_thumbnail", "verification/dummy_image.png")
    page.set_input_files("#st_banner", "verification/dummy_image.png")

    # Submit
    page.click("#serviceTypeForm button[type='submit']")

    # Handle alert
    # Playwright handles alerts automatically by dismissing, but we want to know if it succeeded.
    # Actually, we should wait for the modal to close or the list to update.
    # Our code alerts then closes.

    # Wait for list update
    page.wait_for_selector(".service-type-item", timeout=5000)

    expect(page.locator(".service-type-item")).to_contain_text("Test Service")
    print("Service Type Created")

    # Screenshot
    page.screenshot(path="verification/service_types_verified.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
