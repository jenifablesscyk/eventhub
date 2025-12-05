import { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Ticket, CheckCircle } from 'lucide-react';
import { Event, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

export default function BookingModal({ event, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalAmount = event.price * tickets;

  const handleBooking = async () => {
    if (!user) {
      setError('Please sign in to book tickets');
      return;
    }

    if (tickets > event.available_seats) {
      setError('Not enough seats available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: user.id,
        event_id: event.id,
        tickets,
        total_amount: totalAmount,
        status: 'confirmed',
        payment_status: 'paid',
      });

      if (bookingError) throw bookingError;

      const { error: updateError } = await supabase
        .from('events')
        .update({
          available_seats: event.available_seats - tickets,
        })
        .eq('id', event.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onBookingComplete();
        onClose();
        setSuccess(false);
        setTickets(1);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 text-lg">
              Your tickets have been booked successfully. Check your dashboard for details.
            </p>
          </div>
        ) : (
          <>
            <div className="relative h-64 overflow-hidden rounded-t-2xl">
              <img
                src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-3">
                  {event.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h2>
                <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold text-gray-900">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.city}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Ticket Price</p>
                      <p className="font-semibold text-gray-900">
                        {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Available Seats</p>
                      <p className="font-semibold text-gray-900">{event.available_seats} remaining</p>
                    </div>
                  </div>
                </div>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user ? (
                <>
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-lg font-semibold text-gray-900">Number of Tickets</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTickets(Math.max(1, tickets - 1))}
                          className="w-10 h-10 bg-white rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">{tickets}</span>
                        <button
                          onClick={() => setTickets(Math.min(event.available_seats, tickets + 1))}
                          className="w-10 h-10 bg-white rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={loading || event.available_seats === 0}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Ticket className="w-6 h-6" />
                    <span>{loading ? 'Processing...' : 'Book Tickets'}</span>
                  </button>
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <p className="text-blue-900 font-semibold mb-2">Sign in to book tickets</p>
                  <p className="text-blue-700 text-sm">
                    Create an account or sign in to continue with your booking
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
