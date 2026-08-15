import { getSettings } from '../app/actions/settings';

/**
 * Checks with WAHA if the number exists and returns the real WhatsApp internal JID.
 * This automatically handles the Brazilian 9th digit problem.
 */
async function getRealChatId(phone: string, baseUrl: string, session: string): Promise<string> {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  
  const apiKey = process.env.WAHA_API_KEY || 'admin';

  try {
    const response = await fetch(`${baseUrl}/api/contacts/check-exists?phone=${cleaned}&session=${session}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': apiKey
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.numberExists && data.chatId) {
        return data.chatId; // The exact JID that WhatsApp expects
      }
    }
  } catch (err) {
    console.error('Failed to check number existence:', err);
  }
  
  // Fallback to basic if check fails
  return `${cleaned}@c.us`;
}

/**
 * Send a WhatsApp text message using WAHA
 */
export async function sendWhatsAppMessage(phone: string, text: string): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSettings();
    
    if (!settings?.wahaUrl || !settings?.wahaSessionName) {
      return { success: false, error: 'WAHA não está configurada (URL ou Sessão faltando).' };
    }
    
    // Normalize WAHA URL (remove trailing slash)
    const baseUrl = settings.wahaUrl.trim().replace(/\/$/, '');
    const session = settings.wahaSessionName.trim();
    const apiKey = process.env.WAHA_API_KEY || 'admin';
    
    const chatId = await getRealChatId(phone, baseUrl, session);
    
    const response = await fetch(`${baseUrl}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        chatId: chatId,
        text: text,
        session: session
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('WAHA Error:', errorText);
      return { success: false, error: `Erro na API da WAHA: ${response.status}` };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send WhatsApp message:', error);
    return { success: false, error: error?.message || 'Erro interno ao disparar mensagem.' };
  }
}
