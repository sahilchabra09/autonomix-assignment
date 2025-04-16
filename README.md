# Deployment link 
- Note this is static deployemt for watching and testing ui and scrapper doesnot work on it to test scrapper follow setup instructions below scrapper only works on local host
 https://autonomix-assigment.vercel.app/

# Web Scraping & Display Project

This project demonstrates the ability to scrape data from an AJAX-powered e-commerce website and display it cleanly on a simple frontend.

## 🎯 Project Objective

Extract product data from a test e-commerce website that uses AJAX pagination, store it, and display it in a user-friendly interface.

## 🚀 Quick Start
```bash
# Run the scraper directly
npx ts-node -P tsconfig-commonjs.json src/utils/scraper.ts
```

## 📹 Demo
[Watch the demo on YouTube]https://youtu.be/whPJGhz-htE

## 🔑 Key Features

- **Web Scraper**: Navigates through all categories & subcategories, handles AJAX pagination to extract products
- **Data Storage**: Stores scraped data in a local JSON file
- **Frontend Display**: Shows products grouped by categories and subcategories, with searching capabilities
- **Responsive Design**: Works on various screen sizes

## 🧰 Technology Stack

- **Next.js**: Full-stack React framework
- **TypeScript**: For type safety
- **Puppeteer**: For headless browser automation
- **Tailwind CSS**: For styling
- **Shadcn UI**: For UI components

## 📋 Scraping Specification

The scraper extracts the following data:
- Product Name
- Price
- Description
- Rating
- Number of Reviews
- Product URL

## 📂 Project Structure

- `src/utils/scraper.ts` - The web scraper implementation
- `src/data/products.json` - Stored product data
- `src/app/api/products/route.ts` - API endpoint to trigger scraping
- `src/app/products/page.tsx` - Frontend page to display products
- `src/app/page.tsx` - Homepage
- `tsconfig-commonjs.json` - Separate TypeScript configuration for the scraper

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd autonomix-assigment
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## 🔄 Using the Application

### Scraping Data

- The scraper is integrated in the application and can be triggered via API endpoint
- Navigate to the homepage and click "Start Scraping" to begin the process
- Alternatively, you can directly call the API endpoint `/api/products`

### Viewing Products

- Navigate to the Products page to view scraped products
- Products are organized by categories and subcategories
- Use the search functionality to find specific products

## 📝 Implementation Details

### Web Scraper

The web scraper uses Puppeteer to:
1. Navigate through all categories on the website
2. Visit each subcategory
3. Handle pagination to access all product pages
4. Extract detailed information for each product
5. Store the data in a structured format

#### Separate TypeScript Configuration

The project includes a separate TypeScript configuration file (`tsconfig-commonjs.json`) specifically for the scraper component. This configuration is necessary because:

- Puppeteer and some scraping-related dependencies require CommonJS module format rather than ESM (ECMAScript Modules) that Next.js uses by default
- The scraper needs different TypeScript settings to properly interface with the browser automation tools
- It allows the scraper to be run independently from the Next.js application when needed
- Resolves compatibility issues between Node.js file system operations and the browser environment

This separation ensures that the scraper can run properly in a Node.js environment while the rest of the application maintains Next.js/ESM compatibility.

### Frontend

The frontend provides:
- A clean, responsive user interface
- Category and subcategory organization
- Search functionality for products
- Detailed product information display

## ⚠️ Deployment Issues on Vercel

This application works perfectly in local development but faces two critical issues when deployed to Vercel:

### Issue 1: File System Access in Serverless Environment

Both API routes (`/api/products` and `/api/delete`) attempt to read from or write to the filesystem:

- In `scrapeSite()`, the scraped data is written to a file:
  ```typescript
  const srcDataDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join(srcDataDir, "products.json"), jsonData);
  ```

- In the DELETE route, the code attempts to clear a JSON file:
  ```typescript
  const productsFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  if (fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, JSON.stringify({}, null, 2));
  }
  ```

**Problem:** Vercel's serverless functions run in a read-only filesystem environment. You cannot write to files in production on Vercel as the filesystem is ephemeral and any changes will be lost between function invocations.

### Issue 2: Puppeteer in Serverless Environment

This application uses Puppeteer for web scraping, which has several limitations in serverless environments like Vercel:

- Puppeteer needs to launch a Chrome browser instance, which is not available in the serverless environment
- The execution time for scraping might exceed Vercel's function timeout limits (currently 10 seconds for Hobby plan, 60 seconds for Pro plan)
- Memory usage from Chrome can exceed the serverless function limits
---

This project was built as part of a hiring assignment demonstrating scraping and frontend development skills.
