
import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Mock the API response to ensure consistent data
        await page.route("**/api/public/real-estate-properties*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=b'''{
                "items": [
                    {
                        "id": 1,
                        "title": "Seaside Villa",
                        "estimated_cost": "$2M",
                        "description": "A beautiful view.",
                        "main_image": "/placeholder.svg"
                    }
                ]
            }'''
        ))

        try:
            # Navigate to the local server, waiting for DOM content only to avoid network hangs
            await page.goto("http://localhost:3000/index.html", wait_until="domcontentloaded")

            # Wait for the loader to be removed from the DOM
            try:
                await page.wait_for_selector("#lux-loader", state="detached", timeout=10000)
            except:
                print("Loader didn't detach naturally, forcing it...")
                await page.evaluate("document.getElementById('lux-loader').remove()")
                await page.evaluate("document.getElementById('app').style.opacity = '1'")

            # Scroll to the section to trigger animations
            section_loc = page.locator("#exclusive-properties")
            await section_loc.scroll_into_view_if_needed()

            # Wait for GSAP animations (approx 1-2 seconds)
            await page.wait_for_timeout(2000)

            # Verify Heading
            heading = page.locator("#exclusive-properties h2")
            text = await heading.text_content()
            print(f"Heading text: {text}")

            if "Real Estate Projects" not in text:
                print("FAIL: Heading incorrect")
            else:
                print("PASS: Heading correct")

            # Verify Button Container
            actions = page.locator(".re-actions")
            if await actions.is_visible():
                print("PASS: Action buttons container is visible")
            else:
                print("FAIL: Action buttons container missing")

            # Take screenshot
            os.makedirs("verification", exist_ok=True)
            await page.screenshot(path="verification/real_estate_reverified.png", full_page=False)
            print("Screenshot saved to verification/real_estate_reverified.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
