
import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        base_url = "http://localhost:5173"

        # Mock Data
        mock_item = {
            "id": 1,
            "name": "Luxury Villa",
            "estimated_cost": "$2,000,000",
            "description": "A beautiful villa.",
            "main_image": "uploads/properties/re-1.jpg",
            "sub_images": "[]",
            "status": "Active",
            "created_at": "2024-01-01T10:00:00Z"
        }

        async def handle_list(route):
            await route.fulfill(status=200, content_type="application/json", body=json.dumps([mock_item]))

        async def handle_detail(route):
            print(f"Intercepted detail request: {route.request.url}")
            await route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_item))

        async def handle_empty(route):
             await route.fulfill(status=200, content_type="application/json", body="[]")

        # Intercepts
        await page.route("**/api/public/real-estate-properties", handle_list)
        await page.route("**/api/public/design-architecture-properties", handle_empty)
        await page.route("**/api/public/construction-properties", handle_empty)
        await page.route("**/api/public/interiors-properties", handle_empty)
        # Detail intercept
        await page.route("**/api/public/real-estate-properties/1", handle_detail)

        # 1. Real Estate
        print("--- Real Estate Page ---")
        await page.goto(f"{base_url}/real-estate.html")
        try:
            await page.wait_for_selector('.service-card-item', timeout=5000)
            print("Loaded.")
        except:
            print("Timeout.")
        await page.screenshot(path="verification/real_estate_page.png", full_page=True)

        # 2. Services
        print("--- Services Page ---")
        await page.goto(f"{base_url}/services.html")
        try:
            await page.wait_for_selector('.service-card-item', timeout=5000)
            print("Loaded.")
        except:
            print("Timeout.")
        await page.screenshot(path="verification/services_page.png", full_page=True)

        # 3. Details (Direct Navigation)
        print("--- Details Page ---")
        # Ensure the section matches what property-details.js expects
        target_url = f"{base_url}/property.html?section=public/real-estate-properties&id=1"
        print(f"Navigating to {target_url}")
        await page.goto(target_url)

        try:
            await page.wait_for_selector('.prop-title', timeout=5000)
            title = await page.inner_text('.prop-title')
            print(f"Title: {title}")
        except Exception as e:
            print(f"Timeout waiting for title. {e}")

        await page.screenshot(path="verification/details_page.png", full_page=True)
        print("Captured verification/details_page.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
