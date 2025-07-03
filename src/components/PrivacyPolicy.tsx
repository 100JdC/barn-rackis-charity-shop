
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Rackis för Barn Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Email Usage Policy</h2>
        <p className="mb-4 text-gray-700">
          At Rackis för Barn, we take your privacy seriously. Here's how we handle your email address:
        </p>
        
        <h3 className="text-xl font-semibold mb-3 text-gray-800">How We Use Your Email</h3>
        <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
          <li><strong>Account Security:</strong> Your email is used for account verification, password resets, and security alerts.</li>
          <li><strong>No Spam:</strong> We will never send you unsolicited marketing emails.</li>
          <li><strong>No Third Parties:</strong> We do not sell, rent, or share your email address with third parties.</li>
        </ul>
        
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Email Communications</h3>
        <p className="mb-3 text-gray-700">You may receive the following types of emails from us:</p>
        <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
          <li><strong>Account Emails:</strong> Essential communications about your account (verification, password resets, security alerts).</li>
          <li><strong>Feature Updates:</strong> Information about new features or important changes to our platform (optional).</li>
          <li><strong>Marketing:</strong> Promotional content about our services (disabled by default).</li>
        </ul>
        
        <p className="text-gray-700">You can manage your email preferences in your account settings at any time, except for essential account emails which cannot be disabled for security reasons.</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Collection and Storage</h2>
        <p className="mb-3 text-gray-700">
          We collect and store the following information:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
          <li><strong>Email Address:</strong> Used for authentication and account recovery.</li>
          <li><strong>Username:</strong> Your public identifier on our platform.</li>
          <li><strong>Profile Information:</strong> Any additional information you choose to add to your profile.</li>
          <li><strong>Donated Items:</strong> Information about items you donate to help others find what they need.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Rights</h2>
        <p className="mb-3 text-gray-700">You have the right to:</p>
        <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
          <li>Access your personal data</li>
          <li>Correct inaccurate personal data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Control your email preferences</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          Rackis för Barn is dedicated to helping students in Uppsala exchange second-hand items sustainably 
          while supporting Barncancerfonden. All profits from our platform go directly to supporting children 
          with cancer and their families.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about our privacy practices, please contact us at:
          <br />
          <a href="mailto:privacy@rackisforbarn.se" className="text-blue-600 hover:text-blue-800 underline">
            privacy@rackisforbarn.se
          </a>
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
