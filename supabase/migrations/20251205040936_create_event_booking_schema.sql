/*
  # Event Booking Platform Database Schema

  ## Overview
  Complete database schema for an AI-powered event listing and booking platform
  with user profiles, events, bookings, and recommendation tracking.

  ## New Tables

  ### 1. profiles
  User profile information linked to auth.users
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. events
  Event listings with full details
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event name
  - `description` (text) - Detailed event description
  - `category` (text) - Event category (Music, Tech, Sports, Arts, Food, Business)
  - `image_url` (text) - Event banner image
  - `date` (timestamptz) - Event date and time
  - `location` (text) - Event venue/location
  - `city` (text) - City name for filtering
  - `price` (numeric) - Ticket price
  - `capacity` (integer) - Maximum attendees
  - `available_seats` (integer) - Remaining seats
  - `organizer_id` (uuid) - Links to profiles table
  - `is_featured` (boolean) - Featured event flag
  - `tags` (text[]) - Array of searchable tags
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. bookings
  User event bookings with payment tracking
  - `id` (uuid, primary key) - Unique booking identifier
  - `user_id` (uuid) - Links to profiles table
  - `event_id` (uuid) - Links to events table
  - `tickets` (integer) - Number of tickets booked
  - `total_amount` (numeric) - Total payment amount
  - `status` (text) - Booking status (confirmed, pending, cancelled)
  - `booking_date` (timestamptz) - Booking creation timestamp
  - `payment_status` (text) - Payment status (paid, pending, refunded)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. user_preferences
  AI recommendation engine data
  - `id` (uuid, primary key) - Unique preference identifier
  - `user_id` (uuid) - Links to profiles table
  - `favorite_categories` (text[]) - Preferred event categories
  - `favorite_cities` (text[]) - Preferred cities
  - `price_range_min` (numeric) - Minimum price preference
  - `price_range_max` (numeric) - Maximum price preference
  - `interaction_count` (integer) - Number of interactions
  - `last_interaction` (timestamptz) - Last activity timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. event_views
  Track event views for AI recommendations
  - `id` (uuid, primary key) - Unique view identifier
  - `user_id` (uuid) - Links to profiles table
  - `event_id` (uuid) - Links to events table
  - `viewed_at` (timestamptz) - View timestamp

  ## Security
  Row Level Security (RLS) enabled on all tables with appropriate policies:
  - Users can read their own profile and update it
  - Anyone can view published events
  - Only organizers can manage their events
  - Users can view their own bookings
  - User preferences are private to each user
  - Event views tracked for logged-in users

  ## Important Notes
  1. All tables use UUIDs for primary keys
  2. Timestamps use timezone-aware types
  3. Cascading deletes protect data integrity
  4. Indexes added for performance on frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text,
  date timestamptz NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  price numeric DEFAULT 0,
  capacity integer NOT NULL,
  available_seats integer NOT NULL,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  tickets integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL,
  status text DEFAULT 'confirmed',
  booking_date timestamptz DEFAULT now(),
  payment_status text DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  favorite_categories text[] DEFAULT '{}',
  favorite_cities text[] DEFAULT '{}',
  price_range_min numeric DEFAULT 0,
  price_range_max numeric DEFAULT 1000,
  interaction_count integer DEFAULT 0,
  last_interaction timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_views table for AI tracking
CREATE TABLE IF NOT EXISTS event_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_views_user ON event_views(user_id);
CREATE INDEX IF NOT EXISTS idx_event_views_event ON event_views(event_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Event views policies
CREATE POLICY "Users can view own event views"
  ON event_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event views"
  ON event_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();