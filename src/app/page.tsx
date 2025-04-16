"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const router = useRouter();
  
  const handleDeleteData = async () => {
    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('Data deleted successfully');
      } else {
        console.error('Failed to delete data');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center px-4 py-12">
      {/* Animated glowing orb background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-700 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-pink-700 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1500"></div>
      </div>
      
      {/* Content Container */}
      <div className="max-w-4xl w-full z-10 backdrop-blur-sm bg-black/40 p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Gradient border top accent */}
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-8"></div>
          
          {/* Title with animated gradient */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Web Data Scraper
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-300 mb-6">
            Extract with Confidence
          </h2>
          
          <p className="text-gray-400 max-w-2xl mb-10 text-lg">
            Our powerful web scraping tool helps you collect structured data from any website.
            Perfect for market research, competitor analysis, and building comprehensive datasets.
          </p>
          
          {/* Action buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 w-full max-w-md">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full sm:w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg py-3 shadow-lg shadow-purple-700/30 hover:shadow-purple-700/50 transition-all duration-200 font-medium"
                >
                  Scrap Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Important Notice</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Please delete the existing JSON file before scraping new data to avoid conflicts.
                    Click Continue to proceed with scraping new data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    onClick={() => router.push('/products')}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="w-full sm:w-1/2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg py-3 shadow-lg shadow-red-700/30 hover:shadow-red-700/50 transition-all duration-200 font-medium"
                >
                  Delete Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to delete all scraped data? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white"
                    onClick={handleDeleteData}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
    
    </div>
  );
}
