import { useState } from 'react';
import { Search, TrendingUp, X, Wind, Paperclip, Recycle, Cpu, Box } from 'lucide-react';
import { Material } from '../types';
import Header from './Header';
import { LucideIcon } from 'lucide-react';

interface MaterialsScreenProps {
  onBack: () => void;
}

const materialsData: (Material & { icon: LucideIcon, color: string, trend: 'up' | 'down' | 'stable' })[] = [
  { id: '1', name: 'Iron', category: 'Metals', currentRate: 25, unit: 'kg', icon: Wind, color: '#95a5a6', trend: 'up' },
  { id: '2', name: 'Aluminum', category: 'Metals', currentRate: 120, unit: 'kg', icon: Wind, color: '#95a5a6', trend: 'stable' },
  { id: '3', name: 'Copper', category: 'Metals', currentRate: 450, unit: 'kg', icon: Wind, color: '#95a5a6', trend: 'up' },
  { id: '4', name: 'Brass', category: 'Metals', currentRate: 280, unit: 'kg', icon: Wind, color: '#95a5a6', trend: 'down' },
  { id: '5', name: 'Paper', category: 'Paper', currentRate: 12, unit: 'kg', icon: Paperclip, color: '#3498db', trend: 'up' },
  { id: '6', name: 'Cardboard', category: 'Paper', currentRate: 8, unit: 'kg', icon: Box, color: '#795548', trend: 'stable' },
  { id: '7', name: 'Plastic Bottles', category: 'Plastics', currentRate: 18, unit: 'kg', icon: Recycle, color: '#2ecc71', trend: 'up' },
  { id: '8', name: 'Electronics', category: 'E-Waste', currentRate: 35, unit: 'kg', icon: Cpu, color: '#f1c40f', trend: 'down' },
];

const categories = ['All', 'Metals', 'Paper', 'Plastics', 'E-Waste'];

const MaterialsScreen = ({ onBack }: MaterialsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredMaterials = materialsData.filter(material => {
    const categoryMatch = activeCategory === 'All' || material.category === activeCategory;
    const searchMatch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Materials & Rates" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 rounded-xl sm:rounded-full shadow-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                activeCategory === category 
                  ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Materials List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => {
              const Icon = material.icon;
              return (
                <div key={material.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div 
                      style={{ backgroundColor: material.color }} 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{material.name}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">{material.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <p className="font-bold text-green-600 text-sm sm:text-lg">
                            ₹{material.currentRate}
                            <span className="text-xs sm:text-sm font-normal text-gray-500">/{material.unit}</span>
                          </p>
                          {material.trend === 'up' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />}
                          {material.trend === 'down' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 transform rotate-180" />}
                          {material.trend === 'stable' && <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full"></div>}
                        </div>
                    </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 sm:py-20 px-4">
                <div className="inline-block bg-gray-100 p-4 sm:p-5 rounded-full mb-4 sm:mb-6">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Materials Found</h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
                  {searchQuery 
                    ? `No materials match "${searchQuery}". Try adjusting your search or filters.`
                    : 'Try adjusting your search or filters.'
                  }
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialsScreen;