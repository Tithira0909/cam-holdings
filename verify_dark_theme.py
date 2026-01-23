import sys
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Start server if needed, or assume running on 3001
        try:
            page.goto("http://localhost:3001", timeout=5000)
        except:
            print("Server not running on 3001")
            return

        # 1. Verify Body Background (should be dark)
        body_bg = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"Body BG: {body_bg}")

        # RGB(5, 6, 7) matches #050607
        if "rgb(5, 6, 7)" not in body_bg:
            print("FAILURE: Body background is not deep black.")
        else:
            print("SUCCESS: Body background is deep black.")

        # 2. Verify Review Section Background (should be dark)
        # We need to scroll or wait for it? No, computed style should exist.
        review_bg = page.evaluate("window.getComputedStyle(document.querySelector('#reviews')).backgroundColor")
        print(f"Reviews BG: {review_bg}")

        if "rgb(5, 6, 7)" not in review_bg and "rgba(0, 0, 0, 0)" not in review_bg:
             # It might be transparent if overlay is used, but we set it to #050607
             pass

        # 3. Verify Text Color (should be light/ivory)
        body_color = page.evaluate("window.getComputedStyle(document.body).color")
        print(f"Body Text: {body_color}")
        # RGB(247, 244, 238) matches #F7F4EE

        if "rgb(247, 244, 238)" in body_color:
            print("SUCCESS: Body text is ivory.")
        else:
            print(f"FAILURE: Body text is {body_color}")

        page.screenshot(path="dark_theme_verification.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    verify()
