Amazon Product Scraper (Advanced Edition)
This project is a web application that scrapes product listings from the first three pages of Amazon search results for a given keyword.

This advanced version uses a headless browser (Puppeteer) on the backend for robust, human-like scraping and features a more interactive frontend with sorting and filtering capabilities.

Features
Robust Backend API:

Uses Puppeteer to control a headless Chrome browser, making it less prone to being blocked.

Pagination: Automatically scrapes the first 3 pages of search results.

Richer Data: Extracts product title, rating, reviews, price, image URL, direct product URL, and whether a listing is sponsored.

Interactive Frontend:

Allows users to enter a keyword and view the scraped results in a clean, card-based layout.

Client-Side Sorting: Sort results by price (high-low, low-high) or rating.

Client-Side Filtering: Instantly hide sponsored product listings.

Error Handling: Graceful error handling on both client and server.

Prerequisites
Bun installed on your machine.

🚀 Setup and Running Instructions
Follow these steps to get the application running locally.

1. Clone the Repository
git clone <your-repository-url>
cd amazon-scraper

2. Set Up the Backend
Navigate to the backend directory, install dependencies, and start the server. Puppeteer is a large library, so the first installation may take a few moments as it downloads a compatible browser version.

# Go to the backend directory
cd backend

# Install dependencies (this might take a minute)
bun install

# Start the development server (runs on http://localhost:3000)
bun dev

You should see the message: ✅ Backend server running at http://localhost:3000

3. Set Up the Frontend
Open a new terminal window/tab. Navigate to the frontend directory, install dependencies, and start the development server.

# Go to the frontend directory from the root
cd frontend

# Install dependencies
bun install

# Start the Vite development server (usually runs on http://localhost:5173)
bun dev

4. Use the Application
Open your browser and navigate to the URL provided by the Vite development server (e.g., http://localhost:5173).

Enter a product keyword and click "Scrape Products".

Use the sort and filter controls to interact with the scraped data.

How It Works
The user enters a keyword on the frontend.

The frontend sends a fetch request to /api/scrape, which is proxied by Vite to the backend server.

The backend launches a headless Puppeteer browser.

It navigates to the first 3 pages of Amazon search results for the keyword, executing JavaScript just like a real user.

On each page, it runs a script within the browser's context to extract detailed product information from the DOM.

The combined data from all pages is sent back to the frontend as a single JSON response.

The frontend stores this data and renders it. All subsequent sorting and filtering operations are handled instantly on the client-side without needing to re-fetch data.

Disclaimer: Web scraping can be against the terms of service of some websites. This project is for educational purposes only. The HTML structure of Amazon changes frequently, which may require updating the selectors in backend/index.ts.
