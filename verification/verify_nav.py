
import os
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()

        # Load the page
        file_url = "http://localhost:8000/index.html"
        try:
            await page.goto(file_url)
        except Exception as e:
            print(f"Error loading page: {e}")
            return

        # Wait for loader
        try:
            await page.wait_for_selector("#lux-loader.hide", state="attached", timeout=10000)
        except Exception as e:
            print("Loader timeout, continuing anyway")

        # Find Hero CTA "Request a Proposal"
        hero_cta = page.locator(".hero-actions .btn.primary").first

        # Check href
        href = await hero_cta.get_attribute("href")
        print(f"Hero CTA href: {href}")
        if href != "#book":
            print("FAILURE: Hero CTA does not point to #book")
        else:
            print("SUCCESS: Hero CTA points to #book")

        # Click it and check scroll position
        # Note: Smooth scroll might take time
        await hero_cta.click()
        await page.wait_for_timeout(2000)

        # Check if #book is in viewport
        book_section = page.locator("#book")
        is_visible = await book_section.is_visible()
        print(f"Is #book visible in viewport: {is_visible}")

        # Also check bounding box relative to viewport
        box = await book_section.bounding_box()
        if box:
            print(f"#book y-position: {box['y']}")
            if box['y'] < 900 and box['y'] + box['height'] > 0:
                print("SUCCESS: #book is in viewport")
            else:
                print("FAILURE: #book is NOT in viewport")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(run())
