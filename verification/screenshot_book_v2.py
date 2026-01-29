
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

        # Wait for loader to disappear
        print("Waiting for loader to disappear...")
        try:
            # Wait for #app to have opacity 1 or similar, or just wait long enough
            # The loader script adds .hide to #lux-loader
            await page.wait_for_selector("#lux-loader.hide", state="attached", timeout=10000)
            print("Loader hidden.")
            await page.wait_for_timeout(2000) # Wait for fade in
        except Exception as e:
            print(f"Timeout waiting for loader: {e}")

        # Scroll to #book section
        book_section = page.locator("#book")
        if await book_section.count() > 0:
            await book_section.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000) # Wait for animations
            await page.screenshot(path="verification/book_section_v2.png")
            print("Screenshot saved to verification/book_section_v2.png")
        else:
            print("#book section not found!")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(run())
