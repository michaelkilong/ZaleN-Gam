import { Newspaper, Users, Globe, Award } from 'lucide-react';

export const metadata = {
  title: 'About Us - ZaleN-Gam',
  description: 'Learn about ZaleN-Gam, our mission, and our team.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About ZaleN-Gam</h1>

        <div className="prose max-w-none mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            ZaleN-Gam is a modern digital news platform committed to delivering accurate, 
            timely, and insightful journalism. Founded with the mission to inform and empower 
            readers, we cover everything from breaking news and politics to technology, 
            sports, and entertainment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 border rounded-lg">
            <Newspaper className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quality Journalism</h3>
            <p className="text-muted-foreground">
              Our team of experienced journalists and editors work tirelessly to bring you 
              well-researched, fact-checked stories that matter.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <Globe className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
            <p className="text-muted-foreground">
              From local events to international affairs, we provide comprehensive coverage 
              that keeps you connected to the world.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="text-muted-foreground">
              We believe in the power of community. Our platform encourages reader engagement 
              through comments, discussions, and feedback.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <Award className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Award Winning</h3>
            <p className="text-muted-foreground">
              Recognized for excellence in digital journalism, our team has received 
              numerous accolades for reporting and innovation.
            </p>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To provide unbiased, accurate, and comprehensive news coverage that empowers 
            our readers to make informed decisions. We believe in transparency, integrity, 
            and the fundamental importance of a free press in a democratic society.
          </p>
        </div>
      </div>
    </div>
  );
}
