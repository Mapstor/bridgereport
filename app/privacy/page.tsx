import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - BridgeReport.org',
  description: 'Privacy Policy for BridgeReport.org. Learn how we collect, use, and protect your personal information when you visit our website.',
  alternates: {
    canonical: 'https://bridgereport.org/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - BridgeReport.org',
    description: 'Privacy Policy for BridgeReport.org. Learn how we collect, use, and protect your personal information when you visit our website.',
    url: 'https://bridgereport.org/privacy',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - BridgeReport.org',
    description: 'Privacy Policy for BridgeReport.org. Learn how we collect, use, and protect your personal information when you visit our website.',
    images: ['/og-image.png'],
  },
};

function PrivacyJsonLd() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bridgereport.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Privacy Policy',
        item: 'https://bridgereport.org/privacy',
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://bridgereport.org/privacy',
    name: 'Privacy Policy - BridgeReport.org',
    description: 'Privacy Policy for BridgeReport.org. Learn how we collect, use, and protect your personal information when you visit our website.',
    url: 'https://bridgereport.org/privacy',
    dateModified: '2025-04-06',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'BridgeReport.org',
      url: 'https://bridgereport.org',
    },
    about: {
      '@type': 'Thing',
      name: 'Privacy Policy',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}

export default function PrivacyPage() {
  const lastUpdated = 'April 6, 2025';

  return (
    <>
      <PrivacyJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-slate-300">
            Your privacy matters to us. This policy explains how we handle your information.
          </p>
          <p className="text-sm text-slate-400 mt-4">Last Updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Welcome to BridgeReport.org (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and being transparent about how we collect, use, and share information when you visit our website at bridgereport.org (the &quot;Website&quot;) and use our services.
            </p>
            <p>
              This Privacy Policy describes our practices regarding personal information we collect through the Website. By accessing or using our Website, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our Website.
            </p>
            <p>
              We encourage you to read this Privacy Policy in its entirety. It applies to all visitors, users, and others who access our Website. This policy may be updated from time to time, and we will notify you of any material changes by posting the new Privacy Policy on this page with an updated revision date.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We collect several types of information from and about users of our Website. The types of information we may collect include:
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Information You Provide Directly</h3>
            <p>
              When you contact us via email, submit feedback, or otherwise communicate with us, you may provide us with:
            </p>
            <ul>
              <li>Your name and email address</li>
              <li>The content of your message or inquiry</li>
              <li>Any other information you choose to include in your communication</li>
            </ul>
            <p>
              We only collect personal information that you voluntarily provide to us. We do not require registration or account creation to use the main features of our Website.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Information Collected Automatically</h3>
            <p>
              When you visit our Website, we and our third-party service providers may automatically collect certain information about your device and your visit, including:
            </p>
            <ul>
              <li><strong>Device Information:</strong> Information about your computer, mobile device, or other device used to access the Website, including hardware model, operating system and version, browser type and version, and device identifiers.</li>
              <li><strong>Log Information:</strong> Information about your visit, including the pages you view, the links you click, the date and time of your visit, the duration of your visit, and the referring URL.</li>
              <li><strong>Location Information:</strong> General geographic location based on your IP address. We do not collect precise geolocation data unless you specifically use our &quot;Bridges Near Me&quot; feature and grant permission.</li>
              <li><strong>IP Address:</strong> Your Internet Protocol (IP) address, which may be used to estimate your general location and for security purposes.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Location Data for &quot;Bridges Near Me&quot;</h3>
            <p>
              If you choose to use our &quot;Bridges Near Me&quot; feature, we may request access to your device&apos;s location services. This location data is:
            </p>
            <ul>
              <li>Only collected when you explicitly grant permission through your browser</li>
              <li>Used solely to show you bridges near your current location</li>
              <li>Processed locally in your browser and not stored on our servers</li>
              <li>Not combined with any other personal information</li>
            </ul>
            <p>
              You can deny location access and still use other features of our Website. You can also revoke location permission at any time through your browser settings.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Cookies and Similar Technologies</h3>
            <p>
              We and our third-party service providers use cookies, web beacons, pixels, and similar technologies to collect information about your browsing activities. These technologies help us:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our Website</li>
              <li>Improve our Website and services</li>
              <li>Deliver relevant advertising through our advertising partners</li>
              <li>Analyze Website traffic and trends</li>
            </ul>
            <p>
              <strong>Types of cookies we use:</strong>
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Necessary for the Website to function properly. These cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Website by collecting information anonymously.</li>
              <li><strong>Advertising Cookies:</strong> Used by our advertising partners to deliver relevant advertisements and track ad campaign performance.</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences and enhance your experience on the Website.</li>
            </ul>
            <p>
              Most web browsers are set to accept cookies by default. You can usually modify your browser settings to decline cookies if you prefer. However, if you choose to decline cookies, you may not be able to fully experience all features of our Website.
            </p>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We use the information we collect for various purposes, including:
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Providing and Improving Our Services</h3>
            <ul>
              <li>To operate and maintain the Website</li>
              <li>To provide you with the bridge data and information you request</li>
              <li>To respond to your inquiries, comments, and requests</li>
              <li>To analyze usage patterns and improve our Website&apos;s functionality</li>
              <li>To develop new features and services</li>
              <li>To fix technical issues and bugs</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Communication</h3>
            <ul>
              <li>To respond to your emails and inquiries</li>
              <li>To send you technical notices, updates, and administrative messages</li>
              <li>To provide information you have requested</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Analytics and Research</h3>
            <ul>
              <li>To analyze trends, administer the Website, and gather demographic information</li>
              <li>To understand which pages and features are most popular</li>
              <li>To improve user experience based on aggregated usage patterns</li>
              <li>To measure the effectiveness of our content</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Advertising</h3>
            <ul>
              <li>To display relevant advertisements that may be of interest to you</li>
              <li>To measure and analyze the effectiveness of our advertising</li>
              <li>To compensate our advertising partners based on ad performance</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Legal and Safety Purposes</h3>
            <ul>
              <li>To comply with applicable laws, regulations, and legal processes</li>
              <li>To protect the rights, privacy, safety, or property of BridgeReport.org, our users, or others</li>
              <li>To detect, prevent, or address fraud, security, or technical issues</li>
              <li>To enforce our Terms of Use</li>
            </ul>
          </div>
        </section>

        {/* How We Share Your Information */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Share Your Information</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We do not sell your personal information. We may share information as follows:
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Service Providers</h3>
            <p>
              We may share information with third-party vendors, consultants, and service providers who perform services on our behalf, such as:
            </p>
            <ul>
              <li><strong>Web Hosting:</strong> To host and serve our Website</li>
              <li><strong>Analytics:</strong> To help us understand Website usage (e.g., Google Analytics)</li>
              <li><strong>Content Delivery:</strong> To deliver Website content efficiently (e.g., CDN providers)</li>
              <li><strong>Email Services:</strong> To manage and respond to inquiries</li>
            </ul>
            <p>
              These service providers are contractually bound to use your information only for the purposes of providing their services to us and in accordance with this Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Advertising Partners</h3>
            <p>
              We work with advertising partners to display advertisements on our Website. These partners may collect information about your visits to our Website and other websites to provide relevant advertisements. Our advertising partners include:
            </p>
            <ul>
              <li>Advertising networks that serve contextual and interest-based advertisements</li>
              <li>Analytics providers that help measure ad performance</li>
            </ul>
            <p>
              You may opt out of interest-based advertising through various industry programs, including the Digital Advertising Alliance (&quot;DAA&quot;) at <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600">optout.aboutads.info</a> and the Network Advertising Initiative (&quot;NAI&quot;) at <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-600">optout.networkadvertising.org</a>.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Legal Requirements</h3>
            <p>
              We may disclose information if we believe in good faith that such disclosure is necessary to:
            </p>
            <ul>
              <li>Comply with applicable laws, regulations, legal processes, or governmental requests</li>
              <li>Enforce our Terms of Use and other agreements</li>
              <li>Protect the rights, property, or safety of BridgeReport.org, our users, or the public</li>
              <li>Detect, prevent, or address fraud, security, or technical issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Business Transfers</h3>
            <p>
              If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of our assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or uses of your personal information.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Aggregated or De-identified Information</h3>
            <p>
              We may share aggregated or de-identified information that cannot reasonably be used to identify you. For example, we may share statistics about overall Website usage or general trends in bridge conditions without identifying individual users.
            </p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Our Website may contain links to third-party websites, services, and resources that are not operated by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party websites you visit.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Google Analytics</h3>
            <p>
              We use Google Analytics to help us understand how visitors interact with our Website. Google Analytics uses cookies to collect information about your use of the Website, including your IP address. This information is transmitted to and stored by Google. Google may use this information to evaluate your use of the Website, compile reports on website activity, and provide other services relating to website activity and internet usage.
            </p>
            <p>
              You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on, available at <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600">tools.google.com/dlpage/gaoptout</a>.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Maps and Location Services</h3>
            <p>
              Our Website may use mapping services to display interactive maps. These services may collect information about your device and location in accordance with their own privacy policies.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Social Media</h3>
            <p>
              If you interact with social media features on our Website (such as share buttons), those features may collect your IP address, which page you are visiting, and may set a cookie. Social media features are governed by the privacy policies of the companies providing them.
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We implement appropriate technical and organizational measures to protect the information we collect and store. These measures are designed to provide a level of security appropriate to the risk of processing your personal information. Our security measures include:
            </p>
            <ul>
              <li>HTTPS encryption for all Website traffic</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information on a need-to-know basis</li>
              <li>Secure data storage practices</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security. You should take steps to protect the security of your information, such as keeping your devices secure and being cautious about information you share online.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Retention</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We retain information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. The retention period may vary depending on the context of the processing and our legal obligations.
            </p>
            <ul>
              <li><strong>Contact Information:</strong> We retain email correspondence for as long as reasonably necessary to respond to inquiries and for our records.</li>
              <li><strong>Analytics Data:</strong> Aggregated analytics data is retained indefinitely to analyze long-term trends.</li>
              <li><strong>Cookies:</strong> Cookie retention periods vary by type and purpose. Most cookies expire after the browser session ends or within a specified time period.</li>
            </ul>
            <p>
              When information is no longer needed for the purposes for which it was collected, we will delete or anonymize it in accordance with our data retention practices.
            </p>
          </div>
        </section>

        {/* Your Rights and Choices */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights and Choices</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              You have several choices regarding the information we collect and how it is used:
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Cookie Preferences</h3>
            <p>
              Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, delete cookies, or alert you when cookies are being sent. Note that disabling cookies may affect the functionality of our Website.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Location Services</h3>
            <p>
              You can control location access through your browser settings. You can grant, deny, or revoke location permission at any time. Our &quot;Bridges Near Me&quot; feature is optional and works only with your explicit consent.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Do Not Track</h3>
            <p>
              Some browsers have a &quot;Do Not Track&quot; feature that signals to websites that you do not want to have your online activity tracked. Due to the lack of a common standard for interpreting Do Not Track signals, our Website does not currently respond to Do Not Track browser signals.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Opt-Out of Interest-Based Advertising</h3>
            <p>
              You can opt out of interest-based advertising from participating companies through:
            </p>
            <ul>
              <li>Digital Advertising Alliance: <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600">optout.aboutads.info</a></li>
              <li>Network Advertising Initiative: <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-600">optout.networkadvertising.org</a></li>
              <li>European users: <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600">youronlinechoices.eu</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Access and Deletion</h3>
            <p>
              If you have provided us with personal information through email or other communication, you may request access to, correction of, or deletion of that information by contacting us at <a href="mailto:info@bridgereport.org" className="text-blue-600">info@bridgereport.org</a>. We will respond to your request within a reasonable timeframe.
            </p>
          </div>
        </section>

        {/* California Privacy Rights */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">California Privacy Rights</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA). These rights include:
            </p>
            <ul>
              <li><strong>Right to Know:</strong> You have the right to request information about the categories and specific pieces of personal information we have collected about you, the categories of sources from which the information is collected, the business purposes for collecting or selling the information, and the categories of third parties with whom we share the information.</li>
              <li><strong>Right to Delete:</strong> You have the right to request deletion of personal information we have collected from you, subject to certain exceptions.</li>
              <li><strong>Right to Correct:</strong> You have the right to request correction of inaccurate personal information.</li>
              <li><strong>Right to Opt-Out:</strong> You have the right to opt out of the sale or sharing of your personal information.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at <a href="mailto:info@bridgereport.org" className="text-blue-600">info@bridgereport.org</a>. We may need to verify your identity before processing your request.
            </p>
            <p>
              <strong>Notice of Financial Incentive:</strong> We do not offer financial incentives or price differences in exchange for the retention or sale of personal information.
            </p>
          </div>
        </section>

        {/* International Users */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">International Users</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is operated from the United States. If you are accessing our Website from outside the United States, please be aware that information may be transferred to, stored, and processed in the United States where our servers are located. The data protection laws of the United States may differ from those in your country.
            </p>
            <p>
              By using our Website, you consent to the transfer of your information to the United States and the use and disclosure of information about you as described in this Privacy Policy. If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we will comply with applicable legal requirements providing adequate protection for the transfer of personal information to countries outside the EEA.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Children&apos;s Privacy</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Our Website is not intended for children under the age of 13 (or under the age of 16 for children in the European Economic Area). We do not knowingly collect personal information from children under these ages. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at <a href="mailto:info@bridgereport.org" className="text-blue-600">info@bridgereport.org</a>, and we will take steps to delete such information from our records.
            </p>
          </div>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes to this Privacy Policy, we will:
            </p>
            <ul>
              <li>Post the updated Privacy Policy on this page</li>
              <li>Update the &quot;Last Updated&quot; date at the top of this Privacy Policy</li>
              <li>Take other steps as required by applicable law</li>
            </ul>
            <p>
              We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Website after any changes to this Privacy Policy constitutes your acceptance of the revised policy.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
          </div>
          <div className="mt-4 bg-slate-50 rounded-xl p-6">
            <p className="text-slate-700 mb-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:info@bridgereport.org" className="text-blue-600 hover:text-blue-800">
                info@bridgereport.org
              </a>
            </p>
            <p className="text-slate-700">
              <strong>Website:</strong>{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                bridgereport.org/contact
              </Link>
            </p>
          </div>
          <div className="prose prose-lg max-w-none text-slate-700 mt-6">
            <p>
              When contacting us about a privacy concern, please include as much detail as possible so we can address your inquiry effectively. We will respond to your inquiry within a reasonable timeframe.
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <section className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-slate-600">
            <Link href="/about" className="hover:text-blue-600">About Us</Link>
            <span className="text-slate-300">|</span>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            <span className="text-slate-300">|</span>
            <Link href="/terms" className="hover:text-blue-600">Terms of Use</Link>
          </div>
        </section>
      </article>
      </main>
    </>
  );
}
