import { useState } from 'react';
import { Search, Phone, User, Users, Briefcase, MessageSquare } from 'lucide-react';
import { Contact } from '../types';
import Header from './Header';

interface ContactsScreenProps {
  onBack: () => void;
}

const ContactsScreen = ({ onBack }: ContactsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      type: 'customer',
      lastContact: new Date(Date.now() - 86400000),
      avatarUrl: 'https://i.pravatar.cc/150?u=priya'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      phone: '+91 87654 32109',
      type: 'customer',
      lastContact: new Date(Date.now() - 172800000),
      avatarUrl: 'https://i.pravatar.cc/150?u=rajesh'
    },
    {
      id: '3',
      name: 'Supervisor - Mumbai Zone',
      phone: '+91 76543 21098',
      type: 'supervisor',
      lastContact: new Date(Date.now() - 3600000)
    },
    {
      id: '4',
      name: 'Scrap Yard - Andheri',
      phone: '+91 65432 10987',
      type: 'partner',
      lastContact: new Date(Date.now() - 7200000)
    }
  ]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const getContactIcon = (type: Contact['type']) => {
    switch (type) {
      case 'customer':
        return User;
      case 'supervisor':
        return Users;
      case 'partner':
        return Briefcase;
      default:
        return User;
    }
  };
  


  const formatLastContact = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessage = (phone: string) => {
    // This is a placeholder for a messaging functionality
    console.log(`Messaging ${phone}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Contacts" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 border border-gray-200 bg-white rounded-xl sm:rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg transition-all text-sm sm:text-base placeholder-gray-400"
          />
        </div>

        {/* Contacts List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredContacts.map((contact) => {
            const Icon = getContactIcon(contact.type);
            return (
              <div key={contact.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border-l-4 border-green-500">
                {contact.avatarUrl ? (
                    <img 
                      src={contact.avatarUrl} 
                      alt={contact.name} 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-green-100 flex-shrink-0">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg text-gray-800 truncate">{contact.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{contact.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Last contact: {formatLastContact(contact.lastContact)}
                  </p>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleMessage(contact.phone)}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
                    aria-label="Message contact"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => handleCall(contact.phone)}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all duration-200 active:scale-95"
                    aria-label="Call contact"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="inline-block p-4 sm:p-5 bg-green-100 rounded-full shadow-md mb-4 sm:mb-6">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Contacts Found</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any contacts matching "${searchQuery}".` 
                : 'Your saved contacts will be shown here. Start adding some!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsScreen;