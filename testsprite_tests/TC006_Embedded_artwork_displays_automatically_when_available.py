import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000
        await page.goto("http://localhost:3000")
        
        # -> Click the 'START LISTENING' button to open the folder picker / begin adding a local music folder.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/main/section/div[2]/div[3]/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Library view and select a track that has embedded artwork so I can verify the album art displays immediately.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/main/section/div[2]/div[3]/div/a').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'START LISTENING' button again to trigger the folder picker / open local music folder.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/main/section/div[2]/div[3]/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Navigate to /player to reach the player/library UI where track selection and embedded artwork can be verified.
        await page.goto("http://localhost:3000/player")
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'Album art')]").nth(0).is_visible(), "The album art should be visible for the selected track.",
        assert await frame.locator("xpath=//*[contains(., 'Embedded artwork')]").nth(0).is_visible(), "The artwork should be the track's embedded artwork rather than a generic placeholder.",
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    