import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us - BridgeReport.org',
  description: 'Get in touch with the BridgeReport.org team. Contact us for data inquiries, feedback, media requests, or partnership opportunities.',
  alternates: {
    canonical: 'https://bridgereport.org/contact',
  },
  openGraph: {
    title: 'Contact Us - BridgeReport.org',
    description: 'Get in touch with the BridgeReport.org team. Contact us for data inquiries, feedback, media requests, or partnership opportunities.',
    url: 'https://bridgereport.org/contact',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact Us - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - BridgeReport.org',
    description: 'Get in touch with the BridgeReport.org team. Contact us for data inquiries, feedback, media requests, or partnership opportunities.',
    images: ['/og-image.png'],
  },
};

function ContactJsonLd() {
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
        name: 'Contact',
        item: 'https://bridgereport.org/contact',
      },
    ],
  };

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://bridgereport.org/contact',
    name: 'Contact BridgeReport.org',
    description: 'Get in touch with the BridgeReport.org team for data inquiries, feedback, media requests, or partnership opportunities.',
    url: 'https://bridgereport.org/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'BridgeReport.org',
      email: 'info@bridgereport.org',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@bridgereport.org',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'BridgeReport.org',
      url: 'https://bridgereport.org',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I use BridgeReport.org data for my research project?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our data is derived from public NBI data and is available for research purposes. Please cite both BridgeReport.org and the FHWA National Bridge Inventory in your work. For extensive data needs, we recommend also downloading the original NBI data directly from FHWA.',
        },
      },
      {
        '@type': 'Question',
        name: 'I found an error in your data. How do I report it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Please email us at info@bridgereport.org with the specific page URL, what appears incorrect, and what you believe the correct information should be. We\'ll investigate and update if appropriate. Note that our data comes from the NBI, so some apparent errors may reflect the source data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does BridgeReport.org offer an API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We\'re working on a public API for developers and researchers. If you\'re interested in API access, please email us describing your use case and we\'ll add you to our notification list for when it becomes available.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you help me find information about a specific bridge?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Try using our Bridges Near Me feature or browsing by state. If you still can\'t find it, email us with as much identifying information as possible (location, route number, features crossed) and we\'ll try to help locate it in our database.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I stay updated on new features?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check back on the site periodically—we\'re always adding new features and content. You can also email us to request notification about specific upcoming features you\'re interested in.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

export default function ContactPage() {
  return (
    <>
      <ContactJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-slate-300">
            We&apos;d love to hear from you. Reach out with questions, feedback, or partnership inquiries.
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Primary Contact */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in Touch</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Email Us</h3>
                <a
                  href="mailto:info@bridgereport.org"
                  className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  info@bridgereport.org
                </a>
                <p className="text-slate-600 mt-2">
                  Our primary contact method. We aim to respond to all inquiries within 2-3 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is committed to being responsive and helpful to our users. Whether you have a question about our data, want to report an issue, or are interested in collaborating with us, we welcome your communication.
            </p>
            <p>
              We read every message we receive and do our best to provide thoughtful, helpful responses. While we cannot guarantee immediate responses due to the volume of inquiries we receive, we prioritize messages and aim to address all substantive inquiries in a timely manner.
            </p>
          </div>
        </section>

        {/* Types of Inquiries */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">How We Can Help</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Data Inquiries */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Data Questions</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Questions about our data sources, methodology, or how to interpret bridge condition information. We can help explain what the numbers mean and how to use them appropriately.
              </p>
            </div>

            {/* Technical Issues */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Report Issues</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Found a bug, broken link, or data that doesn&apos;t look right? Let us know so we can investigate and fix it. Please include the specific page URL and description of the issue.
              </p>
            </div>

            {/* Media Inquiries */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Media & Press</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Journalists and media professionals seeking information for stories about bridge infrastructure. We can provide context, explain data, and help with factual accuracy.
              </p>
            </div>

            {/* Partnerships */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Partnerships</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Organizations interested in partnering, collaborating on research, or integrating our data. We&apos;re open to exploring mutually beneficial relationships.
              </p>
            </div>

            {/* Research */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Research Inquiries</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Academics and researchers studying transportation infrastructure, civil engineering, or public policy. We can discuss data access and research applications.
              </p>
            </div>

            {/* Feedback */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">General Feedback</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Suggestions for improvements, new features, or just want to share how you&apos;ve used BridgeReport.org. We love hearing from our users and value your input.
              </p>
            </div>
          </div>
        </section>

        {/* Response Guidelines */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What to Expect</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              When you contact us, here&apos;s what you can expect:
            </p>
            <ul>
              <li><strong>Response Time:</strong> We typically respond within 2-3 business days for general inquiries. Time-sensitive media requests receive priority handling.</li>
              <li><strong>Thoughtful Responses:</strong> We don&apos;t use auto-responders for substantive questions. A real person will read your message and provide a considered response.</li>
              <li><strong>Privacy:</strong> Your contact information is used only to respond to your inquiry. We never share email addresses with third parties or add you to marketing lists.</li>
              <li><strong>Honest Answers:</strong> If we don&apos;t know the answer to your question or can&apos;t help with your request, we&apos;ll tell you honestly and try to point you in the right direction.</li>
            </ul>
            <p>
              For the best response, please include relevant details in your message: specific page URLs if reporting issues, context about your research if making data inquiries, and your timeline if you have deadlines.
            </p>
          </div>
        </section>

        {/* What We Can't Help With */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Important Limitations</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex">
              <svg className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">We Are Not a Government Agency</h3>
                <p className="text-amber-800">
                  BridgeReport.org is an independent informational resource. We are not affiliated with the FHWA, any state DOT, or any government transportation agency.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              While we&apos;re happy to help with many inquiries, there are some things we cannot assist with:
            </p>
            <ul>
              <li><strong>Bridge Maintenance or Repairs:</strong> We do not maintain or repair bridges. If you have concerns about a specific bridge&apos;s safety or need maintenance work, please contact your state or local Department of Transportation directly.</li>
              <li><strong>Official Bridge Records:</strong> For official documentation, legal proceedings, or permit applications, you&apos;ll need to contact the appropriate government agency. Our data is for informational purposes only.</li>
              <li><strong>Emergency Situations:</strong> If you observe an immediate safety hazard on a bridge, please call 911 or contact local authorities immediately. Do not wait for an email response.</li>
              <li><strong>Funding or Investment Decisions:</strong> We cannot provide guidance on infrastructure investments, bond measures, or funding allocations. Consult with qualified professionals and official sources for such decisions.</li>
              <li><strong>Real-Time Conditions:</strong> We cannot tell you the current condition of any specific bridge beyond what&apos;s shown in our data, which may be up to 24 months old.</li>
            </ul>
          </div>
        </section>

        {/* Government Resources */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Official Resources</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              For official inquiries about bridge conditions, maintenance, or transportation policy, we recommend contacting the appropriate government agencies:
            </p>
          </div>

          <div className="mt-6 bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Federal Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.fhwa.dot.gov/bridge/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  FHWA Office of Bridges and Structures
                </a>
                <p className="text-sm text-slate-600">Federal oversight of the national bridge program</p>
              </li>
              <li>
                <a
                  href="https://www.fhwa.dot.gov/bridge/nbi.cfm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  National Bridge Inventory Data
                </a>
                <p className="text-sm text-slate-600">Official source for NBI data downloads</p>
              </li>
              <li>
                <a
                  href="https://www.transportation.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  U.S. Department of Transportation
                </a>
                <p className="text-sm text-slate-600">Federal transportation policy and programs</p>
              </li>
            </ul>
          </div>

          <div className="mt-4 bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">State DOT Contacts</h3>
            <p className="text-slate-600 text-sm mb-4">
              For bridge-specific inquiries in your state, contact your State Department of Transportation. Each state maintains its own bridge inspection and maintenance programs. You can typically find contact information by searching &quot;[Your State] Department of Transportation bridges&quot; or visiting your state government website.
            </p>
          </div>
        </section>

        {/* Social Media */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Stay Connected</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Follow BridgeReport.org for updates on new features, interesting bridge facts, and infrastructure news. While we monitor our social channels, email remains the best way to reach us for substantive inquiries.
            </p>
            <p>
              We occasionally share:
            </p>
            <ul>
              <li>Noteworthy bridge condition trends and data insights</li>
              <li>New features and improvements to BridgeReport.org</li>
              <li>Interesting historical bridges and infrastructure stories</li>
              <li>Infrastructure news and policy developments</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I use your data for my research project?</h3>
              <p className="text-slate-600">
                Yes! Our data is derived from public NBI data and is available for research purposes. Please cite both BridgeReport.org and the FHWA National Bridge Inventory in your work. For extensive data needs, we recommend also downloading the original NBI data directly from FHWA.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">I found an error in your data. How do I report it?</h3>
              <p className="text-slate-600">
                Please email us at info@bridgereport.org with the specific page URL, what appears incorrect, and what you believe the correct information should be. We&apos;ll investigate and update if appropriate. Note that our data comes from the NBI, so some apparent errors may reflect the source data.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Do you offer an API?</h3>
              <p className="text-slate-600">
                We&apos;re working on a public API for developers and researchers. If you&apos;re interested in API access, please email us describing your use case and we&apos;ll add you to our notification list for when it becomes available.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can you help me find information about a specific bridge?</h3>
              <p className="text-slate-600">
                Try using our <Link href="/bridges-near-me" className="text-blue-600 hover:text-blue-800">Bridges Near Me</Link> feature or browsing by state. If you still can&apos;t find it, email us with as much identifying information as possible (location, route number, features crossed) and we&apos;ll try to help locate it in our database.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">How can I stay updated on new features?</h3>
              <p className="text-slate-600">
                Check back on the site periodically—we&apos;re always adding new features and content. You can also email us to request notification about specific upcoming features you&apos;re interested in.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-100 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Reach Out?</h2>
          <p className="text-slate-700 mb-6">
            We look forward to hearing from you. Don&apos;t hesitate to get in touch—no question is too simple or too complex.
          </p>
          <a
            href="mailto:info@bridgereport.org"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email info@bridgereport.org
          </a>
        </section>
      </article>
      </main>
    </>
  );
}
