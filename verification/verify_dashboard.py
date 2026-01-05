
from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # MOCK API RESPONSES
        # 1. Mock Login
        page.route("**/api/auth/login", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"token": "fake-jwt-token", "role": "ADMIN"}'
        ))

        # 2. Mock Get Projects (Empty initially)
        page.route("**/api/projects", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # 3. Mock Create Project
        page.route("**/api/projects", lambda route: route.continue_() if route.request.method == "GET" else route.fulfill(
             status=201,
             content_type="application/json",
             body='{"id": 1, "title": "Test Project", "description": "Desc", "image_url": ""}'
        ))

        # 1. Login
        print("Navigating to login page...")
        page.goto("http://localhost:5173/login.html")

        print("Filling login form...")
        page.fill("#username", "admin")
        page.fill("#password", "password123")
        page.click("button[type=submit]")

        # Wait for navigation to dashboard
        print("Waiting for redirect to dashboard...")
        page.wait_for_url("**/dashboard.html")

        # 2. Add Project
        print("Adding a new project...")
        # We need to update the mock for GET /api/projects to return the new project when called after addition
        # Ideally, we'd trigger a reload or the frontend adds it to DOM.
        # The frontend calls loadProjects() after success.

        # Update mock to return the list with one project
        def handle_projects(route):
            if route.request.method == "GET":
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='[{"id": 1, "title": "Test Project", "description": "This is a test project created by Playwright.", "image_url": ""}]'
                )
            else:
                route.fulfill(status=201, body='{}')

        page.unroute("**/api/projects")
        page.route("**/api/projects", handle_projects)

        page.fill("#title", "Test Project")
        page.fill("#description", "This is a test project created by Playwright.")
        page.click(".add-btn")

        # Wait for project to appear in list
        print("Waiting for project to appear...")
        page.wait_for_selector(".project-card")

        # Take screenshot of dashboard with new project
        print("Taking screenshot...")
        page.screenshot(path="verification/dashboard_verified.png", full_page=True)

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    run()
