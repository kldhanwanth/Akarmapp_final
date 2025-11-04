export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  status: string;
}

class GoogleCalendarService {
  // Demo credentials - Replace with your actual Google Calendar API credentials
  private accessToken: string | null = 'ya29.a0ATi6K2tYssTI4AYIkt6HGQw2RAZ3E2ff_69fob4O507JBURUI6_1pAO8oI62G1dtqXkYwO13FhNmtSFh2mNIzCJMkvUP2c8unyWBvPtUFyEeklF0K2TJbbVPNgBY62tFStkpjWVgL4cyjd56R8yg-VwnMqthHaUlGxLUO7yrh6P3a7nsrKwRBTlAykaMGqWnLjYnfykaCgYKAU8SARMSFQHGX2Miz_ZV1VtwegoygMHnkveQJA0206';
  private refreshToken: string | null = null;
  private clientId: string = '407408718192.apps.googleusercontent.com';
  private clientSecret: string = '************&scope=&grant_type=authorization_code';

  // Legacy methods for backward compatibility
  setCredentials(clientId: string, clientSecret: string) {
    console.log('Using hardcoded credentials for demo purposes');
    // Credentials are now hardcoded above
  }

  setTokens(accessToken: string, refreshToken?: string) {
    console.log('Using hardcoded tokens for demo purposes');
    // Tokens are now hardcoded above
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  }

  async getTodaysEvents(): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      console.warn('No access token available for Google Calendar');
      return this.getMockEvents(); // Return mock events for demo
    }

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const timeMin = startOfDay.toISOString();
      const timeMax = endOfDay.toISOString();

      let response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      // If unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
              },
            }
          );
        } else {
          return this.getMockEvents();
        }
      }

      const data = await response.json();
      return data.items || [];
      
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return this.getMockEvents();
    }
  }

  private getMockEvents(): CalendarEvent[] {
    // Mock events for demo purposes
    const now = new Date();
    const events: CalendarEvent[] = [];

    // Morning meeting
    const meeting = new Date(now);
    meeting.setHours(9, 0, 0, 0);
    events.push({
      id: 'mock-1',
      summary: 'Team Standup Meeting',
      description: 'Daily team sync and planning',
      start: {
        dateTime: meeting.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(meeting.getTime() + 30 * 60 * 1000).toISOString(),
        timeZone: 'America/New_York',
      },
      location: 'Conference Room A',
      status: 'confirmed',
    });

    // Lunch
    const lunch = new Date(now);
    lunch.setHours(12, 30, 0, 0);
    events.push({
      id: 'mock-2',
      summary: 'Lunch with Client',
      description: 'Project discussion over lunch',
      start: {
        dateTime: lunch.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(lunch.getTime() + 90 * 60 * 1000).toISOString(),
        timeZone: 'America/New_York',
      },
      location: 'Downtown Restaurant',
      status: 'confirmed',
    });

    // Afternoon appointment
    const appointment = new Date(now);
    appointment.setHours(15, 0, 0, 0);
    events.push({
      id: 'mock-3',
      summary: 'Doctor Appointment',
      start: {
        dateTime: appointment.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(appointment.getTime() + 45 * 60 * 1000).toISOString(),
        timeZone: 'America/New_York',
      },
      location: 'Medical Center',
      status: 'confirmed',
    });

    return events;
  }

  generateCalendarScript(events: CalendarEvent[]): string {
    if (events.length === 0) {
      return "Good morning! You have no scheduled events for today. Enjoy your free day!";
    }

    const currentTime = new Date();
    let script = "Good morning! Here's your schedule for today:\n\n";

    events.forEach((event, index) => {
      const startTime = new Date(event.start.dateTime || event.start.date || '');
      const endTime = new Date(event.end.dateTime || event.end.date || '');
      
      const timeString = event.start.dateTime 
        ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'All day';

      script += `${index + 1}. ${event.summary}`;
      
      if (timeString !== 'All day') {
        script += ` at ${timeString}`;
      }
      
      if (event.location) {
        script += ` in ${event.location}`;
      }
      
      if (event.description) {
        script += ` - ${event.description}`;
      }
      
      script += '\n';

      // Add urgency for upcoming events
      const timeDiff = startTime.getTime() - currentTime.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);
      
      if (hoursUntil > 0 && hoursUntil <= 2) {
        script += `   ⚠️ This event is coming up in ${Math.round(hoursUntil * 60)} minutes!\n`;
      }
      
      script += '\n';
    });

    script += "Have a productive day!";
    return script;
  }

  async getUrgentEvents(): Promise<CalendarEvent[]> {
    const allEvents = await this.getTodaysEvents();
    const currentTime = new Date();
    const twoHoursFromNow = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);

    return allEvents.filter(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date || '');
      return eventStart <= twoHoursFromNow && eventStart > currentTime;
    });
  }

  async hasEarlyMorningEvents(): Promise<boolean> {
    const events = await this.getTodaysEvents();
    const earlyMorningCutoff = new Date();
    earlyMorningCutoff.setHours(10, 0, 0, 0); // Events before 10 AM

    return events.some(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date || '');
      return eventStart <= earlyMorningCutoff;
    });
  }

  formatTimeUntilNextEvent(): string {
    // This would be used by Gemini to determine snooze patterns
    // based on upcoming calendar events
    return "Implementation pending";
  }
}

export const googleCalendarService = new GoogleCalendarService();