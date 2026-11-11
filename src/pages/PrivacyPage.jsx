import { Link } from 'react-router-dom'
import LegalPage, { LegalSection } from '../components/LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This Privacy Policy explains how BlankCO PH Solutions collects, uses, stores, and protects personal information when you visit our website or contact us."
      lastUpdated="November 11, 2026"
    >
      <LegalSection title="1. Who We Are">
        <p>
          BlankCO PH Solutions is a student-led digital solutions team based in San Jose, Baggao, Cagayan, Philippines.
          For purposes of the Data Privacy Act of 2012 (Republic Act No. 10173), we act as the personal information
          controller for the information described in this policy.
        </p>
        <p>
          You can reach us at{' '}
          <a href="mailto:hello@blankcoph.solutions" className="font-medium text-ink underline underline-offset-4">
            hello@blankcoph.solutions
          </a>{' '}
          or +63 953 174 3347.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>Depending on how you use the site, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Contact form information:</strong> your name, email address, company name, the service you are
            interested in, your message, and your consent confirmation.
          </li>
          <li>
            <strong>Technical and usage information:</strong> IP address, browser and device type, operating system,
            pages visited, referring URL, and timestamps. This may be processed by our hosting and security providers
            in server logs.
          </li>
          <li>
            <strong>Administrative account information:</strong> if you are an authorized administrator, we process your
            email address and authentication session so you can access the admin area. This information is not
            published on the public site.
          </li>
          <li>
            <strong>Team profile information:</strong> professional details that team members have agreed to publish,
            such as name, role, location, bio, skills, education, GitHub URL, portfolio URL, and profile photo.
          </li>
        </ul>
        <p>
          We do not intentionally collect sensitive personal information through the public contact form. Please do not
          submit sensitive information such as government IDs, financial account details, health information, or
          passwords through that form.
        </p>
      </LegalSection>

      <LegalSection title="3. How We Collect Information">
        <p>We collect information:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>directly from you when you submit the contact form or communicate with us;</li>
          <li>automatically through our hosting, security, and analytics providers when you visit the site;</li>
          <li>from authorized administrators when they sign in to manage site content; and</li>
          <li>from team members when they provide profile details for publication.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How We Use Information">
        <p>We use personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>respond to inquiries and communicate about potential or ongoing projects;</li>
          <li>provide, operate, maintain, and improve the website and our services;</li>
          <li>publish team profiles and project information as part of our public presence;</li>
          <li>protect the site against spam, abuse, fraud, and security threats;</li>
          <li>comply with legal obligations and enforce our rights; and</li>
          <li>understand aggregate site usage so we can improve content and performance.</li>
        </ul>
        <p>We do not sell personal information.</p>
      </LegalSection>

      <LegalSection title="5. Legal Bases for Processing">
        <p>
          Under the Data Privacy Act of 2012 and its implementing rules, we process personal information based on one
          or more of the following:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Consent</strong> — for example, when you tick the consent box and submit the contact form.
          </li>
          <li>
            <strong>Contract or pre-contractual steps</strong> — when processing is needed to respond to your request or
            prepare for a project.
          </li>
          <li>
            <strong>Legitimate interests</strong> — such as securing the site, preventing abuse, and improving our
            services, provided your rights are not overridden.
          </li>
          <li>
            <strong>Legal obligation</strong> — when we need to comply with applicable law or lawful requests from
            authorities.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Cookies, Analytics, and Similar Technologies">
        <p>
          The public website does not use advertising or cross-site tracking cookies. We may use privacy-friendly,
          aggregate analytics to understand site traffic and performance. Our CDN and security provider may process
          request data to protect the site and deliver content.
        </p>
        <p>
          If you sign in to the admin area, our authentication provider may store session information in your browser
          so you can stay signed in. You can clear this through your browser settings, which will sign you out.
        </p>
        <p>
          Third-party sites linked from this website may use their own cookies and tracking technologies. Their
          practices are governed by their own policies.
        </p>
      </LegalSection>

      <LegalSection title="7. How We Share Information">
        <p>
          We may share information with service providers that help us operate the site and our business, including:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Supabase</strong> — database, authentication, and file storage;</li>
          <li><strong>Vercel</strong> — website hosting and deployment;</li>
          <li><strong>Cloudflare</strong> — content delivery, security, and aggregate analytics; and</li>
          <li><strong>GitHub</strong> — when we link to repositories or display publicly available profile images.</li>
        </ul>
        <p>
          We may also disclose information if required by law, legal process, or a lawful request from a competent
          authority, or if necessary to protect our rights, safety, or property. We do not sell or rent personal
          information.
        </p>
      </LegalSection>

      <LegalSection title="8. International Transfers">
        <p>
          Our service providers may store or process information in countries other than the Philippines. Where this
          happens, we take reasonable steps to ensure that the information receives an appropriate level of protection
          consistent with applicable data privacy laws.
        </p>
      </LegalSection>

      <LegalSection title="9. Data Retention">
        <p>
          We keep personal information only for as long as necessary for the purposes described in this policy. Contact
          inquiries are retained while we respond to them and for a reasonable period afterward for record-keeping,
          unless a longer period is required by law. Server logs are retained according to our providers&apos; standard
          retention periods. When information is no longer needed, we delete it or anonymize it.
        </p>
      </LegalSection>

      <LegalSection title="10. How We Protect Information">
        <p>
          We use reasonable organizational and technical safeguards, including HTTPS, access controls, and database
          security rules that restrict who can read or modify stored information. Access to inquiry data is limited to
          authorized team members.
        </p>
        <p>
          No method of transmission or storage is completely secure. While we work to protect personal information, we
          cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="11. Your Rights">
        <p>
          Subject to the Data Privacy Act of 2012 and applicable regulations, you may have the right to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>be informed about how your personal information is processed;</li>
          <li>access the personal information we hold about you;</li>
          <li>request correction of inaccurate or incomplete information;</li>
          <li>request erasure or blocking of your information in certain circumstances;</li>
          <li>object to certain processing or withdraw consent, where processing is based on consent;</li>
          <li>request data portability in certain circumstances; and</li>
          <li>file a complaint with the National Privacy Commission (NPC).</li>
        </ul>
        <p>
          To exercise a right, contact us at{' '}
          <a href="mailto:hello@blankcoph.solutions" className="font-medium text-ink underline underline-offset-4">
            hello@blankcoph.solutions
          </a>
          . We may need to verify your identity before acting on your request. We will respond within the period
          required by applicable law.
        </p>
        <p>
          If you believe your rights have been violated, you may contact the National Privacy Commission through its
          official website or complaint channels.
        </p>
      </LegalSection>

      <LegalSection title="12. Children's Privacy">
        <p>
          This website is not directed to children under 18, and we do not knowingly collect personal information from
          children. If you believe a child has provided us with personal information, contact us and we will take
          reasonable steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="13. Third-Party Links">
        <p>
          The site may link to third-party websites, repositories, and tools. We are not responsible for their privacy
          practices. We encourage you to review their policies before providing personal information.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to This Privacy Policy">
        <p>
          We may update this policy from time to time. The updated version will be posted on this page with a new
          &quot;Last updated&quot; date. If changes are material, we will take reasonable steps to make them known.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact Us">
        <p>
          For privacy questions or requests, contact BlankCO PH Solutions at{' '}
          <a href="mailto:hello@blankcoph.solutions" className="font-medium text-ink underline underline-offset-4">
            hello@blankcoph.solutions
          </a>
          , +63 953 174 3347, or San Jose, Baggao, Cagayan, Philippines.
        </p>
        <p>
          You can also read our{' '}
          <Link to="/terms" className="font-medium text-ink underline underline-offset-4">Terms of Use</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
