import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('navbar.terms')}</h1>
      <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md">
        <h2>1. Introduction</h2>
        <p>Welcome to PixelPerfect AI. These terms and conditions outline the rules and regulations for the use of PixelPerfect AI's Website, located at this application's URL.</p>
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use PixelPerfect AI if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h2>2. Cookies</h2>
        <p>We employ the use of cookies. By accessing PixelPerfect AI, you agreed to use cookies in agreement with the PixelPerfect AI's Privacy Policy. Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>

        <h2>3. License</h2>
        <p>Unless otherwise stated, PixelPerfect AI and/or its licensors own the intellectual property rights for all material on PixelPerfect AI. All intellectual property rights are reserved. You may access this from PixelPerfect AI for your own personal use subjected to restrictions set in these terms and conditions.</p>
        <p>You must not:</p>
        <ul>
          <li>Republish material from PixelPerfect AI</li>
          <li>Sell, rent or sub-license material from PixelPerfect AI</li>
          <li>Reproduce, duplicate or copy material from PixelPerfect AI</li>
          <li>Redistribute content from PixelPerfect AI</li>
        </ul>

        <h2>4. Disclaimer</h2>
        <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
        <ul>
          <li>limit or exclude our or your liability for death or personal injury;</li>
          <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
          <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
          <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
        </ul>
        <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>
        <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
      </div>
    </div>
  );
};

export default TermsPage;
