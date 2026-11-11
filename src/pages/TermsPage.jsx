import { Link } from 'react-router-dom'
import LegalPage, { LegalSection } from '../components/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="These Terms of Use govern your access to and use of the BlankCO PH Solutions website, its content, and any inquiry or communication you send through it."
      lastUpdated="November 11, 2026"
    >
      <LegalSection title="1. Acceptance of These Terms">
        <p>
          By accessing or using this website, you agree to these Terms of Use. If you do not agree, please do not use the
          site. If you use the site on behalf of a company or another organization, you confirm that you have authority
          to bind that organization to these terms.
        </p>
      </LegalSection>

      <LegalSection title="2. About Us">
        <p>
          BlankCO PH Solutions is a student-led digital solutions team based in San Jose, Baggao, Cagayan, Philippines.
          We provide services related to business strategy, workflow automation, digital products, and ongoing support.
        </p>
        <p>
          These terms apply to this website. They do not replace any separate written agreement, proposal, statement of
          work, or contract that you and BlankCO PH Solutions may enter into for a project.
        </p>
      </LegalSection>

      <LegalSection title="3. Use of the Website">
        <p>You agree to use this website only for lawful purposes. You must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>attempt to gain unauthorized access to the site, its servers, databases, or administrative areas;</li>
          <li>interfere with the site&apos;s operation, security, or availability;</li>
          <li>use automated tools to scrape, copy, or harvest content or personal information at scale;</li>
          <li>upload or transmit malicious code, spam, or misleading material; or</li>
          <li>use the site in a way that infringes the rights of BlankCO PH Solutions or any third party.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Services and Inquiries">
        <p>
          Information on this website is provided for general informational purposes. It is not a binding offer, a
          guarantee of availability, or professional advice. Submitting the contact form does not create a client
          relationship or obligate either party to proceed with a project.
        </p>
        <p>
          Project scope, fees, timelines, deliverables, and other commercial terms are agreed separately in writing.
        </p>
      </LegalSection>

      <LegalSection title="5. Intellectual Property">
        <p>
          Unless otherwise stated, the content on this website — including text, layout, graphics, branding, and the
          BlankCO PH Solutions name and logo — is owned by or licensed to BlankCO PH Solutions and is protected by
          applicable intellectual property laws.
        </p>
        <p>
          You may view and share links to the site for personal or internal business reference. You may not reproduce,
          modify, distribute, sell, or create derivative works from the site&apos;s content without prior written
          permission, except as allowed by law.
        </p>
        <p>
          Third-party names, logos, trademarks, and project references belong to their respective owners and are used
          for identification or descriptive purposes only.
        </p>
      </LegalSection>

      <LegalSection title="6. User Submissions">
        <p>
          When you send an inquiry or other information through this website, you confirm that the information is
          accurate and that you have the right to share it. You grant BlankCO PH Solutions permission to use that
          information to respond to you, evaluate your inquiry, and manage our business relationship.
        </p>
        <p>
          Please do not send confidential, sensitive, or proprietary information through the contact form unless we have
          agreed on appropriate arrangements first. The form is intended for general inquiries.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-Party Links and Content">
        <p>
          This website may link to third-party websites, repositories, tools, or services, including GitHub and project
          sites. Those services are operated by their own providers and are governed by their own terms and privacy
          policies. We do not control and are not responsible for their content, availability, or practices.
        </p>
      </LegalSection>

      <LegalSection title="8. No Warranties">
        <p>
          This website and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the
          fullest extent permitted by law, BlankCO PH Solutions makes no warranties, express or implied, including
          warranties of accuracy, completeness, fitness for a particular purpose, non-infringement, or uninterrupted
          availability.
        </p>
        <p>
          We may update, suspend, or remove any part of the site without notice. We do not guarantee that the site will
          always be error-free or free of harmful components.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, BlankCO PH Solutions and its team members will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill,
          or business opportunity, arising from or related to your use of this website.
        </p>
        <p>
          Where liability cannot be excluded, our total liability arising from your use of the website will not exceed
          the amount you paid us, if any, for access to the website. Nothing in these terms limits liability that cannot
          lawfully be limited.
        </p>
      </LegalSection>

      <LegalSection title="10. Indemnification">
        <p>
          You agree to indemnify and hold harmless BlankCO PH Solutions and its team members from claims, losses,
          liabilities, and reasonable expenses arising from your misuse of the website, your violation of these terms,
          or your infringement of another party&apos;s rights.
        </p>
      </LegalSection>

      <LegalSection title="11. Privacy">
        <p>
          Our collection and use of personal information is described in our{' '}
          <Link to="/privacy" className="font-medium text-ink underline underline-offset-4">Privacy Policy</Link>.
          By using the site or submitting an inquiry, you acknowledge that policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to These Terms">
        <p>
          We may update these Terms of Use from time to time. The updated version will be posted on this page with a new
          &quot;Last updated&quot; date. Your continued use of the site after changes are posted means you accept the
          updated terms.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing Law">
        <p>
          These terms are governed by the laws of the Republic of the Philippines. Any dispute arising from or related
          to these terms or the website will be subject to the exclusive jurisdiction of the appropriate courts in
          Cagayan, Philippines, unless applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact Us">
        <p>
          If you have questions about these terms, contact BlankCO PH Solutions at{' '}
          <a href="mailto:hello@blankcoph.solutions" className="font-medium text-ink underline underline-offset-4">
            hello@blankcoph.solutions
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
