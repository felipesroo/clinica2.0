import { NextResponse } from 'next/server';
import { processMessageWithAI } from '../../../../lib/openai';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // WAHA webhook structure (e.g., event: 'message.any' or 'message')
    if (body.event === 'message' || body.event === 'message.any') {
      const payload = body.payload;
      
      console.log('WAHA Webhook Payload:', JSON.stringify(payload, null, 2));

      // Ignore messages from ourselves (the bot/clinic)
      if (payload.fromMe) {
        return NextResponse.json({ success: true, ignored: 'fromMe' });
      }

      // Ignore group messages for now
      if (payload.from.includes('@g.us')) {
        return NextResponse.json({ success: true, ignored: 'group' });
      }

      let phoneStr = payload.from;
      
      // WAHA sometimes sends the LID instead of the actual phone number.
      // If it's a LID, check if there's a remoteJidAlt with the real number.
      if (phoneStr.includes('@lid') && payload._data?.key?.remoteJidAlt) {
        phoneStr = payload._data.key.remoteJidAlt;
      }

      const phone = phoneStr.replace('@c.us', '').replace('@s.whatsapp.net', '').replace('@lid', '');
      const text = payload.body;

      if (!text) {
        return NextResponse.json({ success: true, ignored: 'no_text' });
      }

      // Process message with AI Agent
      const response = await processMessageWithAI(phone, text);

      if (response) {
        // Send AI response back to WhatsApp
        await sendWhatsAppMessage(phone, response);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WAHA Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
