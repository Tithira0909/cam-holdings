from playwright.sync_api import sync_playwright
import time
import sys

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate desktop size
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        try:
            # Adjust URL to local dev server port (5174)
            page.goto("http://localhost:5174/index.html")

            # Wait for page load
            page.wait_for_load_state("networkidle")

            # Scroll to reviews section
            section = page.locator("#reviews")
            # Ensure it exists
            if section.count() == 0:
                print("Reviews section not found!")
                sys.exit(1)

            section.scroll_into_view_if_needed()

            # Wait for animation (GSAP reveal)
            time.sleep(2)

            # Verify Text Content
            kicker = page.locator("#reviews .kicker").text_content()
            heading = page.locator("#reviews .h2").text_content()

            print(f"Kicker Text: '{kicker.strip()}'")
            print(f"Heading Text: '{heading.strip()}'")

            if "Client Testimonials" not in kicker:
                print("FAIL: Kicker text mismatch.")
                sys.exit(1)

            if "Trusted Reviews" not in heading:
                print("FAIL: Heading text mismatch.")
                sys.exit(1)

            # Take screenshot of the section
            box = section.bounding_box()
            if box:
                page.screenshot(path="verification/reviews_final_desktop.png", clip=box)
            else:
                page.screenshot(path="verification/reviews_final_desktop.png")

            print("Verification Passed.")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
