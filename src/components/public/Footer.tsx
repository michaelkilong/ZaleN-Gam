import Link from 'next/link';
import { Newspaper, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Newspaper className="h-6 w-6" />
              <span className="text-xl font-bold">ZaleN-Gam</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted source for breaking news, in-depth analysis, and compelling stories from around the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/politics" className="hover:text-foreground">Politics</Link></li>
              <li><Link href="/category/technology" className="hover:text-foreground">Technology</Link></li>
              <li><Link href="/category/sports" className="hover:text-foreground">Sports</Link></li>
              <li><Link href="/category/entertainment" className="hover:text-foreground">Entertainment</Link></li>
              <li><Link href="/category/business" className="hover:text-foreground">Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ZaleN-Gam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
