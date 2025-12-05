import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { supabase, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EventCard from './EventCard';

interface EventListingProps {
  onEventClick: (event: Event) => void;
}

const categories = ['All', 'Music', 'Tech', 'Sports', 'Arts', 'Food', 'Business'];
const cities = ['All', 'New York', 'San Francisco', 'Boston', 'Chicago', 'Miami', 'Seattle', 'Austin', 'Los Angeles', 'Denver', 'Napa Valley'];

export default function EventListing({ onEventClick }: EventListingProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);

  useEffect(() => {
    loadEvents();
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedCategory, selectedCity, priceRange, events]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: viewedEvents } = await supabase
        .from('event_views')
        .select('event_id')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5);

      let query = supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .limit(6);

      if (preferences?.favorite_categories && preferences.favorite_categories.length > 0) {
        query = query.in('category', preferences.favorite_categories);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecommendedEvents(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const trackEventView = async (eventId: string) => {
    if (!user) return;

    try {
      await supabase.from('event_views').insert({
        user_id: user.id,
        event_id: eventId,
      });

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const event = events.find((e) => e.id === eventId);
      if (event) {
        const favoriteCategories = preferences?.favorite_categories || [];
        if (!favoriteCategories.includes(event.category)) {
          favoriteCategories.push(event.category);
        }

        const favoriteCities = preferences?.favorite_cities || [];
        if (!favoriteCities.includes(event.city)) {
          favoriteCities.push(event.city);
        }

        if (preferences) {
          await supabase
            .from('user_preferences')
            .update({
              favorite_categories: favoriteCategories.slice(-5),
              favorite_cities: favoriteCities.slice(-5),
              interaction_count: (preferences.interaction_count || 0) + 1,
              last_interaction: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        } else {
          await supabase.from('user_preferences').insert({
            user_id: user.id,
            favorite_categories: [event.category],
            favorite_cities: [event.city],
            interaction_count: 1,
          });
        }
      }
    } catch (error) {
      console.error('Error tracking event view:', error);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    if (selectedCity !== 'All') {
      filtered = filtered.filter((event) => event.city === selectedCity);
    }

    filtered = filtered.filter(
      (event) => event.price >= priceRange[0] && event.price <= priceRange[1]
    );

    setFilteredEvents(filtered);
  };

  const handleEventClick = (event: Event) => {
    trackEventView(event.id);
    onEventClick(event);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Discover Amazing Events</h1>
          <p className="text-xl text-blue-100 mb-8">
            Find and book tickets to the best events in your city
          </p>

          <div className="max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, locations, or categories..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-blue-300 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>

          {user && recommendedEvents.length > 0 && (
            <button
              onClick={() => setShowRecommended(!showRecommended)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">AI Recommendations</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {showRecommended && recommendedEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>Recommended For You</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredEvents.length} Events Found
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No events found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
