import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
function getOAuthClient() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://agenda.drajordanefaria.com/api/auth/google/callback';
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export async function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force to get refresh token
  });
}

export async function authorizeWithCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (tokens.refresh_token) {
    // Save to settings
    await prisma.configuracao.update({
      where: { id: "1" },
      data: { googleRefreshToken: tokens.refresh_token }
    });
  }
}

async function getAuthorizedCalendar() {
  const settings = await prisma.configuracao.findUnique({ where: { id: "1" } });
  if (!settings?.googleRefreshToken) {
    return null;
  }
  
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    refresh_token: settings.googleRefreshToken
  });
  
  return google.calendar({ version: 'v3', auth: client });
}

export async function syncEventToGoogle(appointmentData: any) {
  try {
    const calendar = await getAuthorizedCalendar();
    if (!calendar) return null;

    // Convert date and time to RFC3339
    const startDateTime = new Date(`${appointmentData.date}T${appointmentData.startTime}:00-03:00`);
    const endDateTime = new Date(startDateTime.getTime() + appointmentData.duration * 60000);

    const event = {
      summary: `*${appointmentData.service} - ${appointmentData.patientName || 'Paciente'}`,
      description: `Agendamento gerado automaticamente pelo sistema da Clínica.`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
    };

    if (appointmentData.googleEventId) {
      // Update
      const res = await calendar.events.update({
        calendarId: 'primary',
        eventId: appointmentData.googleEventId,
        requestBody: event,
      });
      return res.data.id;
    } else {
      // Insert
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return res.data.id;
    }
  } catch (error) {
    console.error("Error syncing with Google Calendar", error);
    return null;
  }
}

export async function deleteEventFromGoogle(eventId: string) {
  try {
    const calendar = await getAuthorizedCalendar();
    if (!calendar) return;

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  } catch (error) {
    console.error("Error deleting from Google Calendar", error);
  }
}

export async function fetchExternalGoogleEvents(timeMin: string, timeMax: string) {
  try {
    const calendar = await getAuthorizedCalendar();
    if (!calendar) return [];

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items || [];
    
    // We only want external events. How do we know if it's from our app?
    // Events created by our app have 'description: Agendamento gerado automaticamente pelo sistema da Clínica.'
    // This is a simple heuristic. A better way is filtering out those whose IDs are in our database.
    // For now, we will return all events, and let the caller filter out the ones already in the DB.
    
    return events.map(event => {
      // Find start and end date times
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      
      return {
        googleEventId: event.id,
        summary: event.summary,
        description: event.description,
        start,
        end
      };
    }).filter(e => e.start && e.end);
    
  } catch (error) {
    console.error("Error fetching Google Calendar events", error);
    return [];
  }
}
