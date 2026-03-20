# HealthAI SaaS v3.0
## AI Agent for ANY Healthcare Provider

One codebase. Unlimited clients. Sell to any clinic, hospital, or practice.

---

## Quick Start

```bash
cp .env.example .env        # add your GROQ_API_KEY
npm install
node server.js
```

Open: http://localhost:3000

---

## Client Types Included

| Client File | Type | Assistant |
|---|---|---|
| brightsmile-dental.js | Dental Clinic | Aria |
| kensington-gp.js | GP Surgery | Sophie |
| london-private-hospital.js | Private Hospital | Victoria |

Switch between them using the buttons at the top of the app.

---

## Add a New Client (5 minutes)

1. Copy `clients/brightsmile-dental.js`
2. Rename: `clients/your-clinic-id.js`
3. Fill in: name, address, hours, services, prices, booking link
4. Add button in `public/index.html` client bar
5. Restart server

Works for: dental, GP, hospital, physio, optician, pharmacy, mental health, vet

---

## What the AI can do

- Answer any question about the business (hours, prices, services, insurance)
- Search the web for NHS guidelines, health advice, current info
- Remember patient name, phone, email, concern throughout the call
- Book appointments (sends correct link based on urgency)
- Send email confirmations and escalation alerts
- Create follow-up tasks for reception
- Escalate to human with full conversation summary
- Voice: British English text-to-speech + speech recognition

---

## Channels

| Channel | Status | Setup needed |
|---|---|---|
| Web Chat | ✅ Works now | None |
| Voice (browser) | ✅ Works now | Chrome required |
| WhatsApp | ⚙️ Add Twilio | TWILIO_* in .env |
| Phone calls | ⚙️ Add Twilio | TWILIO_* in .env |

---

## API Keys

| Key | Where to get | Cost |
|---|---|---|
| GROQ_API_KEY | console.groq.com | FREE |
| OPENAI_API_KEY | platform.openai.com | ~$5/month |
| SERPAPI_KEY | serpapi.com | Free 100/month |
| EMAIL_USER | Gmail App Password | Free |
| TWILIO_* | twilio.com | ~$15/month |

---

## Deploy to Railway

```bash
# 1. Push to GitHub
# 2. New Railway project → Deploy from GitHub
# 3. Add env vars (GROQ_API_KEY minimum)
# 4. Done — get public URL
```

---

## Business Model

| Plan | Monthly Price | What's included |
|---|---|---|
| Starter | £99/mo | Web chat only, 1 clinic |
| Professional | £249/mo | Web + Voice + WhatsApp |
| Enterprise | £599/mo | Everything + multi-location + analytics |

Your cost per client: ~£5-15/month (AI + hosting)
Your revenue: £99-599/month
**Margin: 90%+**
