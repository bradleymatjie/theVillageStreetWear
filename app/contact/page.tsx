'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Send, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
}

type FormStatus = '' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<FormStatus>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      setStatus('error');
      setError((err as Error).message || 'Something went wrong. Please try again.');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            GET IN TOUCH
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Form - Priority */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-8 text-center">SEND US A MESSAGE</h2>
          
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2">
                  NAME *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2">
                  EMAIL *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-bold mb-2">
                SUBJECT *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold mb-2">
                MESSAGE *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                placeholder="Tell us more..."
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === 'sending'}
              className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'sending' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  SENDING...
                </>
              ) : (
                <>
                  SEND MESSAGE
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error || 'Failed to send message. Please try again.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="p-3 bg-black/5 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Email</h3>
              <a href="mailto:thevillagestreetwear@gmail.com" className="text-gray-600 hover:text-black transition-colors text-sm">
                thevillagestreetwear@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="p-3 bg-black/5 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Location</h3>
              <p className="text-gray-600 text-sm">
                Johannesburg, Gauteng<br />
                South Africa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section with Accordion */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black mb-8 text-center">FREQUENTLY ASKED QUESTIONS</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-white border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                What are your shipping times?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We typically process orders within 2-3 business days. Delivery takes 3-5 business days within South Africa.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                Do you ship internationally?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                No, we only ship within South Africa.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                What's your return policy?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We accept returns within 3 days of delivery for unworn items with original tags attached.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-bold hover:no-underline">
                How can I track my order?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Once your order ships, you'll receive a tracking number via email to monitor your delivery.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}