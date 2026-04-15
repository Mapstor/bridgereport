import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for BridgeReport.org. Read the terms and conditions governing your use of our bridge infrastructure data website.',
  alternates: {
    canonical: 'https://www.bridgereport.org/terms',
  },
  openGraph: {
    title: 'Terms of Use - BridgeReport.org',
    description: 'Terms of Use for BridgeReport.org. Read the terms and conditions governing your use of our bridge infrastructure data website.',
    url: 'https://www.bridgereport.org/terms',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Terms of Use - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use - BridgeReport.org',
    description: 'Terms of Use for BridgeReport.org. Read the terms and conditions governing your use of our bridge infrastructure data website.',
    images: ['/og-image.png'],
  },
};

function TermsJsonLd() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bridgereport.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Terms of Use',
        item: 'https://www.bridgereport.org/terms',
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.bridgereport.org/terms',
    name: 'Terms of Use - BridgeReport.org',
    description: 'Terms of Use for BridgeReport.org. Read the terms and conditions governing your use of our bridge infrastructure data website.',
    url: 'https://www.bridgereport.org/terms',
    dateModified: '2025-04-06',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'BridgeReport.org',
      url: 'https://www.bridgereport.org',
    },
    about: {
      '@type': 'Thing',
      name: 'Terms of Service',
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

export default function TermsPage() {
  const lastUpdated = 'April 6, 2025';

  return (
    <>
      <TermsJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Use</h1>
          <p className="text-xl text-slate-300">
            Please read these terms carefully before using BridgeReport.org.
          </p>
          <p className="text-sm text-slate-400 mt-4">Last Updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Agreement */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Agreement to Terms</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              These Terms of Use (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;you&quot; or &quot;your&quot;) and BridgeReport.org (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your access to and use of the BridgeReport.org website located at bridgereport.org, including any subdomains, and all associated services, features, content, and functionality (collectively, the &quot;Website&quot;).
            </p>
            <p>
              By accessing or using the Website, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Website. We reserve the right to modify these Terms at any time. Your continued use of the Website following the posting of revised Terms constitutes your acceptance of such changes.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access the Website. Please read these Terms carefully before using the Website. By using the Website, you represent that you are at least 13 years old and have the legal capacity to enter into these Terms. If you are using the Website on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </div>
        </section>

        {/* Description of Service */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Description of Service</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is an informational website that provides access to data about highway bridges in the United States. Our Website presents information derived from the National Bridge Inventory (NBI), a database maintained by the Federal Highway Administration (FHWA) within the U.S. Department of Transportation, along with supplementary data from other public sources.
            </p>
            <p>
              The Website allows users to:
            </p>
            <ul>
              <li>Browse bridge data by state, county, and city</li>
              <li>Search for specific bridges by location or characteristics</li>
              <li>View bridge condition ratings and related information</li>
              <li>Access interactive maps showing bridge locations</li>
              <li>Compare bridge conditions across different geographic areas</li>
              <li>View historical trends in bridge conditions</li>
            </ul>
            <p>
              We strive to provide accurate, current, and useful information. However, bridge inspection data is typically updated every 24 months, and there may be delays between inspections and our data updates. The information on this Website is provided for general informational purposes only and should not be relied upon as the sole basis for any decision.
            </p>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceptable Use</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              You agree to use the Website only for lawful purposes and in accordance with these Terms. You agree not to use the Website:
            </p>
            <ul>
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail,&quot; &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation</li>
              <li>To impersonate or attempt to impersonate BridgeReport.org, a BridgeReport.org employee, another user, or any other person or entity</li>
              <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of the Website, or which, as determined by us, may harm BridgeReport.org or users of the Website, or expose them to liability</li>
              <li>In any manner that could disable, overburden, damage, or impair the Website or interfere with any other party&apos;s use of the Website</li>
              <li>To use any robot, spider, or other automatic device, process, or means to access the Website for any purpose, including monitoring or copying any of the material on the Website, except as expressly permitted</li>
              <li>To use any manual process to monitor or copy any of the material on the Website, or for any other purpose not expressly authorized in these Terms, without our prior written consent</li>
              <li>To introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
              <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Website, the server on which the Website is stored, or any server, computer, or database connected to the Website</li>
              <li>To attack the Website via a denial-of-service attack or a distributed denial-of-service attack</li>
              <li>To otherwise attempt to interfere with the proper working of the Website</li>
            </ul>
          </div>
        </section>

        {/* Data Use and Attribution */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Use and Attribution</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              The bridge data presented on BridgeReport.org is derived from publicly available government data sources, primarily the National Bridge Inventory (NBI) maintained by the Federal Highway Administration. This underlying data is in the public domain.
            </p>
            <p>
              You are permitted to:
            </p>
            <ul>
              <li>Access and view the information on the Website for personal, educational, and research purposes</li>
              <li>Share links to pages on the Website</li>
              <li>Quote reasonable portions of text content with proper attribution to BridgeReport.org and the underlying data source (FHWA National Bridge Inventory)</li>
              <li>Use the information to inform your own research, journalism, or educational activities</li>
            </ul>
            <p>
              If you use data or information from BridgeReport.org in any publication, presentation, or other public work, we request that you cite both BridgeReport.org and the Federal Highway Administration National Bridge Inventory as your sources.
            </p>
            <p>
              You may not:
            </p>
            <ul>
              <li>Scrape, harvest, or systematically download large amounts of data from the Website without our express written permission</li>
              <li>Use automated tools to access the Website in a manner that places excessive load on our servers</li>
              <li>Reproduce, distribute, or create derivative works based on the Website&apos;s design, layout, graphics, or original content (as opposed to the underlying bridge data)</li>
              <li>Frame the Website or use meta tags or other &quot;hidden text&quot; utilizing our name or trademarks without our express written consent</li>
              <li>Misrepresent the source or accuracy of the data</li>
            </ul>
            <p>
              For bulk data needs, we recommend accessing the original NBI data directly from the FHWA at <a href="https://www.fhwa.dot.gov/bridge/nbi.cfm" target="_blank" rel="noopener noreferrer" className="text-blue-600">fhwa.dot.gov/bridge/nbi.cfm</a>.
            </p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property Rights</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              The Website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by BridgeReport.org, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p>
              The BridgeReport.org name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of BridgeReport.org or its affiliates or licensors. You must not use such marks without our prior written permission.
            </p>
            <p>
              While the underlying bridge data from the National Bridge Inventory is in the public domain, our original content, including but not limited to:
            </p>
            <ul>
              <li>Website design and user interface</li>
              <li>Original written content and analysis</li>
              <li>Data visualizations and charts</li>
              <li>Processing methodology and derived calculations</li>
              <li>Software code and database structure</li>
            </ul>
            <p>
              ...are protected by copyright and may not be reproduced without our permission.
            </p>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Disclaimers</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex">
              <svg className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
                <p className="text-amber-800">
                  The information on this Website is provided for general informational purposes only. It is not intended to be and should not be used as professional engineering advice, safety assessment, or the sole basis for any decision affecting public safety.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">No Safety Guarantees</h3>
            <p>
              The bridge condition information displayed on this Website reflects data from federal inspection records that may be up to 24 months old or older. Bridge conditions can change between inspections due to deterioration, damage, maintenance activities, or reconstruction. A bridge rated &quot;Good&quot; in our data may have deteriorated since its last inspection, and a bridge rated &quot;Poor&quot; may have been improved or replaced.
            </p>
            <p>
              <strong>We make no representations or warranties regarding the current safety of any bridge.</strong> All bridges listed as open in the National Bridge Inventory have been determined by their owners to be safe for public use under their posted conditions. However, you should always exercise caution, observe all posted signs and restrictions, and report any concerns to local authorities.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Data Accuracy</h3>
            <p>
              While we strive for accuracy, we cannot guarantee that all information on the Website is complete, accurate, or current. The data is derived from government sources and may contain errors, omissions, or outdated information. We process and present this data as provided and do not independently verify each record.
            </p>
            <p>
              Known limitations of our data include:
            </p>
            <ul>
              <li>Inspection data may be up to 24 months old or older</li>
              <li>Geographic coordinates may be approximate for some bridges</li>
              <li>Place name associations may not reflect common usage</li>
              <li>Some bridges may have been replaced, removed, or significantly modified since the last data update</li>
              <li>Data processing errors may occasionally occur</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">&quot;As Is&quot; Basis</h3>
            <p>
              THE WEBSITE AND ITS CONTENT ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. BRIDGEREPORT.ORG DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p>
              BRIDGEREPORT.ORG DOES NOT WARRANT THAT THE WEBSITE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE WEBSITE OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Not Professional Advice</h3>
            <p>
              The information on this Website does not constitute professional engineering, legal, financial, or other professional advice. You should consult with qualified professionals before making any decisions based on the information provided. Do not rely solely on this Website for any purpose that requires professional judgment or expertise.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BRIDGEREPORT.ORG, ITS AFFILIATES, LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Personal injury or property damage</li>
              <li>Emotional distress</li>
              <li>Loss of goodwill</li>
              <li>Business interruption</li>
              <li>Any other intangible losses</li>
            </ul>
            <p>
              ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE, THE WEBSITE OR ANY CONTENT ON THE WEBSITE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT BRIDGEREPORT.ORG HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>
            <p>
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID US IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED DOLLARS ($100).
            </p>
            <p>
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
          </div>
        </section>

        {/* Indemnification */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Indemnification</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              You agree to defend, indemnify, and hold harmless BridgeReport.org, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your use of the Website</li>
              <li>Your violation of any third party rights, including intellectual property rights</li>
              <li>Any claim that your use of the Website caused damage to a third party</li>
              <li>Any content you submit, post, or transmit through the Website</li>
            </ul>
            <p>
              This indemnification obligation will survive the termination of these Terms and your use of the Website.
            </p>
          </div>
        </section>

        {/* Third-Party Links */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Links and Content</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              The Website may contain links to third-party websites, services, or resources that are not owned or controlled by BridgeReport.org. We provide these links only as a convenience and are not responsible for the content, products, or services on or available from those third-party websites or resources.
            </p>
            <p>
              Inclusion of any link does not imply our endorsement, approval, or recommendation of the linked website or its contents. You acknowledge and agree that BridgeReport.org shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any third-party content, goods, or services available on or through any third-party websites or resources.
            </p>
            <p>
              We strongly advise you to read the terms and conditions and privacy policies of any third-party websites you visit.
            </p>
          </div>
        </section>

        {/* Modifications */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Modifications to the Website and Terms</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We reserve the right to modify, suspend, or discontinue the Website (in whole or in part) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Website.
            </p>
            <p>
              We may revise and update these Terms from time to time at our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the Website thereafter. Your continued use of the Website following the posting of revised Terms means that you accept and agree to the changes.
            </p>
            <p>
              It is your responsibility to check this page periodically for changes. We will make reasonable efforts to notify users of material changes to these Terms, but we are not obligated to do so.
            </p>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We may terminate or suspend your access to the Website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Website will cease immediately. All provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnification, and limitations of liability.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law and Jurisdiction</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              These Terms and your use of the Website shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Any legal suit, action, or proceeding arising out of or related to these Terms or the Website shall be instituted exclusively in the federal courts of the United States or the courts of the State of Delaware. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.
            </p>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Dispute Resolution</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Any dispute, controversy, or claim arising out of or relating to these Terms, including the validity, invalidity, breach, or termination thereof, shall be resolved by binding arbitration in accordance with the American Arbitration Association&apos;s rules. The arbitration shall be conducted in English, and the arbitrator&apos;s decision shall be final and binding.
            </p>
            <p>
              Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of copyrights, trademarks, trade secrets, patents, or other intellectual property rights.
            </p>
            <p>
              You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. If for any reason a claim proceeds in court rather than in arbitration, you waive any right to a jury trial.
            </p>
          </div>
        </section>

        {/* Waiver and Severability */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Waiver and Severability</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              No waiver by BridgeReport.org of any term or condition set out in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of BridgeReport.org to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.
            </p>
            <p>
              If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms will continue in full force and effect.
            </p>
          </div>
        </section>

        {/* Entire Agreement */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Entire Agreement</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              These Terms, together with our <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>, constitute the sole and entire agreement between you and BridgeReport.org regarding the Website and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the Website.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              If you have any questions about these Terms of Use, please contact us:
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
        </section>

        {/* Footer Navigation */}
        <section className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-slate-600">
            <Link href="/about" className="hover:text-blue-600">About Us</Link>
            <span className="text-slate-300">|</span>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            <span className="text-slate-300">|</span>
            <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          </div>
        </section>
      </article>
      </main>
    </>
  );
}
