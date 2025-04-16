import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE() {
  try {
    console.log('Clearing products data...');
    
    const productsFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');
    
    if (fs.existsSync(productsFilePath)) {
      fs.writeFileSync(productsFilePath, JSON.stringify({}, null, 2));
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Products data has been cleared successfully' 
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Products file not found' 
        }, 
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error clearing products data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear products data', 
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
