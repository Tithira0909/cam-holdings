from playwright.sync_api import sync_playwright
import requests

def test_listings():
    # 1. Login to get token
    login_url = "http://localhost:3000/api/auth/login"
    login_data = {"username": "admin", "password": "password123"}
    try:
        response = requests.post(login_url, json=login_data)
        response.raise_for_status()
        token = response.json().get("token")
        print("Logged in, token received.")
    except Exception as e:
        print(f"Login failed: {e}")
        token = None

    # 2. Create a test listing
    if token:
        create_url = "http://localhost:3000/api/admin/service-listings"
        headers = {"Authorization": f"Bearer {token}"}
        # Multipart form data - simple dummy file
        files = {
            'main_image': ('test.jpg', b'fakecontent', 'image/jpeg')
        }
        data = {
            'category': 'real_estate',
            'title': 'Test Property',
            'estimated_cost': '$1,000,000',
            'short_description': 'A beautiful test property.',
            'status': 'Active'
        }
        try:
            r = requests.post(create_url, headers=headers, data=data, files=files)
            print(f"Create listing response: {r.status_code} {r.text}")
        except Exception as e:
            print(f"Failed to create listing: {e}")

    # 3. Verify Frontend
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to Real Estate page
        url = "http://localhost:5173/services/real-estate.html"
        print(f"Navigating to {url}")
        page.goto(url)

        # Wait for grid to load
        try:
            page.wait_for_selector(".re-card", timeout=5000)
            print("Card found!")
        except:
            print("Card not found (maybe empty or loading error)")

        page.screenshot(path="verification/listings.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    test_listings()
