import { NextResponse } from 'next/server';
import { scrapeSite } from '@/utils/scraper';

export async function GET() {
  try {
    console.log('Starting scraping process...');
    
    const data = await scrapeSite();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Scraping completed successfully',
        data
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during scraping:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Scraping process failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
