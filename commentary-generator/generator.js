require('dotenv').config();
const { Kafka } = require('kafkajs');
const { VertexAI } = require('@google-cloud/vertexai');

// Kafka setup
const kafka = new Kafka({
  clientId: 'commentary-generator',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_API_KEY,
    password: process.env.KAFKA_API_SECRET,
  },
});

const consumer = kafka.consumer({ groupId: 'commentary-group-v5' });

// Vertex AI setup
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Generate commentary using Gemini
async function generateCommentary(context) {
  const prompt = `You are a legendary sports commentator with perfect memory.

EVENT: ${context.event_type} by Player #${context.player_number} (${context.team})
Time: ${context.event_timestamp}

PLAYER STATS:
- Shots: ${context.player_total_shots}
- Goals: ${context.player_total_goals}
- Fouls: ${context.player_total_fouls}

Generate ONE exciting commentary sentence:
${context.event_type === 'GOAL' ? '- Be VERY excited! This is goal #' + context.player_total_goals + '!' : ''}
${context.event_type === 'SHOT' ? '- Mention this is shot #' + context.player_total_shots : ''}
${context.player_total_fouls >= 3 ? '- WARN: ' + context.player_total_fouls + ' fouls - "walking a tightrope", "one more and he\'s off!"' : ''}

Commentary:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Fix for Gemini 2.0+ API - use candidates array
    if (response.candidates && response.candidates[0]) {
      const text = response.candidates[0].content.parts[0].text;
      return text.trim();
    }
    
    return `${context.event_type} by #${context.player_number}`;
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    return `${context.event_type} by #${context.player_number}`;
  }
}

// Parse Avro message
function parseAvroMessage(buffer) {
  try {
    const jsonStart = buffer.indexOf('{');
    if (jsonStart === -1) {
      const str = buffer.toString('utf8');
      const match = str.match(/\{[^}]+\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('No JSON found');
    }
    const jsonString = buffer.slice(jsonStart).toString('utf8');
    return JSON.parse(jsonString);
  } catch (e) {
    const str = buffer.toString('utf8', 0, 1000);
    const jsonMatch = str.match(/\{[\s\S]*?\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Could not parse message');
  }
}

// Main processing loop
async function startCommentaryGenerator() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'commentary_context', fromBeginning: false });
  
  console.log('🎙️ Commentary Generator started!');
  console.log('📡 Listening for events...\n');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        let context;
        try {
          context = parseAvroMessage(message.value);
        } catch (parseError) {
          return; // Skip unparseable messages
        }
        
        console.log(`\n📥 Event: ${context.event_type} by #${context.player_number}-${context.team}`);
        console.log(`   📊 Stats: ${context.player_total_shots} shots, ${context.player_total_goals} goals, ${context.player_total_fouls} fouls`);
        
        // Generate commentary with Gemini
        console.log('🤖 Calling Gemini AI...');
        const commentary = await generateCommentary(context);
        
        console.log(`\n🎙️  "${commentary}"\n`);
        console.log('✅ Commentary generated!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // CRITICAL: Rate limiting - wait 2 seconds between API calls
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    },
  });
}

startCommentaryGenerator().catch(console.error);