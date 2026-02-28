import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Mock Blog Data
        blog_data = {
            "id": 101,
            "slug": "luxury-interiors-2025",
            "title": "Luxury Interiors Trends 2025",
            "type": "Design",
            "created_at": "2025-01-15T10:00:00Z",
            "banner_url": "uploads/blog-banner.jpg",
            "content_html": "<p>This is a <strong>mock</strong> blog post content.</p>",
            "published_status": "Published"
        }

        # Mock Route
        async def handle_route(route):
            url = route.request.url
            print(f"REQUEST: {url}")
            if "/api/blogs/slug/luxury-interiors-2025" in url:
                print("Mocking Single Blog")
                await route.fulfill(status=200, json=blog_data)
            elif "/api/blogs" in url and "slug" not in url:
                print("Mocking Blog List")
                await route.fulfill(status=200, json=[blog_data])
            else:
                try:
                    await route.continue_()
                except Exception as e:
                    print(f"Route continue failed: {e}")

        await page.route("**/*", handle_route)

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        # 1. Test Navigation from List
        print("Testing Blog List Navigation...")
        await page.goto("http://localhost:5173/blogs.html")

        # Wait a bit to see if logs appear
        await page.wait_for_timeout(2000)

        await page.wait_for_selector(".b-card-link")

        # Check href
        href = await page.get_attribute(".b-card-link", "href")
        print(f"Card Href: {href}")
        assert "slug=luxury-interiors-2025" in href
        assert "id=101" in href

        # Click
        await page.click(".b-card-link")
        # Should navigate to blog.html

        # 2. Test Details Rendering
        print("\nTesting Blog Details Page...")
        # Since we are mocking API, we can just wait for content
        await page.wait_for_selector(".blog-title")

        title = await page.inner_text(".blog-title")
        content = await page.inner_html(".blog-body")
        meta = await page.inner_text(".blog-meta")
        hero_bg = await page.get_attribute(".blog-hero", "style")

        print(f"Title: {title}")
        print(f"Meta: {meta}")
        print(f"Hero BG: {hero_bg}")

        assert "Luxury Interiors Trends 2025" in title
        assert "Design" in meta
        assert "mock" in content
        assert "blog-banner.jpg" in hero_bg

        # Screenshot
        await page.screenshot(path="verification/blog_verification.png", full_page=True)
        print("\nVerification successful. Screenshot saved.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
