import { BookingRequest } from '../types';

export interface AcceptedBooking extends BookingRequest {
  acceptedAt: Date;
  status: 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  vendorId: string;
}

export interface DeclinedBooking extends BookingRequest {
  declinedAt: Date;
  declineReason?: string;
  vendorId: string;
}

class BookingStateService {
  private acceptedBookings: AcceptedBooking[] = [];
  private declinedBookings: DeclinedBooking[] = [];
  private listeners: Array<() => void> = [];

  // Accept a booking
  acceptBooking(booking: BookingRequest, vendorId: string): AcceptedBooking {
    const acceptedBooking: AcceptedBooking = {
      ...booking,
      acceptedAt: new Date(),
      status: 'accepted',
      vendorId
    };

    this.acceptedBookings.push(acceptedBooking);
    this.notifyListeners();
    
    console.log('Booking accepted:', acceptedBooking.id);
    return acceptedBooking;
  }

  // Decline a booking
  declineBooking(booking: BookingRequest, vendorId: string, reason?: string): DeclinedBooking {
    const declinedBooking: DeclinedBooking = {
      ...booking,
      declinedAt: new Date(),
      declineReason: reason,
      vendorId
    };

    this.declinedBookings.push(declinedBooking);
    this.notifyListeners();
    
    console.log('Booking declined:', declinedBooking.id);
    return declinedBooking;
  }

  // Get accepted bookings
  getAcceptedBookings(): AcceptedBooking[] {
    return [...this.acceptedBookings];
  }

  // Get declined bookings
  getDeclinedBookings(): DeclinedBooking[] {
    return [...this.declinedBookings];
  }

  // Get bookings by status
  getBookingsByStatus(status: AcceptedBooking['status']): AcceptedBooking[] {
    return this.acceptedBookings.filter(booking => booking.status === status);
  }

  // Update booking status
  updateBookingStatus(bookingId: string, status: AcceptedBooking['status']): boolean {
    const bookingIndex = this.acceptedBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      this.acceptedBookings[bookingIndex].status = status;
      this.notifyListeners();
      console.log(`Booking ${bookingId} status updated to:`, status);
      return true;
    }
    return false;
  }

  // Remove booking (for cleanup)
  removeBooking(bookingId: string): boolean {
    const acceptedIndex = this.acceptedBookings.findIndex(b => b.id === bookingId);
    const declinedIndex = this.declinedBookings.findIndex(b => b.id === bookingId);
    
    if (acceptedIndex !== -1) {
      this.acceptedBookings.splice(acceptedIndex, 1);
      this.notifyListeners();
      return true;
    }
    
    if (declinedIndex !== -1) {
      this.declinedBookings.splice(declinedIndex, 1);
      this.notifyListeners();
      return true;
    }
    
    return false;
  }

  // Check if booking is already processed
  isBookingProcessed(bookingId: string): boolean {
    return this.acceptedBookings.some(b => b.id === bookingId) || 
           this.declinedBookings.some(b => b.id === bookingId);
  }

  // Get booking by ID
  getBookingById(bookingId: string): AcceptedBooking | DeclinedBooking | null {
    const accepted = this.acceptedBookings.find(b => b.id === bookingId);
    if (accepted) return accepted;
    
    const declined = this.declinedBookings.find(b => b.id === bookingId);
    if (declined) return declined;
    
    return null;
  }

  // Subscribe to booking state changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Get statistics
  getStats() {
    return {
      totalAccepted: this.acceptedBookings.length,
      totalDeclined: this.declinedBookings.length,
      inProgress: this.getBookingsByStatus('in-progress').length,
      completed: this.getBookingsByStatus('completed').length,
      cancelled: this.getBookingsByStatus('cancelled').length
    };
  }

  // Clear all data (for testing/reset)
  clearAll(): void {
    this.acceptedBookings = [];
    this.declinedBookings = [];
    this.notifyListeners();
  }
}

// Export singleton instance
export const bookingStateService = new BookingStateService();