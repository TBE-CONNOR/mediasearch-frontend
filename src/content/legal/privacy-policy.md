# Privacy Policy

**Last updated: February 20, 2026**

This Privacy Policy describes how Connor Boetig, doing business as MediaSearch ("MediaSearch," "we," "us," or "our"), collects, uses, discloses, and protects your personal information when you visit our website at [https://www.trymediasearch.com](https://www.trymediasearch.com) (the "Site") and use our AI-powered semantic search platform (the "Service"). By accessing or using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.

Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Site or use the Service.

---

## Table of Contents

1. [What Information We Collect](#1-what-information-we-collect)
2. [How We Collect Your Information](#2-how-we-collect-your-information)
3. [How We Use Your Information](#3-how-we-use-your-information)
4. [Sharing Your Information with Third Parties](#4-sharing-your-information-with-third-parties)
5. [Stripe Payment Processing Disclosure](#5-stripe-payment-processing-disclosure)
6. [Artificial Intelligence Products and Features](#6-artificial-intelligence-products-and-features)
7. [Cookies and Tracking Technologies](#7-cookies-and-tracking-technologies)
8. [International Data Transfers](#8-international-data-transfers)
9. [Data Retention](#9-data-retention)
10. [Security of Your Information](#10-security-of-your-information)
11. [Policy on Minors](#11-policy-on-minors)
12. [Your Privacy Rights Under GDPR (EU/EEA/UK/Switzerland)](#12-your-privacy-rights-under-gdpr-eueeeaukswiss)
13. [Your Privacy Rights Under CCPA and US State Laws](#13-your-privacy-rights-under-ccpa-and-us-state-laws)
14. [Do-Not-Track Signals](#14-do-not-track-signals)
15. [Updates to This Privacy Policy](#15-updates-to-this-privacy-policy)
16. [How to Contact Us](#16-how-to-contact-us)

---

## 1. What Information We Collect

We collect personal information that you voluntarily provide to us when you register for an account, use the Service, or otherwise communicate with us. The categories of personal information we collect include:

**Account Information:**
- Full name
- Email address
- Username
- Password (managed securely by AWS Cognito; never stored directly by MediaSearch)
- Billing address

**Payment Information:**
- Payment transactions are processed by Stripe, Inc. MediaSearch does not store, access, or receive your payment card numbers, CVV codes, or full card details. We receive only transaction confirmations, subscription status, and billing-related metadata from Stripe.

**User-Uploaded Content:**
- Image files
- Video files
- Audio files
- Document files
- Any other files you upload to the Service for AI-powered search and analysis

**Usage Data:**
- We log usage data strictly for quota enforcement purposes. This includes the number of images, videos, audio files, and documents you process per month. This data is stored in our database and is not used for advertising or behavioral targeting.

**Information We Do Not Collect:**
- We do not collect Social Security numbers, government-issued identification numbers, health information, biometric data, or other sensitive personal information.
- We do not collect personal information from third-party sources.
- We do not automatically collect IP addresses, device information, or browser information beyond what is necessary for authentication session management.

---

## 2. How We Collect Your Information

We collect information through the following methods:

**Directly From You:**
- When you create an account and provide registration information
- When you upload files to the Service for processing
- When you update your account or billing information
- When you contact us via email for support or inquiries

**Automatically Through Cookies and Session Storage:**
- We use cookies and browser local storage for authentication and session management via AWS Cognito. See Section 7 for details.

**From Third-Party Service Providers:**
- We do not purchase or otherwise receive personal information about you from third-party data brokers or other external sources.

---

## 3. How We Use Your Information

We use the personal information we collect for the following purposes:

- **Providing the Service:** To operate the MediaSearch platform, process your uploaded files using AI-powered analysis, and deliver semantic search results.
- **Account Management:** To create and manage your user account, authenticate your identity, and maintain your session.
- **Payment Processing:** To process your subscription payments through Stripe, manage your subscription tier, and enforce usage quotas.
- **Quota Enforcement:** To track and enforce file processing limits associated with your subscription plan.
- **Communications:** To send you transactional communications, including password reset emails and billing receipts. We do not send marketing emails, newsletters, or promotional messages.
- **Security and Fraud Prevention:** To detect, prevent, and respond to fraud, unauthorized access, and other security threats to the Service.
- **Legal Compliance:** To comply with applicable laws, regulations, and legal processes, and to enforce our Terms of Service.

We do not use your personal information for advertising, behavioral targeting, or profiling purposes.

---

## 4. Sharing Your Information with Third Parties

We do not sell, rent, or trade your personal information to any third party, and we will never do so.

We share your personal information only with the following categories of service providers, and only to the extent necessary to provide the Service:

**Amazon Web Services (AWS):**
- AWS provides our cloud infrastructure, including servers, storage, and AI processing services (AWS Bedrock). Your uploaded files are processed by AWS AI services to generate the metadata and embeddings that power MediaSearch's semantic search functionality. Your data is stored in AWS infrastructure located in the US-East-1 (Northern Virginia) region. AWS processes your data as a data processor on our behalf, subject to the [AWS Data Processing Addendum](https://d1.awsstatic.com/legal/aws-gdpr/AWS_GDPR_DPA.pdf).

**Stripe, Inc.:**
- Stripe processes all subscription payments for MediaSearch. When you subscribe to a paid plan, your payment information is collected and processed directly by Stripe. MediaSearch does not store or have access to your full payment card details. Stripe's handling of your payment data is governed by Stripe's own privacy policy, available at [https://stripe.com/privacy](https://stripe.com/privacy). See Section 5 for additional disclosures about Stripe's independent data collection.

We may also disclose your personal information if required to do so by law, regulation, legal process, or governmental request, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.

---

## 5. Stripe Payment Processing Disclosure

MediaSearch uses Stripe, Inc. as its third-party payment processor. This section provides important disclosures about how Stripe handles your data:

- **What MediaSearch Receives:** We receive only transaction confirmations, subscription status information, and billing-related metadata from Stripe. We do not store, see, or receive your payment card numbers or full card details.

- **Stripe's Independent Data Collection:** When you interact with Stripe's payment interface (such as during checkout), Stripe independently collects certain information directly from you and your device, including your device information, IP address, and browsing behavior. This collection is governed by Stripe's own privacy policy and occurs independently of MediaSearch.

- **MediaSearch Does Not Control Stripe's Data Practices:** The data that Stripe collects directly from you during payment interactions is not controlled by, shared with, or accessible to MediaSearch. We have no access to or control over the information Stripe collects independently.

- **Review Stripe's Privacy Policy:** We encourage you to review Stripe's privacy policy at [https://stripe.com/privacy](https://stripe.com/privacy) to understand how Stripe collects, uses, and protects your information during payment transactions.

---

## 6. Artificial Intelligence Products and Features

MediaSearch is an AI-powered platform. The following AI features are integral to the Service:

- **AI-Powered Semantic Search:** Natural language search across your uploaded media files.
- **Image Analysis:** Automated analysis and metadata extraction from uploaded images.
- **Video Analysis:** Automated analysis and metadata extraction from uploaded video files.
- **Audio Analysis:** Automated transcription and analysis of uploaded audio files.

**How AI Processing Works:**
- When you upload files to MediaSearch, those files are sent to AWS Bedrock (Amazon Web Services) for AI processing. AWS Bedrock generates metadata, descriptions, transcriptions, and vector embeddings that enable the semantic search functionality of MediaSearch.
- Your uploaded content is processed by AWS AI services solely for the purpose of providing the MediaSearch Service to you.
- We do not use your uploaded content to train AI models. Your content is processed on-demand and the results are stored in your account for search purposes only.

**User Responsibilities:**
- You must not use the AI features of MediaSearch in any way that violates the AWS Acceptable Use Policy or any applicable law. You are solely responsible for the content you upload and the manner in which you use the AI-generated results.

---

## 7. Cookies and Tracking Technologies

**Cookies and Local Storage We Use:**

MediaSearch uses cookies and browser local storage for the following purposes:

- **Authentication and Session Management:** We use cookies and browser localStorage to store authentication tokens issued by AWS Cognito. These tokens are necessary to keep you logged in and to authenticate your requests to the Service. These are essential cookies required for the Service to function.

**Cookies and Technologies We Do Not Use:**
- We do not use advertising cookies or tracking pixels.
- We do not use Google Analytics or any third-party analytics tools.
- We do not use social media tracking cookies.
- We do not engage in cross-site tracking or behavioral advertising.

**Managing Cookies:**
Most web browsers allow you to control cookies through their settings. However, if you disable or delete the cookies used by MediaSearch, you may not be able to remain logged in or use certain features of the Service.

---

## 8. International Data Transfers

MediaSearch is operated from the United States. All data is stored and processed on AWS infrastructure located in the US-East-1 (Northern Virginia) region.

**If You Are Located in the European Union, European Economic Area, United Kingdom, or Switzerland:**

If you access the Service from the EU, EEA, UK, or Switzerland, your personal data will be transferred to the United States. We rely on the following legal mechanisms to ensure that your data is adequately protected during transfer:

- **Standard Contractual Clauses (SCCs):** Both AWS and Stripe have entered into Data Processing Addendums that incorporate the European Commission's Standard Contractual Clauses for the transfer of personal data to third countries. These SCCs provide contractual safeguards to ensure that your personal data receives an adequate level of protection when transferred outside the EU/EEA/UK.

**EU/UK Representative:**
MediaSearch is a small United States-based business and has not appointed a representative in the EU or UK at this time. If you have questions about how we handle your personal data, please contact us directly at the contact information provided in Section 16.

**Data Privacy Framework:**
MediaSearch does not currently participate in the EU-US Data Privacy Framework, the UK Extension to the EU-US Data Privacy Framework, or the Swiss-US Data Privacy Framework.

---

## 9. Data Retention

We retain your personal information for as long as your account remains active and as necessary to provide you with the Service.

**Upon Account Termination or Deletion:**
- Your personal data and uploaded content will be retained for thirty (30) days following account deletion or termination.
- After the 30-day retention period, your data is purged from our active databases.
- Some data may be retained in encrypted backups for a limited additional period as required for legal compliance, tax, or accounting obligations.

**Usage Data:**
- Usage data collected for quota enforcement purposes is retained for the duration of your account and is deleted in accordance with the same schedule as your account data.

---

## 10. Security of Your Information

We take the security of your personal information seriously and implement administrative, technical, and physical safeguards designed to protect your data. Our security measures include:

- **Encryption in Transit:** All data transmitted between your browser and our servers is encrypted using HTTPS/TLS.
- **Authentication Security:** User authentication is managed by AWS Cognito, which handles password hashing, storage, and verification. Passwords are never stored directly by MediaSearch. All API requests require both a valid JWT token and an API key.
- **File Storage Security:** User-uploaded files are stored in private Amazon S3 buckets with no public access. Files are served through Amazon CloudFront with Origin Access Control (OAC). Direct access to S3 storage URLs is blocked and returns a 403 error. Presigned URLs for file access expire after 15 minutes.
- **Access Controls:** All AWS services are configured with IAM roles following the principle of least privilege. User data is isolated by Cognito user ID, making cross-user data access impossible by design.
- **Secrets Management:** Sensitive credentials (such as Stripe API keys) are stored in AWS Secrets Manager, not in environment variables or code.
- **Infrastructure Security:** Our infrastructure runs on Amazon Web Services in the US-East-1 region, benefiting from AWS's comprehensive physical, environmental, and operational security controls.

While we implement these safeguards in good faith, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your information, and you use the Service at your own risk.

---

## 11. Policy on Minors

MediaSearch is not intended for use by individuals under the age of eighteen (18). We do not knowingly collect personal information from anyone under the age of 18.

If we become aware that we have collected personal information from a person under the age of 18, we will take immediate steps to deactivate the account and delete the associated personal information from our systems.

If you are a parent or guardian and believe that your child under the age of 18 has provided personal information to MediaSearch, please contact us at boetigsolutions@gmail.com so that we can take appropriate action.

---

## 12. Your Privacy Rights Under GDPR (EU/EEA/UK/Switzerland)

If you are located in the European Union, European Economic Area, United Kingdom, or Switzerland, you have the following rights under the General Data Protection Regulation (GDPR) and applicable local data protection laws:

- **Right of Access:** You have the right to request a copy of the personal data we hold about you.
- **Right to Rectification:** You have the right to request that we correct any inaccurate or incomplete personal data we hold about you. You may also update your account information at any time by logging in to your account.
- **Right to Erasure ("Right to Be Forgotten"):** You have the right to request that we delete your personal data, subject to certain legal exceptions.
- **Right to Restriction of Processing:** You have the right to request that we restrict the processing of your personal data in certain circumstances.
- **Right to Data Portability:** You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller.
- **Right to Object:** You have the right to object to the processing of your personal data in certain circumstances, including processing for direct marketing purposes.
- **Right to Withdraw Consent:** Where we rely on your consent to process personal data, you have the right to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing based on consent before its withdrawal.
- **Right to Lodge a Complaint:** You have the right to lodge a complaint with your local data protection supervisory authority if you believe that our processing of your personal data violates applicable law.

**Legal Bases for Processing (GDPR Article 6):**
We process your personal data on the following legal bases:
- **Performance of a Contract:** Processing necessary to provide you with the Service in accordance with our Terms of Service.
- **Legitimate Interests:** Processing necessary for our legitimate interests, such as fraud prevention, security, and improving the Service, where those interests are not overridden by your data protection rights.
- **Legal Obligation:** Processing necessary to comply with applicable laws and regulations.
- **Consent:** Where you have given us specific consent for a particular processing activity.

**How to Exercise Your Rights:**
To exercise any of the rights described above, please submit your request by emailing us at boetigsolutions@gmail.com. We will respond to your request within thirty (30) days, or within the time period required by applicable law. We may request additional information from you to verify your identity before fulfilling your request.

---

## 13. Your Privacy Rights Under CCPA and US State Laws

**California Residents (CCPA/CPRA):**

If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA):

- **Right to Know:** You have the right to request information about the categories and specific pieces of personal information we have collected about you, the categories of sources from which we collected it, the business purpose for collecting it, and the categories of third parties with whom we share it.
- **Right to Delete:** You have the right to request that we delete the personal information we have collected about you, subject to certain exceptions.
- **Right to Correct:** You have the right to request that we correct inaccurate personal information we hold about you.
- **Right to Opt-Out of Sale or Sharing:** We do not sell your personal information, and we do not share your personal information for cross-context behavioral advertising purposes. Because we do not engage in these activities, there is no need to opt out.
- **Right to Non-Discrimination:** We will not discriminate against you for exercising any of your CCPA rights.

**Categories of Personal Information Collected (per CCPA categories):**
- Identifiers (name, email address, username)
- Commercial information (subscription and transaction records)
- Internet or other electronic network activity (authentication session data)
- Audio, electronic, visual, or similar information (user-uploaded files)

**Sale of Personal Information:**
MediaSearch does not sell personal information to third parties and has not sold personal information in the preceding twelve (12) months.

**Other US State Privacy Laws:**

Residents of Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana, and other states with comprehensive privacy laws may have similar rights, including the right to access, correct, delete, and opt out of certain processing activities. To exercise any of these rights, please contact us using the information in Section 16.

**How to Exercise Your Rights:**
To exercise any of the rights described above, please submit your request by emailing us at boetigsolutions@gmail.com. We will verify your identity and respond to your request within forty-five (45) days, or within the time period required by applicable law. You may also designate an authorized agent to submit a request on your behalf.

---

## 14. Do-Not-Track Signals

Some web browsers transmit "Do Not Track" (DNT) signals to websites. There is currently no universally accepted standard for how online services should respond to DNT signals. Accordingly, MediaSearch does not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.

If a standard for responding to DNT signals is adopted in the future, we will update this Privacy Policy to reflect our practices with respect to such standard.

---

## 15. Updates to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make changes, we will update the "Last updated" date at the top of this Privacy Policy.

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the updated terms.

---

## 16. How to Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

**Connor Boetig, doing business as MediaSearch**

- **Email:** boetigsolutions@gmail.com
- **Mail:** Connor Boetig, 200 Marine Blue Court, Edgewater, MD 21037, United States

We will make every effort to respond to your inquiry within a reasonable time frame.
