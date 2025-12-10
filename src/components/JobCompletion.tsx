import { useState } from 'react';
import { Scale, IndianRupee, CheckCircle, Trash2, PlusCircle, Paperclip, Box, Wind, Droplet } from 'lucide-react';
import { ScrapItem } from '../types';
import Header from './Header';

interface JobCompletionProps {
  onJobComplete: (totalAmount: number) => void;
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const scrapOptions: Omit<ScrapItem, 'weight'>[] = [
    { type: 'Paper', ratePerKg: 12, icon: Paperclip, color: '#3498db' },
    { type: 'Plastic', ratePerKg: 18, icon: Box, color: '#2ecc71' },
    { type: 'Iron', ratePerKg: 25, icon: Wind, color: '#95a5a6' },
    { type: 'Aluminum', ratePerKg: 120, icon: Droplet, color: '#f1c40f' },
    { type: 'Brass', ratePerKg: 280, icon: Scale, color: '#e67e22' },
    { type: 'Copper', ratePerKg: 450, icon: Scale, color: '#e74c3c' },
    { type: 'Steel', ratePerKg: 35, icon: Scale, color: '#bdc3c7' },
    { type: 'Cardboard', ratePerKg: 8, icon: Box, color: '#795548' },
];

const JobCompletion = ({ onJobComplete, onBack, onShowToast }: JobCompletionProps) => {
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([
    { ...scrapOptions[0], weight: 0 },
    { ...scrapOptions[1], weight: 0 },
    { ...scrapOptions[2], weight: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const updateWeight = (index: number, weight: number) => {
    try {
      const updatedItems = [...scrapItems];
      updatedItems[index].weight = Math.max(0, weight); // Ensure non-negative weight
      setScrapItems(updatedItems);
    } catch (error) {
      console.error('Error updating weight:', error);
      onShowToast('Error updating weight. Please try again.', 'error');
    }
  };

  const addItem = () => {
    try {
      const unusedItems = scrapOptions.filter(opt => !scrapItems.some(item => item.type === opt.type));
      if (unusedItems.length > 0) {
        setScrapItems([...scrapItems, { ...unusedItems[0], weight: 0 }]);
        onShowToast(`${unusedItems[0].type} added successfully`, 'success');
      } else {
        onShowToast('All scrap types have been added', 'info');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      onShowToast('Error adding item. Please try again.', 'error');
    }
  };

  const removeItem = (index: number) => {
    try {
      if (scrapItems.length <= 1) {
        onShowToast('At least one scrap item is required', 'error');
        return;
      }
      const updatedItems = scrapItems.filter((_, i) => i !== index);
      setScrapItems(updatedItems);
      onShowToast('Item removed successfully', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      onShowToast('Error removing item. Please try again.', 'error');
    }
  };

  const totalAmount = scrapItems.reduce((sum, item) => sum + ((item.weight || 0) * item.ratePerKg), 0);

  const handleComplete = async () => {
    if (totalAmount <= 0) {
      onShowToast('Please enter scrap weights before completing', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      onJobComplete(totalAmount);
      onShowToast(`Job completed! ₹${totalAmount.toFixed(0)} earned`, 'success');
    } catch (error) {
      console.error('Error completing job:', error);
      onShowToast('Error completing job. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-40">
      <Header title="Calculate Final Price" onBack={onBack} />
      
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {scrapItems.map((item, index) => {
            const Icon = item.icon || Paperclip;
            return (
                <div key={`${item.type}-${index}`} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                        <div style={{ backgroundColor: item.color }} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{item.type}</h3>
                            <p className="text-xs sm:text-sm text-gray-500">₹{item.ratePerKg}/kg</p>
                        </div>
                        <button 
                            onClick={() => removeItem(index)} 
                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors active:scale-95 flex-shrink-0"
                            aria-label={`Remove ${item.type}`}
                            disabled={scrapItems.length <= 1}
                        >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <span className="font-medium text-xs sm:text-sm text-gray-600">Weight (kg)</span>
                            <input
                                type="number"
                                value={item.weight || ''}
                                onChange={(e) => updateWeight(index, parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                className="w-full sm:w-24 bg-transparent font-bold text-right text-lg sm:text-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-1"
                                step="0.1"
                                min="0"
                                max="9999"
                            />
                        </div>
                        <div className="w-full sm:w-24 text-center sm:text-right">
                            <p className="text-lg sm:text-xl font-bold text-green-600">₹{((item.weight || 0) * item.ratePerKg).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )
        })}

        <button 
            onClick={addItem} 
            disabled={scrapItems.length >= scrapOptions.length}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 border-2 border-dashed border-green-500 text-green-600 rounded-xl sm:rounded-2xl font-semibold hover:bg-green-50 hover:border-green-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            aria-label="Add another scrap type"
        >
            <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">Add Another Scrap Type</span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/90 backdrop-blur-sm border-t border-gray-200 safe-area-inset-bottom">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-base sm:text-lg">Total Amount</h3>
                          <p className="text-xs sm:text-sm opacity-90">Payable to Customer</p>
                      </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold">₹{totalAmount.toFixed(2)}</p>
              </div>
          </div>
          <button
            onClick={handleComplete}
            disabled={totalAmount <= 0 || isLoading}
            className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-green-700 transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            aria-label="Complete job and finalize payment"
          >
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{isLoading ? 'Processing...' : 'Complete & Finalize'}</span>
          </button>
      </div>
    </div>
  );
};

export default JobCompletion;