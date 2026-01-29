
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

        # Check for #book elements
        book_sections = page.locator("#book")
        count_book = await book_sections.count()
        print(f"Number of elements with id='book': {count_book}")

        # Check for "Book a Free Consultation" text
        consultation_text = page.get_by_text("Book a Free Consultation")
        count_text = await consultation_text.count()
        print(f"Number of elements with text 'Book a Free Consultation': {count_text}")

        # Check for forms
        forms = page.locator("form")
        count_forms = await forms.count()
        print(f"Number of forms: {count_forms}")

        # Check for Book an Appointment buttons
        buttons = page.get_by_role("link", name="Book an Appointment")
        count_buttons = await buttons.count()
        print(f"Number of 'Book an Appointment' buttons: {count_buttons}")

        if count_book > 1:
            print("DUPLICATE FOUND: id='book'")

        if count_text > 1:
            print("DUPLICATE FOUND: text 'Book a Free Consultation'")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(run())
