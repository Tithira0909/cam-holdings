from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock API response
    # Note: image_url is relative, helper in JS prepends /uploads/ if needed.
    # Our helper: if path starts with http return path, else replace /^uploads\// then prepend /uploads/
    # If we return 'villa.jpg', cleanPath = 'villa.jpg', result '/uploads/villa.jpg'.
    # We should ensure the placeholder image exists or mock the image request too if we want no broken image icon.
    # But since we check for existence of article, it's fine.

    page.route("**/api/services?category=real_estate", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id":1,"name":"Luxury Villa Project","description":"A beautiful villa in Colombo 7. High end finishes.","estimated_cost":"$1.2M - $1.5M","image_url":"uploads/villa.jpg"}]'
    ))

    page.goto("http://localhost:8000/services/real-estate.html")

    # Wait for the card to be rendered
    try:
        page.wait_for_selector("#listings-grid article", timeout=5000)
    except Exception as e:
        print("Timeout waiting for articles. Page content:")
        print(page.content())
        raise e

    page.screenshot(path="verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
