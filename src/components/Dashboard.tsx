import { useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase, Booking, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingWithEvent extends Booking {
  events: Event;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingEvents: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsData = data as unknown as BookingWithEvent[];
      setBookings(bookingsData);

      const now = new Date();
      const upcoming = bookingsData.filter(
        (b) => new Date(b.events.date) > now
      ).length;
      const total = bookingsData.reduce((sum, b) => sum + Number(b.total_amount), 0);

      setStats({
        totalBookings: bookingsData.length,
        upcomingEvents: upcoming,
        totalSpent: total,
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your bookings and discover new events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Ticket className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingEvents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No bookings yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start exploring events and book your first ticket!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      <img
                        src={booking.events.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}
                        alt={booking.events.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {booking.events.title}
                            </h3>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          {isUpcoming(booking.events.date) && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Upcoming</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{formatDate(booking.events.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>{booking.events.location}, {booking.events.city}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Ticket className="w-4 h-4 text-blue-600" />
                            <span>{booking.tickets} ticket(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-blue-600">
                        ${Number(booking.total_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Booked on {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
