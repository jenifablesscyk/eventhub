import { Calendar, MapPin, DollarSign, Users, Star } from 'lucide-react';
import { Event } from '../lib/supabase';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Music: 'bg-pink-100 text-pink-700',
      Tech: 'bg-blue-100 text-blue-700',
      Sports: 'bg-green-100 text-green-700',
      Arts: 'bg-purple-100 text-purple-700',
      Food: 'bg-orange-100 text-orange-700',
      Business: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {event.is_featured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
            <Star className="w-3 h-3 fill-current" />
            <span>Featured</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
          {event.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            <span className="line-clamp-1">{event.location}, {event.city}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-700">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              <span>{event.available_seats} seats left</span>
            </div>

            <div className="flex items-center text-lg font-bold text-blue-600">
              <DollarSign className="w-5 h-5" />
              <span>{event.price === 0 ? 'Free' : event.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
