import time
from playwright.sync_api import sync_playwright

def verify_re_section():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        try:
            print("Navigating to home...")
            page.goto("http://localhost:5173", timeout=60000)
            time.sleep(3)

            print("Scrolling to trigger RE section...")
            # Simulate scroll behavior for pinned section
            # Hero takes ~280vh.
            # We need to scroll enough to pass Hero and enter RE phase.

            # Scroll in steps to allow scrub
            for i in range(10):
                page.mouse.wheel(0, 300)
                time.sleep(0.5)

            # Additional scroll to reveal cards
            page.mouse.wheel(0, 1000)
            time.sleep(2)

            page.screenshot(path="verification/re_section.png")
            print("Screenshot saved to verification/re_section.png")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_re_section()
