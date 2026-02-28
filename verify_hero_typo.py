
import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        try:
            # Navigate to the local server
            await page.goto("http://localhost:3000/index.html", wait_until="domcontentloaded")

            # Wait for loader
            try:
                await page.wait_for_selector("#lux-loader", state="detached", timeout=5000)
            except:
                print("Loader didn't detach naturally, forcing it...")
                await page.evaluate("if(document.getElementById('lux-loader')) document.getElementById('lux-loader').remove()")
                await page.evaluate("document.getElementById('app').style.opacity = '1'")

            # Wait for animations
            await page.wait_for_timeout(2000)

            # Take screenshot of Hero
            os.makedirs("verification", exist_ok=True)
            await page.screenshot(path="verification/hero_typography.png", full_page=False)
            print("Screenshot saved to verification/hero_typography.png")

            # Mobile verification
            await page.set_viewport_size({"width": 375, "height": 812})
            await page.wait_for_timeout(1000)
            await page.screenshot(path="verification/hero_typography_mobile.png", full_page=False)
            print("Mobile screenshot saved to verification/hero_typography_mobile.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
