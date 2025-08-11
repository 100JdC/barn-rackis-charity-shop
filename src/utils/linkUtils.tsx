import React from 'react';

/**
 * Converts URLs in text to clickable links with user-friendly text
 */
export const linkifyText = (text: string): React.ReactNode => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Determine user-friendly text based on the URL
      let linkText = "click here";
      
      if (part.includes("how-browsing-works") || part.includes("browsing")) {
        linkText = "can be reserved here";
      } else if (part.includes("ikea.com")) {
        linkText = "view on IKEA";
      } else if (part.includes("amazon.com")) {
        linkText = "view on Amazon";
      } else if (part.includes("facebook.com")) {
        linkText = "view on Facebook";
      } else if (part.includes("instagram.com")) {
        linkText = "view on Instagram";
      }
      
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {linkText}
        </a>
      );
    }
    return part;
  });
};