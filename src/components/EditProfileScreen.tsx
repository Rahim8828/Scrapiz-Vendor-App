import { useState } from 'react';
import { Camera, Save, User, Mail, Phone, MapPin, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';

interface EditProfileScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const EditProfileScreen = ({ onBack, onShowToast }: EditProfileScreenProps) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Nooroolhuda',
    phone: user?.phone || '+91 9967332092',
    email: 'nooroolhuda@example.com',
    address: 'Mumbai, Maharashtra',
    vehicleNumber: 'MH01DM8286',
    emergencyContact: '+91 9876543210'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Basic validation
    if (!profileData.name.trim()) {
      onShowToast('Name is required', 'error');
      return;
    }
    
    if (!profileData.phone.trim()) {
      onShowToast('Phone number is required', 'error');
      return;
    }
    
    if (profileData.phone.length < 10) {
      onShowToast('Please enter a valid phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to save profile data
      await new Promise(resolve => setTimeout(resolve, 1500));
      onShowToast('Profile updated successfully!', 'success');
      onBack(); // Go back after successful save
    } catch (error) {
      onShowToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    // This would typically open the device's file picker
    onShowToast('Photo upload feature is for demonstration!', 'info');
  };

  const InputField = ({ icon: Icon, label, value, onChange, placeholder, type = 'text' }: any) => (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow shadow-sm text-sm sm:text-base"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8]">
      <Header title="Edit Profile" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 pb-24">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handlePhotoUpload}
              className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-transform active:scale-90 shadow-md border-2 border-white"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-3 sm:mt-4">{profileData.name}</h2>
          <p className="text-sm sm:text-base text-gray-500">Scrapiz Vendor</p>
        </div>

        {/* Form Sections */}
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"/>
                  Personal Information
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <InputField label="Full Name" value={profileData.name} onChange={(e:any) => setProfileData({...profileData, name: e.target.value})} placeholder="Your full name" icon={User} />
                    <InputField label="Email Address" value={profileData.email} onChange={(e:any) => setProfileData({...profileData, email: e.target.value})} placeholder="Your email address" icon={Mail} type="email" />
                    <InputField label="Phone Number" value={profileData.phone} onChange={(e:any) => setProfileData({...profileData, phone: e.target.value})} placeholder="Your phone number" icon={Phone} type="tel" />
                </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"/>
                  Work Information
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <InputField label="Vehicle Number" value={profileData.vehicleNumber} onChange={(e:any) => setProfileData({...profileData, vehicleNumber: e.target.value})} placeholder="e.g., MH 01 AB 1234" icon={Briefcase} />
                    <InputField label="Primary Address" value={profileData.address} onChange={(e:any) => setProfileData({...profileData, address: e.target.value})} placeholder="Your primary operating address" icon={MapPin} />
                </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"/>
                  Security
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <InputField label="Emergency Contact" value={profileData.emergencyContact} onChange={(e:any) => setProfileData({...profileData, emergencyContact: e.target.value})} placeholder="An emergency contact number" icon={Shield} type="tel" />
                </div>
            </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-green-700 transition-all active:scale-95 disabled:bg-green-300 shadow-lg"
          >
              {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
              <>
                  <Save className="w-5 h-5 sm:w-6 sm:h-6" />
                  Save Changes
              </>
              )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;