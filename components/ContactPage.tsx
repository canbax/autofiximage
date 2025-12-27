import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './Button';

// Character limits matching the backend
const LIMITS = {
  name: { min: 2, max: 100 },
  email: { min: 5, max: 254 },
  message: { min: 10, max: 2000 },
};

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState(''); // Bot protection honeypot field
  const [formTimestamp, setFormTimestamp] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set timestamp when form mounts for bot protection
  useEffect(() => {
    setFormTimestamp(Date.now());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Enforce character limits on input
    if (name === 'name' && value.length > LIMITS.name.max) return;
    if (name === 'email' && value.length > LIMITS.email.max) return;
    if (name === 'message' && value.length > LIMITS.message.max) return;

    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          honeypot, // Include honeypot for bot detection
          timestamp: formTimestamp, // Include timestamp for timing-based bot detection
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in text-center">
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">{t('contact.formSuccessTitle')}</h2>
          <p>{t('contact.formSuccessBody')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t('contact.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('contact.subtitle')}</p>
      </div>
      <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field for bot protection - hidden from real users */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              name="website"
              id="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('contact.nameLabel')}</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formData.name.length}/{LIMITS.name.max}</span>
            </div>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={LIMITS.name.min}
              maxLength={LIMITS.name.max}
              className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('contact.emailLabel')}</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={LIMITS.email.max}
              className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('contact.messageLabel')}</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formData.message.length}/{LIMITS.message.max}</span>
            </div>
            <textarea
              name="message"
              id="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              minLength={LIMITS.message.min}
              maxLength={LIMITS.message.max}
              className="mt-1 block w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('contact.messageMinChars', { min: LIMITS.message.min })}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading} variant="primary">
              {t('contact.sendButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
