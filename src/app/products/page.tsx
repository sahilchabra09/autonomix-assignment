"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import LoaderOne from "@/components/ui/loader-one";

interface Product {
  productName: string;
  price: string;
  description: string;
  rating: string;
  reviews: string;
  productUrl: string;
}

interface CategoryData {
  products: Product[];
  subcategories: {
    [key: string]: Product[];
  };
}

interface ProductsData {
  [category: string]: CategoryData;
}

export default function Products() {
  const [products, setProducts] = useState<ProductsData>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Fetch the products data
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.data);
        
        // Initialize expanded state for categories
        const initialExpandedState: { [key: string]: boolean } = {};
        Object.keys(data.data).forEach((category) => {
          initialExpandedState[category] = false;
        });
        setExpandedCategories(initialExpandedState);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get all categories
  const categories = Object.keys(products);

  // Get subcategories for a specific category
  const getSubcategories = (category: string) => {
    if (category !== "all" && products[category]?.subcategories) {
      return Object.keys(products[category].subcategories);
    }
    return [];
  };

  // Toggle expanded state of category
  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  // Filter products based on search term and category
  const filteredProducts = (): Product[] => {
    let result: Product[] = [];

    try {
      if (selectedCategory === "all") {
        // Get all products from all categories
        Object.keys(products).forEach(category => {
          // Add main category products
          if (products[category]?.products) {
            result = [...result, ...products[category].products];
          }
          
          // Add subcategory products
          if (products[category]?.subcategories) {
            Object.keys(products[category].subcategories).forEach(subcat => {
              result = [...result, ...products[category].subcategories[subcat]];
            });
          }
        });
      } else if (selectedSubCategory === "all") {
        // Get all products from the selected category
        if (products[selectedCategory]?.products) {
          result = [...result, ...products[selectedCategory].products];
        }
        
        // Add all subcategory products
        if (products[selectedCategory]?.subcategories) {
          Object.keys(products[selectedCategory].subcategories).forEach(subcat => {
            result = [...result, ...products[selectedCategory].subcategories[subcat]];
          });
        }
      } else {
        // Get products from the selected subcategory
        if (products[selectedCategory]?.subcategories?.[selectedSubCategory]) {
          result = [...result, ...products[selectedCategory].subcategories[selectedSubCategory]];
        }
      }
    } catch (error) {
      console.error("Error filtering products:", error);
    }

    // Filter by search term
    return result.filter(product => 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get current page products
  const getCurrentProducts = () => {
    const filtered = filteredProducts();
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filtered.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Get title for breadcrumb navigation
  const getBreadcrumbTitle = () => {
    if (selectedCategory === "all") {
      return "All Products";
    } else if (selectedSubCategory === "all") {
      return selectedCategory;
    } else {
      return `${selectedCategory} / ${selectedSubCategory}`;
    }
  };

  // Function to render stars based on rating
  const renderRating = (rating: string) => {
    if (rating === "N/A") return <span className="text-gray-400">No rating</span>;
    
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum)) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < ratingNum ? "text-yellow-500" : "text-gray-400"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  // Function to format reviews count
  const formatReviews = (reviews: string) => {
    if (reviews === "N/A") return "";
    return reviews;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex justify-center relative">
      {/* Animated glowing orb background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-700 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-pink-700 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1500"></div>
      </div>
      
      <div className="w-[90vw] px-4 py-8 z-10">
        {/* Search Bar */}
        <div className="mb-6 w-full flex justify-center">
          <div className="max-w-md w-full">
            <Input
              type="search"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="bg-black/40 backdrop-blur-sm text-white border-gray-700 focus-visible:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-center">
          {getBreadcrumbTitle()}
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <LoaderOne />
            <p className="text-blue-400 mt-4 text-lg animate-pulse">Hold tight! We're scraping product data for you...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Categories Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="backdrop-blur-sm bg-black/40 rounded-xl shadow-xl p-4 sticky top-4 border border-gray-800 text-white">
                <div 
                  className={`py-2 px-4 hover:bg-gray-800/50 rounded cursor-pointer transition-all duration-200 text-white ${selectedCategory === 'all' ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-400 font-semibold border-l-2 border-blue-400' : ''}`}
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                    setCurrentPage(1);
                  }}
                >
                  Home
                </div>
                
                {categories.map((category) => (
                  <div key={category} className="border-t border-gray-800 mt-1 pt-1">
                    <div 
                      className={`py-2 px-4 hover:bg-gray-800/50 rounded cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedCategory === category && selectedSubCategory === 'all' ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-400 font-semibold border-l-2 border-blue-400' : ''}`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSubCategory('all');
                        setCurrentPage(1);
                        toggleCategory(category);
                      }}
                    >
                      <span>{category}</span>
                      <span className="text-xs">{expandedCategories[category] ? '▼' : '▶'}</span>
                    </div>
                    
                    {expandedCategories[category] && getSubcategories(category).map((subcat) => (
                      <div
                        key={`${category}-${subcat}`}
                        className={`py-2 pl-8 pr-4 hover:bg-gray-800/50 rounded cursor-pointer transition-all duration-200 ${selectedCategory === category && selectedSubCategory === subcat ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-400 font-semibold border-l-2 border-blue-400' : ''}`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedSubCategory(subcat);
                          setCurrentPage(1);
                        }}
                      >
                        {subcat}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Products Display */}
            <div className="flex-1">
              {getCurrentProducts().length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getCurrentProducts().map((product, index) => (
                      <div key={`${product.productName}-${index}`} className="backdrop-blur-sm bg-black/40 shadow-xl rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                        <div className="p-5 relative">
                          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                          <div className="flex justify-center mb-4">
                            <Image 
                              src="/cart.webp" 
                              alt="Product Cart" 
                              width={120} 
                              height={120} 
                              className="object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <a 
                            href={product.productUrl}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 truncate block mb-1"
                            title={product.productName}
                          >
                            {product.productName}
                          </a>
                          <div className="text-xl font-bold mb-2 text-white">{product.price}</div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2" title={product.description}>
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {renderRating(product.rating)}
                              {formatReviews(product.reviews) && (
                                <span className="text-xs text-gray-400 ml-1">
                                  ({formatReviews(product.reviews)})
                                </span>
                              )}
                            </div>
                            <a
                              href={product.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs font-medium rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors duration-200"
                            >
                              Visit Product
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {filteredProducts().length > productsPerPage && (
                    <div className="flex justify-center mt-8">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[...Array(Math.ceil(filteredProducts().length / productsPerPage))].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`px-3 py-1 rounded-md transition-all duration-200 ${
                              currentPage === i + 1
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-700/30'
                                : 'bg-gray-800/70 text-white hover:bg-gray-700/70'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 backdrop-blur-sm bg-black/40 rounded-xl shadow-xl border border-gray-800">
                  <p className="text-xl text-gray-300">No products found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
