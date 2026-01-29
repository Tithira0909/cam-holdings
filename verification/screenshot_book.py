
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
        print(f"Loading {file_url}")

        try:
            await page.goto(file_url)
        except Exception as e:
            print(f"Error loading page: {e}")
            return

        # Scroll to #book section
        book_section = page.locator("#book")
        if await book_section.count() > 0:
            await book_section.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000) # Wait for animations
            await page.screenshot(path="verification/book_section.png")
            print("Screenshot saved to verification/book_section.png")
        else:
            print("#book section not found!")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(run())
