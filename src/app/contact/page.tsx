import { ContactForm } from '@/components/public/ContactForm';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Have a question, tip, or feedback? We would love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg">
              <Mail className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">contact@zalen-gam.com</p>
            </div>
            <div className="p-6 border rounded-lg">
              <Phone className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </div>
            <div className="p-6 border rounded-lg">
              <MapPin className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Address</h3>
              <p className="text-sm text-muted-foreground">
                123 News Street<br />
                New York, NY 10001
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
