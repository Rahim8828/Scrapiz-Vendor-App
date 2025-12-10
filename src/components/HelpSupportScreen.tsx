import { useState } from 'react';
import { MessageCircle, Phone, Mail, Video, Send, ChevronDown, LifeBuoy } from 'lucide-react';
import Header from './Header';

interface HelpSupportScreenProps {
  onBack: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const supportOptions = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Get instant help',
    action: () => {
      // Placeholder action
    },
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Phone,
    title: 'Call Support',
    description: 'Speak to our agents',
    action: () => {
      // Placeholder action
    },
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Get a detailed response',
    action: () => {
      // Placeholder action
    },
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Video,
    title: 'Video Call',
    description: 'For visual assistance',
    action: () => {
      // Placeholder action
    },
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
];

const faqCategories = [
    {
        title: 'Getting Started',
        questions: [
            'How do I accept my first booking?',
            'How to update my vehicle information?',
            'Setting up payment methods'
        ]
    },
    {
        title: 'Bookings & Jobs',
        questions: [
            'How to cancel a booking?',
            'What if customer is not available?',
            'How to report job completion?'
        ]
    },
    {
        title: 'Payments & Earnings',
        questions: [
            'When will I receive payment?',
            'How to view my earnings?',
            'Payment dispute resolution'
        ]
    },
];

const SupportOptionCard = ({ option, onShowToast }: { option: typeof supportOptions[0], onShowToast: (message: string, type: 'success' | 'error' | 'info') => void }) => {
    const Icon = option.icon;

    const handleClick = () => {
        switch(option.title) {
            case 'Live Chat':
                onShowToast('Connecting to live chat...', 'info');
                setTimeout(() => {
                    onShowToast('Connected! A support agent will be with you shortly.', 'success');
                }, 2000);
                break;
            case 'Call Support':
                window.location.href = 'tel:+918001234567';
                break;
            case 'Email Us':
                 window.location.href = 'mailto:support@scrapiz.com';
                break;
            case 'Video Call':
                onShowToast('Video call scheduling is coming soon!', 'info');
                break;
            default:
                option.action();
        }
    }

    return (
        <button 
            onClick={handleClick}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 shadow-lg border border-gray-100"
        >
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-full bg-green-100 text-green-600 mx-auto mb-2 sm:mb-3">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">{option.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
        </button>
    );
};

const FaqItem = ({ category, onShowToast }: { category: typeof faqCategories[0], onShowToast: (message: string, type: 'success' | 'error' | 'info') => void}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 sm:p-4 text-left"
            >
                <span className="font-semibold text-gray-700 text-sm sm:text-base">{category.title}</span>
                <ChevronDown
                    className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    size={18}
                />
            </button>
            {isOpen && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                    {category.questions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => onShowToast('Opening detailed help for this topic...', 'info')}
                            className="w-full text-left p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-95"
                        >
                            <p className="text-xs sm:text-sm text-gray-600">{question}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function HelpSupportScreen({ onBack, onShowToast }: HelpSupportScreenProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!message.trim()) {
      onShowToast('Please enter your message', 'error');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setMessage('');
    onShowToast('Feedback sent! Thank you for your contribution.', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] to-[#E8F5E8] pb-20">
      <Header title="Help & Support" onBack={onBack} />

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Support Options Grid */}
        <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Contact Us</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {supportOptions.map(option => (
                    <SupportOptionCard key={option.title} option={option} onShowToast={onShowToast} />
                ))}
            </div>
        </div>

        {/* FAQ Section */}
        <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2 sm:space-y-3">
                {faqCategories.map(category => (
                    <FaqItem key={category.title} category={category} onShowToast={onShowToast} />
                ))}
            </div>
        </div>
        
        {/* Feedback Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Leave Feedback</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts or report an issue..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 bg-gray-50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base resize-none"
              rows={3}
            />
            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || !message.trim()}
              className="w-full mt-3 sm:mt-4 bg-green-600 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-red-100 rounded-full flex items-center justify-center">
                <LifeBuoy className="text-red-600 w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-red-800 text-sm sm:text-base">Emergency?</h3>
                <p className="text-xs sm:text-sm text-red-700">For urgent issues, call our 24/7 helpline.</p>
                <a href="tel:+918001234567" className="text-xs sm:text-sm font-semibold text-red-600 hover:underline">
                    Call Now
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}
