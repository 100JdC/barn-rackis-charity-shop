import React from 'react';

/**
 * Converts URLs in text to clickable links with user-friendly text
 */
export const linkifyText = (text: string): React.ReactNode => {
  // Regular expression to match URLs with optional preceding words
  const urlRegex = /((?:via\s+|at\s+)?(https?:\/\/[^\s]+))/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    const match = part.match(/^(via\s+|at\s+)?(https?:\/\/[^\s]+)$/);
    if (match) {
      const url = match[2];
      
      // Determine user-friendly text based on the URL
      let linkText = "here";
      
      if (url.includes("how-browsing-works") || url.includes("browsing")) {
        linkText = "here";
      } else if (url.includes("ikea.com")) {
        linkText = "on IKEA";
      } else if (url.includes("amazon.com")) {
        linkText = "on Amazon";
      } else if (url.includes("facebook.com")) {
        linkText = "on Facebook";
      } else if (url.includes("instagram.com")) {
        linkText = "on Instagram";
      }
      
      return (
        <a
          key={index}
          href={url}
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