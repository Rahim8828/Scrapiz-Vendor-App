import { useState } from 'react';
import { Gauge, CheckCircle, AlertTriangle, Power } from 'lucide-react';
import { Vehicle } from '../types';
import Header from './Header';

interface VehicleScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const StatCard = ({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: string | number, unit: string, color: string }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className={`mb-2 text-green-600`}>{icon}</div>
        <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs sm:text-sm text-gray-500">{label}</p>
        <p className="text-xs text-gray-400">{unit}</p>
    </div>
);

const VehicleScreen = ({ onBack, onShowToast }: VehicleScreenProps) => {
  const [vehicle, setVehicle] = useState<Vehicle>({
    id: '1',
    vehicleNumber: 'MH01DM8286',
    type: 'auto',
    capacity: 200,
    isOnline: true,
    currentLoad: 124,
  });

  const loadPercentage = Math.round((vehicle.currentLoad / vehicle.capacity) * 100);

  const handleToggleOnline = () => {
    setVehicle(prev => {
        const newStatus = !prev.isOnline;
        onShowToast(
            newStatus ? 'Vehicle is now online and ready for jobs' : 'Vehicle has been taken offline',
            newStatus ? 'success' : 'info'
        );
        return { ...prev, isOnline: newStatus };
    });
  };
  
  const getLoadColor = () => {
      if (loadPercentage > 90) return '#EF4444'; // red-500
      if (loadPercentage > 70) return '#F59E0B'; // amber-500
      return '#22C55E'; // green-500
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] font-sans pb-20">
      <Header title="My Vehicle" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Vehicle Info Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-lg border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Auto Rickshaw</h3>
                    <p className="text-sm text-gray-500">{vehicle.vehicleNumber}</p>
                </div>
                <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                  vehicle.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${vehicle.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {vehicle.isOnline ? 'Online' : 'Offline'}
                </div>
            </div>
            <button
                onClick={handleToggleOnline}
                className={`w-full py-3 sm:py-3.5 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl text-white font-semibold transition-all duration-300 transform active:scale-95 text-sm sm:text-base ${
                  vehicle.isOnline ? 'bg-gray-800 hover:bg-gray-900' : 'bg-green-600 hover:bg-green-700'
                }`}>
                <Power className="w-4 h-4 sm:w-5 sm:h-5"/>
                <span>{vehicle.isOnline ? 'Go Offline' : 'Go Online'}</span>
            </button>
        </div>

        {/* Load Capacity Gauge */}
        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-lg border border-gray-100 p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Current Load Capacity</h3>
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto">
                <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={getLoadColor()} strokeWidth="12" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={(2 * Math.PI * 54) * (1 - loadPercentage / 100)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-4xl font-bold text-gray-800">{loadPercentage}%</span>
                    <span className="text-xs sm:text-sm text-gray-500">{vehicle.currentLoad} / {vehicle.capacity} kg</span>
                </div>
            </div>
        </div>

        {/* Vehicle Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Trips Today" value="45" unit="completed" color="green-600" />
          <StatCard icon={<Gauge className="w-5 h-5 sm:w-6 sm:h-6"/>} label="Distance" value="285" unit="km driven" color="green-600"/>
        </div>

        {/* Maintenance Alert */}
        <div className="rounded-xl sm:rounded-2xl bg-yellow-50 border border-yellow-200 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="text-yellow-600 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-yellow-800 text-sm sm:text-base">Maintenance Due</p>
            <p className="text-xs sm:text-sm text-yellow-700">Next service due in 15 days. Plan accordingly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleScreen;