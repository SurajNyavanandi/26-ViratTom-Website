const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
      aiClient = null;
    }
  }
  return aiClient;
}

const VIRATTOM_SYSTEM_INSTRUCTION = `You are the friendly VIRATTOM AI Assistant.

### Core Guidelines:
1. Simple Everyday English: Explain everything in clear, simple, plain English.
2. Short & Minimalistic: Keep responses concise and warm.
3. Friendly & Decisive: Answer with confidence about web development, app development, pricing, and timelines.
4. About VIRATTOM:
   - We design and build clean, fast Websites and Mobile Apps (iPhone & Android).
   - Simple Websites usually take 2 to 3 weeks.
   - Custom Web Platforms usually take 4 to 6 weeks.
   - Mobile Apps usually take around 8 weeks.
   - We also have a free Resume Builder tool on the site (/resume) and a Client Portal (/client-login).
   - To get started, users can fill out the Start a Project form.
`;

function generateSimpleFallbackResponse(userMessage) {
  const query = userMessage.toLowerCase().trim();

  if (query.includes('restaurant') || query.includes('food') || query.includes('ordering') || query.includes('menu')) {
    return `Yes, we can definitely build that!\n\nWe build custom mobile apps and website ordering systems for restaurants:\n- Digital Menu\n- Online Ordering & Payments\n- Order Tracking\n- Manager Dashboard\n\nTimeline: Around 6 to 8 weeks.`;
  }

  if (query.includes('ecommerce') || query.includes('e-commerce') || query.includes('shop') || query.includes('store') || query.includes('sell')) {
    return `Yes! We create clean, fast online stores where you can sell your products easily.\n\n- Product Catalog\n- Easy Checkout\n- Order Management\n\nTimeline: Usually 3 to 5 weeks for an online store, or 6 to 8 weeks with a mobile app.`;
  }

  if (query.includes('clinic') || query.includes('doctor') || query.includes('hospital') || query.includes('appointment')) {
    return `Yes, we have ready experience building clinic and doctor portals!\n\n- Online Booking\n- Patient Records\n- Clinic Dashboard\n\nTimeline: Usually 2 to 4 weeks.`;
  }

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('package') || query.includes('budget') || query.includes('quote') || query.includes('fee') || query.includes('how much')) {
    return `We offer simple pricing based on what you need:\n\n1. Starter Website (₹25,000 – ₹60,000)\n2. Custom Web App (₹75,000 – ₹2,50,000)\n3. Mobile App (₹1,50,000+)\n\nTo get an exact quote, fill out the Start a Project form on the homepage.`;
  }

  if (query.includes('how long') || query.includes('duration') || query.includes('timeline') || query.includes('time') || query.includes('delivery')) {
    return `Typical timelines:\n\n- Simple Website: 2 to 3 weeks\n- Custom Web Platform: 4 to 6 weeks\n- Mobile App: ~8 weeks`;
  }

  if (query.includes('service') || query.includes('what do you do') || query.includes('what can you do') || query.includes('offer')) {
    return `At VIRATTOM, we help businesses launch modern digital products:\n\n- Websites\n- Mobile Apps\n- UI/UX Design\n- Free Resume Builder\n\nWhat do you want to build?`;
  }

  if (query.includes('mobile vs web') || query.includes('app or web') || query.includes('which should i build')) {
    return `Simple advice:\n\n- Choose a Website first if you want faster launch and lower budget.\n- Choose a Mobile App if you need push notifications, GPS, or camera access.\n\nMost businesses start with a website first.`;
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('good morning') || query.includes('good evening')) {
    return `Hello! 👋 How can I help you today? Feel free to ask about websites, mobile apps, pricing, or getting started!`;
  }

  if (query.includes('thank') || query.includes('thanks') || query.includes('awesome') || query.includes('great') || query.includes('cool')) {
    return `You’re very welcome! 😊 Feel free to ask if you have any more questions.`;
  }

  if (query.includes('contact') || query.includes('phone') || query.includes('start') || query.includes('hire') || query.includes('reach')) {
    return `Starting a project is easy! 🚀\n\nJust fill out the Start a Project form on the homepage with your name, phone number, and project idea.`;
  }

  return `At VIRATTOM, we design and develop clean, high-performance Websites and Mobile Apps for businesses.\n\nFeel free to ask me about:\n- Building your website or mobile app\n- Pricing and delivery timelines\n- How to get started\n\nWhat idea are you looking to bring to life?`;
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
      try {
        const contents = [];

        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item && item.text && typeof item.text === 'string') {
              contents.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: item.text }],
              });
            }
          }
        }

        contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });

        const apiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: VIRATTOM_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AI generation timeout')), 7000);
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        const replyText = response && response.text ? response.text : '';

        if (replyText.trim()) {
          return res.json({ reply: replyText.trim(), source: 'gemini' });
        }
      } catch (geminiError) {
        console.warn('Gemini API call bypassed or timed out, using simple fallback:', geminiError && geminiError.message ? geminiError.message : geminiError);
      }
    }

    const fallbackText = generateSimpleFallbackResponse(trimmedMessage);
    return res.json({ reply: fallbackText, source: 'intelligent_engine' });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      reply: "I'm right here to help! Could you please repeat that question or let me know what you'd like to build?",
      source: 'recovery',
    });
  }
};

module.exports = { handleAssistantChat };
