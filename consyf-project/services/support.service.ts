const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface SupportTicket {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class SupportService {
  async getFAQ(category?: string): Promise<FAQ[]> {
    let url = `${API_URL}/api/support/faq`;
    if (category) {
      url += `?category=${category}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get FAQ');
    }

    const data = await response.json();
    return data.faqs;
  }

  async createTicket(ticketData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<number> {
    const response = await fetch(`${API_URL}/api/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error('Failed to create support ticket');
    }

    const result = await response.json();
    return result.ticketId;
  }

  async getMyTickets(): Promise<SupportTicket[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/support/tickets/me`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get tickets');
    }

    const data = await response.json();
    return data.tickets;
  }

  async getTicketById(ticketId: number, email?: string): Promise<SupportTicket> {
    let url = `${API_URL}/api/support/tickets/${ticketId}`;
    if (email) {
      url += `?email=${email}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get ticket');
    }

    const data = await response.json();
    return data.ticket;
  }

  async updateTicket(ticketId: number, updates: {
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update ticket');
    }
  }

  async createFAQ(data: Partial<FAQ>): Promise<number> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/support/faq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create FAQ');
    }

    const result = await response.json();
    return result.faqId;
  }
}

export default new SupportService();
