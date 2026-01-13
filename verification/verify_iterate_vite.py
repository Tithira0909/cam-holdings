from playwright.sync_api import sync_playwright, expect
import os
import subprocess
import time

def run():
    # Start Vite server
    server_process = subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Wait for server to start (adjust timeout as needed)
    time.sleep(5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            # Navigate to localhost (Vite usually runs on 5173, but let's check port or assume default)
            # Assuming default port 5173
            page.goto("http://localhost:5173/")

            # Wait for loader to disappear
            page.wait_for_selector("#lux-loader", state="hidden", timeout=30000)
            page.wait_for_timeout(1000)

            # Scroll to iterate section
            iterate_section = page.locator("#iterate")
            iterate_section.scroll_into_view_if_needed()

            # Ensure we are on Step 1 (PLAN)
            expect(page.locator("#itBadge")).to_have_text("01")

            # Screenshot Step 1
            page.screenshot(path="verification/vite_step1_plan.png")
            print("Vite Step 1 screenshot taken")

            # Click step 2 tab (DESIGN)
            page.locator(".itab[data-step='1']").click()
            page.wait_for_timeout(1000) # wait for crossfade

            # Screenshot Step 2
            page.screenshot(path="verification/vite_step2_design.png")
            print("Vite Step 2 screenshot taken")

            # Click step 3 tab (BUILD)
            page.locator(".itab[data-step='2']").click()
            page.wait_for_timeout(1000)

            # Screenshot Step 3
            page.screenshot(path="verification/vite_step3_build.png")
            print("Vite Step 3 screenshot taken")

            # Click step 4 tab (FINISH)
            page.locator(".itab[data-step='3']").click()
            page.wait_for_timeout(1000)

            # Screenshot Step 4
            page.screenshot(path="verification/vite_step4_finish.png")
            print("Vite Step 4 screenshot taken")

            browser.close()

    finally:
        # Kill the server
        server_process.kill()

if __name__ == "__main__":
    run()
