/*
  # Insert Sample Event Data

  ## Overview
  Populates the events table with sample events across various categories
  for testing and demonstration purposes.

  ## Data Inserted
  - 12 diverse events across categories: Music, Tech, Sports, Arts, Food, Business
  - Events scheduled for future dates
  - Various price ranges and capacities
  - Featured events marked for homepage display
  - Realistic event data with descriptions and locations
*/

-- Insert sample events (using NULL for organizer_id as users don't exist yet)
INSERT INTO events (title, description, category, image_url, date, location, city, price, capacity, available_seats, is_featured, tags) VALUES
(
  'Summer Music Festival 2025',
  'Join us for an unforgettable evening featuring top artists from around the world. Experience live performances across multiple stages with food trucks, art installations, and an electric atmosphere.',
  'Music',
  'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
  '2025-06-15 18:00:00+00',
  'Central Park Amphitheater',
  'New York',
  89.99,
  5000,
  5000,
  true,
  ARRAY['music', 'festival', 'outdoor', 'live']
),
(
  'Tech Innovation Summit',
  'Explore the future of technology with industry leaders, innovators, and entrepreneurs. Network with fellow tech enthusiasts and discover groundbreaking solutions shaping tomorrow.',
  'Tech',
  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
  '2025-03-20 09:00:00+00',
  'Convention Center',
  'San Francisco',
  299.00,
  1000,
  1000,
  true,
  ARRAY['technology', 'innovation', 'networking', 'business']
),
(
  'Marathon Championship 2025',
  'Challenge yourself in this prestigious marathon event. Whether you are a seasoned runner or first-timer, join thousands of participants in this exciting race through the city.',
  'Sports',
  'https://images.pexels.com/photos/2524739/pexels-photo-2524739.jpeg',
  '2025-04-10 07:00:00+00',
  'City Marathon Route',
  'Boston',
  45.00,
  10000,
  10000,
  false,
  ARRAY['sports', 'running', 'fitness', 'outdoor']
),
(
  'Contemporary Art Exhibition',
  'Immerse yourself in thought-provoking contemporary artworks from emerging and established artists. A curated collection exploring themes of identity, nature, and society.',
  'Arts',
  'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg',
  '2025-02-28 10:00:00+00',
  'Metropolitan Art Gallery',
  'Chicago',
  25.00,
  500,
  500,
  true,
  ARRAY['art', 'exhibition', 'culture', 'gallery']
),
(
  'Street Food Carnival',
  'Taste your way through diverse cuisines from over 50 food vendors. Live cooking demos, chef competitions, and family-friendly entertainment throughout the day.',
  'Food',
  'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
  '2025-05-08 12:00:00+00',
  'Waterfront Park',
  'Miami',
  15.00,
  3000,
  3000,
  false,
  ARRAY['food', 'festival', 'family', 'outdoor']
),
(
  'Business Leadership Conference',
  'Gain insights from successful CEOs and business leaders. Interactive workshops on leadership, strategy, and innovation to transform your business approach.',
  'Business',
  'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg',
  '2025-03-15 08:00:00+00',
  'Grand Hotel Conference Hall',
  'Seattle',
  499.00,
  300,
  300,
  false,
  ARRAY['business', 'leadership', 'conference', 'networking']
),
(
  'Jazz Night Under the Stars',
  'An intimate evening of smooth jazz performances in a stunning outdoor venue. Bring your blankets and enjoy world-class musicians under the night sky.',
  'Music',
  'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg',
  '2025-07-22 19:00:00+00',
  'Botanical Gardens',
  'Austin',
  55.00,
  800,
  800,
  true,
  ARRAY['music', 'jazz', 'outdoor', 'evening']
),
(
  'AI & Machine Learning Workshop',
  'Hands-on workshop covering the latest in AI and ML technologies. Learn from experts and build practical projects you can use immediately.',
  'Tech',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  '2025-04-05 09:00:00+00',
  'Tech Campus Building A',
  'San Francisco',
  199.00,
  150,
  150,
  false,
  ARRAY['technology', 'AI', 'workshop', 'education']
),
(
  'Basketball Championship Finals',
  'Witness the thrilling conclusion of the season as top teams compete for the championship title. Premium seating with excellent views of all the action.',
  'Sports',
  'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
  '2025-06-30 18:00:00+00',
  'Arena Stadium',
  'Los Angeles',
  125.00,
  15000,
  15000,
  true,
  ARRAY['sports', 'basketball', 'championship', 'entertainment']
),
(
  'Sculpture Garden Opening',
  'Celebrate the grand opening of our new sculpture garden featuring works from international artists. Guided tours, artist talks, and refreshments provided.',
  'Arts',
  'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg',
  '2025-03-12 14:00:00+00',
  'City Art Museum',
  'Denver',
  0.00,
  1000,
  1000,
  false,
  ARRAY['art', 'sculpture', 'free', 'culture']
),
(
  'Wine Tasting Experience',
  'Sample premium wines from renowned vineyards. Expert sommeliers guide you through tasting notes, pairing suggestions, and wine selection tips.',
  'Food',
  'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
  '2025-04-18 17:00:00+00',
  'Vineyard Estate',
  'Napa Valley',
  95.00,
  200,
  200,
  false,
  ARRAY['food', 'wine', 'tasting', 'premium']
),
(
  'Startup Pitch Competition',
  'Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs and learn what it takes to build a successful startup.',
  'Business',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
  '2025-05-25 13:00:00+00',
  'Innovation Hub',
  'Austin',
  25.00,
  400,
  400,
  false,
  ARRAY['business', 'startup', 'innovation', 'networking']
);