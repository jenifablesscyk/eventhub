import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  date: string;
  location: string;
  city: string;
  price: number;
  capacity: number;
  available_seats: number;
  organizer_id: string | null;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  event_id: string;
  tickets: number;
  total_amount: number;
  status: string;
  booking_date: string;
  payment_status: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  favorite_categories: string[];
  favorite_cities: string[];
  price_range_min: number;
  price_range_max: number;
  interaction_count: number;
  last_interaction: string;
  created_at: string;
  updated_at: string;
};
