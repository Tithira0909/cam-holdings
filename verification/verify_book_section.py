from playwright.sync_api import sync_playwright

def verify(page):
    print("Navigating to Homepage...")
    page.goto("http://localhost:5173/")
    page.wait_for_load_state("networkidle")

    print("Scrolling to #book section...")
    book_section = page.locator("#book")
    book_section.scroll_into_view_if_needed()

    # Wait a bit for layout
    page.wait_for_timeout(1000)

    print("Taking Screenshot of #book section...")
    book_section.screenshot(path="verification/book_section.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800}) # Desktop
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
