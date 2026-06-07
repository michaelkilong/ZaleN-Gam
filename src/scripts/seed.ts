import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/lib/db/mongoose';
import { StaffUser, hashPassword } from './src/lib/db/models/StaffUser';
import { Article } from './src/lib/db/models/Article';
import { Category } from './src/lib/db/models/Category';
import { SiteSetting } from './src/lib/db/models/SiteSetting';
import slugify from 'slugify';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected!');

    // Clear existing data
    await StaffUser.deleteMany({});
    await Article.deleteMany({});
    await Category.deleteMany({});
    await SiteSetting.deleteMany({});

    console.log('Cleared existing data');

    // Create SUPER_ADMIN
    const superAdminPassword = await hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'admin123456');
    const superAdmin = await StaffUser.create({
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@zalen-gam.com',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: false,
    });
    console.log('Created SUPER_ADMIN:', superAdmin.name);

    // Create demo staff users
    const adminPassword = await hashPassword('admin123456');
    const admin = await StaffUser.create({
      name: 'Demo Admin',
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: false,
      createdBy: superAdmin._id,
    });

    const editorPassword = await hashPassword('editor123456');
    const editor = await StaffUser.create({
      name: 'Demo Editor',
      email: 'editor@demo.com',
      passwordHash: editorPassword,
      role: 'EDITOR',
      isActive: true,
      mustChangePassword: false,
      createdBy: superAdmin._id,
    });

    const authorPassword = await hashPassword('author123456');
    const author = await StaffUser.create({
      name: 'Demo Author',
      email: 'author@demo.com',
      passwordHash: authorPassword,
      role: 'AUTHOR',
      isActive: true,
      mustChangePassword: false,
      createdBy: superAdmin._id,
    });

    console.log('Created demo staff users');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Politics', slug: 'politics', description: 'Political news and analysis' },
      { name: 'Technology', slug: 'technology', description: 'Tech news, reviews, and innovation' },
      { name: 'Sports', slug: 'sports', description: 'Sports coverage and highlights' },
      { name: 'Entertainment', slug: 'entertainment', description: 'Movies, TV, music, and culture' },
      { name: 'Business', slug: 'business', description: 'Business and financial news' },
    ]);
    console.log('Created 5 categories');

    // Create site settings
    await SiteSetting.insertMany([
      { key: 'site_name', value: 'ZaleN-Gam' },
      { key: 'site_description', value: 'Your trusted source for breaking news and analysis' },
      { key: 'contact_email', value: 'contact@zalen-gam.com' },
    ]);
    console.log('Created 3 site settings');

    // Create sample articles
    const sampleArticles = [
      {
        title: 'Global Markets Rally as Inflation Data Shows Improvement',
        slug: 'global-markets-rally-inflation-data-improvement',
        content: `<p>The global financial markets experienced a significant rally today as the latest inflation data showed promising signs of improvement across major economies.</p>
        <p>Analysts at major investment banks noted that the Consumer Price Index (CPI) data released this morning came in below expectations, suggesting that central banks may be nearing the end of their aggressive rate-hiking cycles.</p>
        <h2>Market Response</h2>
        <p>The S&P 500 surged 2.3% in early trading, while European markets posted similar gains. The tech-heavy Nasdaq Composite led the charge with a 3.1% advance.</p>
        <blockquote>"This is exactly the kind of data the market has been waiting for," said Sarah Chen, chief economist at Global Financial Advisors.</blockquote>
        <p>Investors are now pricing in a higher probability of rate cuts beginning in the second quarter of next year, a shift that has boosted growth-oriented sectors.</p>`,
        excerpt: 'Global markets surge as inflation data comes in below expectations, fueling hopes for an end to rate hikes.',
        categoryId: categories[4]._id, // Business
        authorId: editor._id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-15'),
        views: 15420,
        tags: ['markets', 'inflation', 'economy', 'finance'],
      },
      {
        title: 'Revolutionary AI Chip Promises 10x Performance Boost',
        slug: 'revolutionary-ai-chip-10x-performance-boost',
        content: `<p>A breakthrough in semiconductor technology has been announced today, with researchers unveiling a new AI accelerator chip that promises to deliver up to 10 times the performance of current generation hardware.</p>
        <h2>The Technology</h2>
        <p>The new chip, developed by a consortium of university researchers and industry partners, uses a novel architecture that fundamentally rethinks how neural network computations are processed.</p>
        <p>Unlike traditional GPUs that process data in parallel streams, this new design uses a mesh-based approach that allows for more efficient data movement and reduced latency.</p>
        <blockquote>"This represents a paradigm shift in how we approach AI hardware," said Dr. James Morrison, lead researcher at the Advanced Computing Institute.</blockquote>
        <p>Industry experts estimate that if successfully commercialized, the technology could reduce the cost of training large language models by up to 80%.</p>`,
        excerpt: 'Researchers unveil a groundbreaking AI chip architecture that could deliver 10x performance improvements over current hardware.',
        categoryId: categories[1]._id, // Technology
        authorId: editor._id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-14'),
        views: 23100,
        tags: ['AI', 'semiconductors', 'technology', 'innovation'],
      },
      {
        title: 'Championship Final: Underdogs Stun Defending Champions',
        slug: 'championship-final-underdogs-stun-champions',
        content: `<p>In one of the most stunning upsets in recent sports history, the underdog team clinched the championship title last night, defeating the heavily favored defending champions in a dramatic overtime finish.</p>
        <h2>The Match</h2>
        <p>The game was a nail-biter from start to finish, with both teams trading blows throughout the regulation period. The underdogs, who had finished the regular season with a losing record, showed incredible resilience.</p>
        <p>With just 30 seconds remaining in overtime, rookie striker Maria Gonzalez scored the winning goal, sending the crowd into a frenzy and cementing her place in sports history.</p>
        <blockquote>"Nobody believed in us, but we believed in each other," said team captain David Park in the post-game interview.</blockquote>
        <p>The victory marks the first championship for the franchise in its 25-year history and has already sparked celebrations across the city.</p>`,
        excerpt: 'In a stunning upset, the underdog team defeats the defending champions in a dramatic overtime championship final.',
        categoryId: categories[2]._id, // Sports
        authorId: author._id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-13'),
        views: 18900,
        tags: ['sports', 'championship', 'upset', 'football'],
      },
      {
        title: 'New Climate Agreement Reached at International Summit',
        slug: 'new-climate-agreement-international-summit',
        content: `<p>After two weeks of intense negotiations, world leaders have reached a landmark climate agreement that sets more ambitious targets for carbon emission reductions and establishes a new framework for climate financing.</p>
        <h2>Key Provisions</h2>
        <p>The agreement, dubbed the "Green Accord 2024," commits signatory nations to achieving net-zero emissions by 2040, a decade earlier than previously agreed targets.</p>
        <p>Developed nations have pledged to increase climate financing for developing countries to $200 billion annually by 2030, up from the previous $100 billion commitment.</p>
        <blockquote>"This is the most significant climate agreement since Paris 2015," said UN Secretary-General in his closing remarks.</blockquote>
        <p>Environmental groups have cautiously welcomed the agreement but emphasize that implementation and accountability will be crucial.</p>`,
        excerpt: 'World leaders reach a landmark climate agreement with more ambitious emission targets and increased financing for developing nations.',
        categoryId: categories[0]._id, // Politics
        authorId: editor._id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-12'),
        views: 12500,
        tags: ['climate', 'politics', 'environment', 'summit'],
      },
      {
        title: 'Blockbuster Film Breaks Opening Weekend Records',
        slug: 'blockbuster-film-breaks-opening-weekend-records',
        content: `<p>The highly anticipated sci-fi epic "Galactic Frontier" has shattered box office records, earning $380 million globally during its opening weekend, making it the biggest debut in cinema history.</p>
        <h2>Critical Reception</h2>
        <p>The film, directed by acclaimed filmmaker Elena Vasquez, has received widespread critical acclaim for its groundbreaking visual effects and compelling storytelling.</p>
        <p>Review aggregator Rotten Tomatoes shows a 94% critic score and a 98% audience score, indicating broad appeal across demographics.</p>
        <blockquote>"This is cinema at its absolute finest," wrote critic Robert Thompson. "Vasquez has created something truly special."</blockquote>
        <p>Industry analysts predict the film could cross the $2 billion mark globally, potentially challenging the all-time box office records.</p>`,
        excerpt: '"Galactic Frontier" shatters global box office records with a $380 million opening weekend, earning critical acclaim.',
        categoryId: categories[3]._id, // Entertainment
        authorId: author._id,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-11'),
        views: 31200,
        tags: ['movies', 'entertainment', 'box office', 'film'],
      },
    ];

    await Article.insertMany(sampleArticles);
    console.log('Created 5 sample published articles');

    console.log('\n=== SEED COMPLETE ===');
    console.log('\nDemo Credentials:');
    console.log('Super Admin: name="' + (process.env.SUPER_ADMIN_NAME || 'Super Admin') + '", password="' + (process.env.SUPER_ADMIN_PASSWORD || 'admin123456') + '"');
    console.log('Admin: name="Demo Admin", password="admin123456"');
    console.log('Editor: name="Demo Editor", password="editor123456"');
    console.log('Author: name="Demo Author", password="author123456"');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
