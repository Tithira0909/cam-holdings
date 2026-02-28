
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

        await page.goto(file_url)

        # Verify #leave-review is GONE
        leave_review = page.locator("#leave-review")
        count = await leave_review.count()
        if count == 0:
            print("SUCCESS: #leave-review section is NOT present.")
        else:
            print("FAILURE: #leave-review section IS present.")

        # Verify "Read More Reviews" button is GONE or replaced
        # It was <a href="#leave-review" class="btn ghost">Read More Reviews</a>
        # Let's search for the text "Read More Reviews"
        read_more = page.get_by_text("Read More Reviews")
        count_btn = await read_more.count()
        if count_btn == 0:
             print("SUCCESS: 'Read More Reviews' button is NOT present.")
        else:
             print("FAILURE: 'Read More Reviews' button IS present.")

        # Screenshot to ensure layout is clean (no big empty gap)
        # We scroll to #reviews section
        await page.locator("#reviews").scroll_into_view_if_needed()
        await page.wait_for_timeout(1000) # wait for any reveal
        await page.screenshot(path="verification/reviews_section_after_removal.png", full_page=False)
        print("Screenshot saved.")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(run())
