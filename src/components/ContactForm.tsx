import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have suggestions for new AI tools? Questions about our resources? 
          We'd love to hear from you and improve our platform for all GLU students.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="text-orange-600" size={20} />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin className="text-green-600 mt-1 flex-shrink-0" size={16} />
                <div>
                  <p className="font-medium text-gray-800">Address</p>
                  <p className="text-gray-600 text-sm">
                    Grafisch Lyceum Utrecht<br />
                    Vondellaan 178<br />
                    3521 GH Utrecht
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                <div>
                  <p className="font-medium text-gray-800">Phone</p>
                  <p className="text-gray-600 text-sm">030 - 280 95 50</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="text-purple-600 mt-1 flex-shrink-0" size={16} />
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-gray-600 text-sm">info@glu.nl</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-800 mb-3">Quick Suggestions</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">• Suggest new AI tools for your subject</p>
                  <p className="text-sm text-gray-600">• Report outdated or broken tool links</p>
                  <p className="text-sm text-gray-600">• Request tutorials or guides</p>
                  <p className="text-sm text-gray-600">• Share your experience with AI tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@student.glu.nl"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your suggestion, question, or feedback..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send size={16} />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}