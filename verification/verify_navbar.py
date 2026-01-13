from playwright.sync_api import sync_playwright, expect

def verify_navbar(page):
    # Test index.html (standard navbar)
    print("Navigating to index.html...")
    page.goto("http://localhost:3000/index.html")

    # Wait for the brand logo to be visible
    brand_logo = page.locator(".brand-mark")
    expect(brand_logo).to_be_visible()

    # Verify no text "CAM Holdings" is present in the brand link (standard nav)
    # The .brand link should only contain the image now.
    brand_link = page.locator(".brand")
    # Get the text content of the brand link and trim whitespace
    text_content = brand_link.inner_text().strip()
    print(f"Index Page Brand Link Text: '{text_content}'")
    assert text_content == "", f"Expected empty text in brand link, but found: '{text_content}'"

    # Check dimensions (roughly, since CSS might not be fully computed in headless exact same way without wait)
    # But visual check via screenshot is key.
    page.screenshot(path="verification/index_navbar.png")
    print("Screenshot saved to verification/index_navbar.png")

    # Test why-cam.html (alternative navbar)
    print("Navigating to why-cam.html...")
    page.goto("http://localhost:3000/why-cam.html")

    cam_brand_logo = page.locator(".cam-brand .brand-mark")
    expect(cam_brand_logo).to_be_visible()

    # Verify no text in cam-brand
    cam_brand_link = page.locator(".cam-brand")
    cam_text_content = cam_brand_link.inner_text().strip()
    print(f"Why-Cam Page Brand Link Text: '{cam_text_content}'")
    assert cam_text_content == "", f"Expected empty text in cam-brand link, but found: '{cam_text_content}'"

    page.screenshot(path="verification/why_cam_navbar.png")
    print("Screenshot saved to verification/why_cam_navbar.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            verify_navbar(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
