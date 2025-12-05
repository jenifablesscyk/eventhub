import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import EventListing from './components/EventListing';
import BookingModal from './components/BookingModal';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { Event } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'admin'>('home');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    setSelectedEvent(null);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={setCurrentPage} currentPage={currentPage} />

        {currentPage === 'home' && (
          <EventListing onEventClick={handleEventClick} />
        )}

        {currentPage === 'dashboard' && <Dashboard />}

        {currentPage === 'admin' && <AdminPanel />}

        <BookingModal
          event={selectedEvent}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
