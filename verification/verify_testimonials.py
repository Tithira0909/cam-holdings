from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate desktop size
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        # Adjust URL to local dev server port (5174)
        page.goto("http://localhost:5174/index.html")

        # Wait for page load
        page.wait_for_load_state("networkidle")

        # Scroll to testimonials section
        section = page.locator("#testimonials")
        # Ensure it exists
        if section.count() == 0:
            print("Testimonials section not found!")
            browser.close()
            return

        section.scroll_into_view_if_needed()

        # Wait for animation (GSAP reveal)
        time.sleep(2)

        # Take screenshot of the section
        # Get bounding box
        box = section.bounding_box()
        if box:
            page.screenshot(path="verification/testimonials_desktop.png", clip=box)
        else:
            page.screenshot(path="verification/testimonials_desktop_full.png")

        # Emulate Mobile
        page_mobile = browser.new_page(viewport={"width": 375, "height": 812})
        page_mobile.goto("http://localhost:5174/index.html")
        page_mobile.wait_for_load_state("networkidle")

        section_m = page_mobile.locator("#testimonials")
        section_m.scroll_into_view_if_needed()
        time.sleep(2)

        box_m = section_m.bounding_box()
        if box_m:
            page_mobile.screenshot(path="verification/testimonials_mobile.png", clip=box_m)

        browser.close()

if __name__ == "__main__":
    run()
