const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
      aiClient = null;
    }
  }
  return aiClient;
}

const VIRATTOM_SYSTEM_INSTRUCTION = `You are the official AI Assistant for ViratTom (virattom.com), a web and mobile application engineering agency.

Core Guidelines:
1. Minimalistic & Direct: Give concise, high-value answers. Keep responses to 1 to 3 short sentences or concise bullet points. Avoid filler words, boilerplate greetings, and lengthy disclaimers.
2. Dynamic & Knowledgeable: Answer any questions regarding web development, mobile apps, tech stacks, architecture, pricing, and timelines accurately.
3. Agency Facts:
   - Services: High-performance Websites, Custom Web Applications (React, Node.js, TypeScript, Next/Vite), and Mobile Apps (iOS & Android).
   - Commercial Model: 20% initial advance to initiate development; live milestone tracking via the Client Portal; remaining 80% balance due upon final delivery.
   - Indicative Pricing:
     * Starter Website: ₹25,000 – ₹60,000 (2–3 weeks)
     * Custom Web Platform: ₹75,000 – ₹2,50,000 (4–6 weeks)
     * Mobile Apps: ₹1,50,000+ (~8 weeks)
   - Features: Homepage "Start a Project" inquiry form, Client Workspace Portal (/client-login), Free ATS Resume Builder (/resume).
4. Calls-to-action: Suggest submitting the Start a Project form on the homepage or reaching out via WhatsApp for custom scopes.`;

function generateSimpleFallbackResponse(userMessage) {
  const query = userMessage.toLowerCase().trim();

  if (query.includes('restaurant') || query.includes('food') || query.includes('ordering') || query.includes('menu')) {
    return `We engineer custom restaurant platforms with digital menus, online ordering, payment gateways, and manager dashboards in 4 to 6 weeks.`;
  }

  if (query.includes('ecommerce') || query.includes('e-commerce') || query.includes('shop') || query.includes('store') || query.includes('sell')) {
    return `We develop high-performance e-commerce stores with product catalogs, secure checkout, and inventory tracking in 3 to 5 weeks for web, or 6 to 8 weeks with a mobile app.`;
  }

  if (query.includes('clinic') || query.includes('doctor') || query.includes('hospital') || query.includes('appointment')) {
    return `We build healthcare and clinic portals featuring online booking, patient records, and doctor scheduling in 3 to 4 weeks.`;
  }

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('budget') || query.includes('quote') || query.includes('how much')) {
    return `Indicative pricing:\n- Starter Website: ₹25,000 – ₹60,000 (2–3 weeks)\n- Custom Web App: ₹75,000 – ₹2,50,000 (4–6 weeks)\n- Mobile App: ₹1,50,000+ (~8 weeks)\n\nDevelopment begins with a 20% advance milestone booking.`;
  }

  if (query.includes('how long') || query.includes('duration') || query.includes('timeline') || query.includes('time') || query.includes('delivery')) {
    return `Standard delivery timelines:\n- Websites: 2 to 3 weeks\n- Custom Web Platforms: 4 to 6 weeks\n- Mobile Apps: 6 to 8 weeks`;
  }

  if (query.includes('service') || query.includes('what do you do') || query.includes('what can you do') || query.includes('offer')) {
    return `ViratTom specializes in custom web applications, high-performance business websites, iOS/Android mobile apps, and UI/UX engineering.`;
  }

  if (query.includes('mobile vs web') || query.includes('app or web')) {
    return `A website allows for faster launch and lower upfront investment. A mobile app is recommended when you need device features (push alerts, GPS, camera). Most clients start on web and expand to mobile.`;
  }

  if (query.includes('advance') || query.includes('milestone') || query.includes('payment') || query.includes('terms')) {
    return `We follow a 20% advance milestone model to kick off development and grant client portal access; the remaining 80% is paid upon delivery and satisfaction.`;
  }

  if (query.includes('resume')) {
    return `Our ATS-compliant resume builder is free to use anytime at /resume, complete with live preview and instant PDF export.`;
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return `Hello! How can I help you with your website or mobile app project today?`;
  }

  if (query.includes('thank') || query.includes('thanks') || query.includes('great') || query.includes('cool')) {
    return `You're welcome! Feel free to ask any other questions or submit a project inquiry on the homepage.`;
  }

  if (query.includes('contact') || query.includes('phone') || query.includes('start') || query.includes('hire') || query.includes('reach') || query.includes('whatsapp')) {
    return `You can initiate a project via the "Start a Project" form on our homepage or chat directly with our team on WhatsApp.`;
  }

  return `ViratTom designs and builds high-performance Websites and Mobile Apps with a 20% advance milestone model. Feel free to ask about tech stacks, pricing, or delivery schedules.`;
}

const handleAssistantChat = async (req, res) => {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmedMessage = message.trim();
    const ai = getAiClient();

    if (ai) {
      const contents = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text && typeof item.text === 'string' && item.text.trim()) {
            const role = item.role === 'user' ? 'user' : 'model';
            if (contents.length > 0 && contents[contents.length - 1].role === role) {
              contents[contents.length - 1].parts[0].text += `\n${item.text.trim()}`;
            } else {
              contents.push({
                role,
                parts: [{ text: item.text.trim() }],
              });
            }
          }
        }
      }

      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n${trimmedMessage}`;
      } else {
        contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });
      }

      // Model priority list: primary gemini-3.8-flash, failover to gemini-3.1-flash-lite or gemini-flash-latest
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

      for (const modelName of candidateModels) {
        try {
          const apiPromise = ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: VIRATTOM_SYSTEM_INSTRUCTION,
              temperature: 0.5,
            },
          });

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI generation timeout')), 7000);
          });

          const response = await Promise.race([apiPromise, timeoutPromise]);
          const replyText = response && response.text ? response.text.trim() : '';

          if (replyText) {
            return res.json({ reply: replyText, source: 'gemini' });
          }
        } catch (err) {
          // Check for transient 503 high demand or 429 quota spikes
          const status = err?.status || err?.code || (err?.error && err.error.code);
          const isHighDemand = status === 503 || status === 'UNAVAILABLE' || (err?.message && err.message.includes('high demand'));
          
          if (isHighDemand) {
            // Silently try next candidate model
            continue;
          }
          // If another non-demand error, break and use knowledge fallback
          break;
        }
      }
    }

    const fallbackText = generateSimpleFallbackResponse(trimmedMessage);
    return res.json({ reply: fallbackText, source: 'knowledge_engine' });
  } catch (error) {
    return res.status(200).json({
      reply: "ViratTom engineers high-performance websites and mobile apps. How can we help with your project?",
      source: 'recovery',
    });
  }
};

module.exports = { handleAssistantChat };
