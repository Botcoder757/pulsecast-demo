# 🎙️ PulseCast - AI-Powered Sports Commentary

AI commentary system that watches ANY sports match and generates real-time, human-like commentary with perfect memory, tactical awareness, and predictive intelligence.

## 🏗️ Architecture
```
Video → Vertex AI Vision → Kafka → Flink Intelligence → Gemini AI → Commentary
```

## 🎯 Features
- ✅ Real-time event detection from video
- ✅ 8 dimensions of streaming intelligence (Flink)
- ✅ Perfect memory of player history
- ✅ Predictive commentary (anticipates events)
- ✅ Human-like emotional tone variation

## 🛠️ Tech Stack
- **Google Cloud:** Vertex AI Vision, Vertex AI Gemini, Cloud Run
- **Confluent Cloud:** Kafka + Schema Registry + Flink SQL
- **Languages:** Node.js, SQL (Flink)

## 📁 Project Structure
```
pulsecast-demo/
├── event-producer/          # Test event generator
├── commentary-generator/    # AI commentary service
└── (coming soon)
    ├── video-processor/     # Vision API integration
    ├── flink-jobs/          # Intelligence layer
    └── web-dashboard/       # React UI
```

## 🚀 Setup

1. Install dependencies:
```bash
cd event-producer && npm install
cd ../commentary-generator && npm install
```

2. Configure environment variables (see `.env.example`)

3. Run producer:
```bash
cd event-producer
node producer.js
```

4. Run commentary generator:
```bash
cd commentary-generator
node generator.js
```

## 🎓 Hackathon Project
Built for Google x Confluent Hackathon 2025