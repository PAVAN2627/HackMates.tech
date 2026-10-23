import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
}

const DEFAULT_TITLE = "HackMates | Student Hackathon & Developer Community";
const DEFAULT_DESC =
  "HackMates is a student developer community in India. Join hackathons, build real-world AI and full-stack projects, and collaborate with passionate engineers.";
const BASE_URL = "https://hackmates.tech";

export function useSEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    const finalTitle = title ? `${title} | HackMates` : DEFAULT_TITLE;
    const finalDesc = description || DEFAULT_DESC;
    const finalCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    // Document Title
    document.title = finalTitle;

    // Helper to update meta tag content
    const updateMeta = (selector: string, content: string) => {
      let tag = document.querySelector(selector);
      if (tag) {
        tag.setAttribute("content", content);
      }
    };

    updateMeta('meta[name="description"]', finalDesc);
    updateMeta('meta[name="title"]', finalTitle);
    updateMeta('meta[property="og:title"]', finalTitle);
    updateMeta('meta[property="og:description"]', finalDesc);
    updateMeta('meta[property="og:url"]', finalCanonical);
    updateMeta('meta[name="twitter:title"]', finalTitle);
    updateMeta('meta[name="twitter:description"]', finalDesc);
    updateMeta('meta[name="twitter:url"]', finalCanonical);

    // Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute("href", finalCanonical);
    }
  }, [title, description, canonical]);
}
