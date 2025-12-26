// Load environment variables
require('dotenv').config();
const { Kafka } = require('kafkajs');

// Configure Kafka connection
const kafka = new Kafka({
  clientId: 'pulsecast-producer',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_API_KEY,
    password: process.env.KAFKA_API_SECRET,
  },
});

// Create producer
const producer = kafka.producer();

// Sample sports events
const sampleEvents = [
  // Player #9's journey (6 shots, 1 goal)
  {
    event_id: 'evt_004',
    event_type: 'SHOT',
    player_number: '9',
    team: 'BLUE',
    timestamp: '15:20',
    confidence: 0.88,
    location_x: 0.75,
    location_y: 0.45,
  },
  {
    event_id: 'evt_005',
    event_type: 'SHOT',
    player_number: '9',
    team: 'BLUE',
    timestamp: '18:45',
    confidence: 0.91,
    location_x: 0.82,
    location_y: 0.52,
  },
  {
    event_id: 'evt_006',
    event_type: 'SHOT',
    player_number: '9',
    team: 'BLUE',
    timestamp: '22:10',
    confidence: 0.89,
    location_x: 0.78,
    location_y: 0.48,
  },
  // Player #7's discipline problems (4 fouls, yellow card risk!)
  {
    event_id: 'evt_007',
    event_type: 'FOUL',
    player_number: '7',
    team: 'RED',
    timestamp: '35:15',
    confidence: 0.83,
    location_x: 0.55,
    location_y: 0.38,
  },
  {
    event_id: 'evt_008',
    event_type: 'FOUL',
    player_number: '7',
    team: 'RED',
    timestamp: '41:30',
    confidence: 0.87,
    location_x: 0.62,
    location_y: 0.42,
  },
  {
    event_id: 'evt_009',
    event_type: 'CARD',
    player_number: '7',
    team: 'RED',
    timestamp: '43:00',
    confidence: 0.95,
    location_x: 0.60,
    location_y: 0.40,
  },
  {
    event_id: 'evt_010',
    event_type: 'FOUL',
    player_number: '7',
    team: 'RED',
    timestamp: '67:45',
    confidence: 0.82,
    location_x: 0.58,
    location_y: 0.35,
  },
  // Another player joins
  {
    event_id: 'evt_011',
    event_type: 'SHOT',
    player_number: '10',
    team: 'BLUE',
    timestamp: '52:20',
    confidence: 0.90,
    location_x: 0.85,
    location_y: 0.55,
  },
  {
    event_id: 'evt_012',
    event_type: 'GOAL',
    player_number: '10',
    team: 'BLUE',
    timestamp: '56:30',
    confidence: 0.97,
    location_x: 0.88,
    location_y: 0.50,
  },
];
// Main function
async function sendEvents() {
  try {
    // Connect to Kafka
    console.log('🔌 Connecting to Confluent Cloud...');
    await producer.connect();
    console.log('✅ Connected successfully!');

    // Send each event
    for (const event of sampleEvents) {
      console.log(`\n📤 Sending ${event.event_type} event...`);
      
      await producer.send({
        topic: 'raw-events',
        messages: [
          {
            key: event.event_id,
            value: JSON.stringify(event),
          },
        ],
      });
      
      console.log(`✅ Sent: ${event.event_type} by player #${event.player_number}`);
      
      // Wait 2 seconds between events
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 All events sent successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Disconnect
    await producer.disconnect();
    console.log('👋 Disconnected from Kafka');
  }
}

// Run it!
sendEvents();