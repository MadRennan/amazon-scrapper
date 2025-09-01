import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';

// Initialize the Express application
const app = express();
const PORT = 3000;

// Define the enhanced product data structure
interface Product {
  title: string;
  rating: string | null;
  reviews: string | null;
  price: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  isSponsored: boolean;
}

// Endpoint to scrape Amazon search results
app.get('/api/scrape', async (req: Request, res: Response) => {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== 'string') {
    return res.status(400).json({ error: 'Keyword query parameter is required.' });
  }

  console.log(`🚀 Starting scrape for keyword: "${keyword}"`);

  let browser;
  try {
    // Launch Puppeteer in headless mode for efficiency
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Set a realistic user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    );

    const allProducts: Product[] = [];
    const MAX_PAGES = 3; // Limit the scrape to the first 3 pages

    for (let i = 1; i <= MAX_PAGES; i++) {
      const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}&page=${i}`;
      console.log(`Navigating to page ${i}: ${amazonUrl}`);
      
      await page.goto(amazonUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for the main search results container to ensure the page is loaded
      await page.waitForSelector('[data-component-type="s-search-results"]', { timeout: 10000 });
      
      // Extract data by running script within the browser context
      const pageProducts = await page.evaluate(() => {
        const products: Product[] = [];
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');

        productElements.forEach(product => {
          // Helper to safely extract text content
          const getText = (selector: string) => product.querySelector(selector)?.textContent?.trim() || null;

          // Price can be in two parts (whole and fraction)
          const priceWhole = getText('.a-price-whole');
          const priceFraction = getText('.a-price-fraction');
          
          const title = getText('h2 .a-link-normal .a-text-normal');
          const productUrl = product.querySelector<HTMLAnchorElement>('h2 a')?.href || null;

          if (title && productUrl) { // Only add products with a title and URL
            products.push({
              title,
              productUrl,
              imageUrl: product.querySelector<HTMLImageElement>('.s-image')?.src || null,
              rating: getText('.a-icon-alt')?.split(' ')[0] || null,
              reviews: getText('.a-size-base.s-underline-text') || null,
              price: priceWhole && priceFraction ? `$${priceWhole}${priceFraction}` : null,
              isSponsored: !!product.querySelector('.s-label-sponsored-label'),
            });
          }
        });
        return products;
      });

      if (pageProducts.length === 0) {
        console.log(`No products found on page ${i}. Ending scrape.`);
        break; // Stop if a page has no results
      }

      allProducts.push(...pageProducts);
    }
    
    console.log(`✅ Scrape complete. Found ${allProducts.length} products.`);
    res.json(allProducts);

  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).json({ error: 'Failed to scrape Amazon. The site may be blocking requests or its structure has changed.' });
  } finally {
    // Ensure the browser is always closed, even if errors occur
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
