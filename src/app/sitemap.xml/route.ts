import { NextResponse } from "next/server";
import { getOpportunities } from "@/services/database";

export async function GET() {
  try {
    const opportunities = await getOpportunities();

    const opportunityUrls = opportunities.map(opportunity => ({
      url: `https://skillgrowthnavigator.com/opportunities/${opportunity.id}`,
      lastModified: new Date(opportunity.updatedAt.seconds * 1000),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const staticUrls = [
      {
        url: 'https://skillgrowthnavigator.com',
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 1,
      },
      {
        url: 'https://skillgrowthnavigator.com/opportunities',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: 'https://skillgrowthnavigator.com/login',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: 'https://skillgrowthnavigator.com/signup',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];

    const allUrls = [...staticUrls, ...opportunityUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allUrls.map(url => `
          <url>
            <loc>${url.url}</loc>
            <lastmod>${url.lastModified.toISOString()}</lastmod>
            <changefreq>${url.changeFrequency}</changefreq>
            <priority>${url.priority}</priority>
          </url>
        `).join('')}
      </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}