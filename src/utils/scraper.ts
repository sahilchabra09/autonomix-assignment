import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { log } from 'console';

const BASE_URL = "https://webscraper.io/test-sites/e-commerce/ajax";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const scrapeSite = async () => {
  const data: Record<string, any> = {};

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const categoryElements = await page.$$('.category-link');
  const categoryLinks: { name: string; url: string }[] = [];

  for (let i = 0; i < categoryElements.length; i++) {
    const catName = await page.evaluate(el => el.textContent, categoryElements[i]);
    const catUrl = await page.evaluate(el => el.getAttribute('href'), categoryElements[i]);
    categoryLinks.push({ name: catName ? catName.trim() : '', url: `https://webscraper.io${catUrl}` });
  }

  console.log(categoryElements);
  console.log(categoryLinks)

  for (let cat of categoryLinks) {
    if (!data[cat.name]) {
      data[cat.name] = {
        products: [],
        subcategories: {}
      };
    }

    console.log(`Fetching main category: ${cat.name} from ${cat.url}`);

    await page.goto(cat.url, { waitUntil: 'domcontentloaded' });
    await delay(1000);

    const mainCategoryProducts = await scrapeProductsFromPage(page, 3);
    data[cat.name].products = mainCategoryProducts;
    console.log(`Scraped ${mainCategoryProducts.length} products from main category ${cat.name}`);

    const subcategoryElements = await page.$$('.subcategory-link');
    const subcategories: { name: string; url: string }[] = [];

    for (let i = 0; i < subcategoryElements.length; i++) {
      const subcatName = await page.evaluate(el => el.textContent, subcategoryElements[i]);
      const subcatUrl = await page.evaluate(el => el.getAttribute('href'), subcategoryElements[i]);
      subcategories.push({ name: subcatName ? subcatName.trim() : '', url: `https://webscraper.io${subcatUrl}` });
    }

    console.log(subcategoryElements);
    console.log(subcategories)

    for (let subcat of subcategories) {
      console.log(`Fetching subcategory: ${subcat.name} from ${subcat.url}`);

      if (!data[cat.name].subcategories[subcat.name]) {
        data[cat.name].subcategories[subcat.name] = [];
      }

      await page.goto(subcat.url, { waitUntil: 'domcontentloaded' });
      await delay(1000);

      let totalPages = 1;
      
      try {
        totalPages = await page.evaluate(() => {
          const pageButtons = document.querySelectorAll('.page');
          return pageButtons.length ? parseInt(pageButtons[pageButtons.length - 1].getAttribute('data-id') || '1') : 1;
        });
        console.log(`Found ${totalPages} pages to scrape`);
      } catch (error) {
        console.log('Could not determine total pages, assuming single page');
      }
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Processing page ${pageNum} of ${totalPages}`);
        
        if (pageNum > 1) {
          try {
            await page.evaluate((pageNum) => {
              const pageButton = document.querySelector(`.page[data-id="${pageNum}"]`);
              if (pageButton) (pageButton as HTMLElement).click();
            }, pageNum);
            
            await delay(2000);
            
            const currentPage = await page.evaluate(() => {
              const activeButton = document.querySelector('.page.active');
              return activeButton ? parseInt(activeButton.getAttribute('data-id') || '1') : 1;
            });
            
            if (currentPage !== pageNum) {
              console.log(`Failed to navigate to page ${pageNum}, currently on page ${currentPage}`);
              continue;
            }
          } catch (error) {
            console.error(`Error navigating to page ${pageNum}:`, error);
            continue;
          }
        }
        
        const productsOnPage = await scrapeProductsFromPage(page);
        
        if (productsOnPage.length === 0) {
          console.log(`No products found on page ${pageNum}`);
          continue;
        }
        
        data[cat.name].subcategories[subcat.name].push(...productsOnPage);
        console.log(`Added ${productsOnPage.length} products from page ${pageNum}`);
      }
    }
  }

  const srcDataDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join(srcDataDir, "products.json"), jsonData);
  
  console.log("Scraping completed!");

  await browser.close();
  return data;
};

async function scrapeProductsFromPage(page: Page, limit?: number): Promise<any[]> {
  const products = await page.$$('.thumbnail');
  
  if (products.length === 0) {
    return [];
  }

  const productsToProcess = limit ? products.slice(0, limit) : products;
  console.log(`Found ${products.length} products, processing ${productsToProcess.length}`);

  const scrapedProducts = [];

  for (let i = 0; i < productsToProcess.length; i++) {
    const product = productsToProcess[i];
    
    const productData = await page.evaluate((product: Element) => {
      const titleEl = product.querySelector('.title');
      const priceEl = product.querySelector('.price');
      const descriptionEl = product.querySelector('.description');
      const ratingEl = product.querySelector('.ratings p[data-rating]');
      const reviewsEl = product.querySelector('.ratings .pull-right');
      
      return {
        productName: titleEl?.textContent?.trim() || 'N/A',
        price: priceEl?.textContent?.trim() || 'N/A',
        description: descriptionEl?.textContent?.trim() || 'N/A',
        rating: ratingEl?.getAttribute('data-rating') || 'N/A',
        reviews: reviewsEl?.textContent?.trim() || 'N/A',
        productUrl: titleEl?.getAttribute('href') || '',
      };
    }, product);

    scrapedProducts.push({
      ...productData,
      productUrl: productData.productUrl ? `https://webscraper.io${productData.productUrl}` : '',
    });
  }

  return scrapedProducts;
}

if (require.main === module) {
  scrapeSite();
}
