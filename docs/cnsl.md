# Cloud Native Sri Lanka (CNSL)

## 1. Introduction
Cloud Native Sri Lanka (CNSL) is a volunteer-driven community dedicated to promoting, exploring, and advancing the adoption of **cloud-native technologies** within Sri Lanka. The group serves as a platform for **knowledge sharing, collaboration, and professional networking**, welcoming students, professionals, researchers, and industry leaders.

CNSL operates as an inclusive and open community, guided by the principles of **open-source, knowledge exchange, and mutual growth**. It is officially recognized as part of the **Cloud Native Computing Foundation (CNCF) ecosystem**.

---

## 2. Mission and Vision
- **Mission**: To create a thriving local community where cloud-native practitioners, enthusiasts, and learners can share experiences, enhance skills, and contribute to the global ecosystem.
- **Vision**: To establish Sri Lanka as a recognized hub for cloud-native expertise in South Asia, contributing talent and innovation to the global cloud-native landscape.

---

## 3. Objectives
1. Increase awareness and understanding of **Kubernetes, containerization, microservices, DevOps, CI/CD, observability, and cloud-native security**.
2. Build a **supportive ecosystem** that connects students, engineers, researchers, and industry professionals.
3. Facilitate **hands-on learning** through workshops, demonstrations, and collaborative projects.
4. Provide a platform for **Sri Lankan voices in the global CNCF ecosystem**.
5. Develop structured **mentorship and career development programs** for new learners.

---

## 4. Community Structure
- **Core Organizers**: Lead and coordinate community initiatives, events, and external partnerships.
- **Volunteers**: Support operational activities, event logistics, and content creation.
- **Mentors**: Experienced professionals who guide mentees through structured mentorship.
- **Members**: Open to anyone interested in cloud-native technologies.

---

## 5. Key Programs and Activities

### 5.1 Monthly Meetups
- Regular **community meetups**, both in-person and virtual.
- Focus on **knowledge sharing**: lightning talks, case studies, panel discussions, and demos.
- Topics range from **technical deep dives** to **industry best practices**.
- Provides networking opportunities for **students and professionals**.
- Often hosted at **universities, coworking spaces, or tech hubs** in Colombo.

**Examples of Past Topics**:
- Introduction to Kubernetes for Beginners
- Cloud Native Security Best Practices
- Observability with Prometheus and Grafana
- Serverless Architectures on Kubernetes
- Scaling Microservices with Service Mesh

---

### 5.2 CNSL Connect Program
A structured **mentorship initiative** aimed at connecting experienced professionals with learners and early-career engineers.

- **Mentors**: Industry experts from leading local and global organizations.
- **Mentees**: Students, interns, or professionals seeking growth in cloud-native technologies.
- **Format**: Focused on **document-based progress tracking** (forms, reflections, reports) rather than frequent synchronous meetings.
- **Goals**:
  - Personalized guidance on learning paths.
  - Career advice and skill-building support.
  - Peer-to-peer accountability and structured check-ins.
- **Mid-Review Process**:
  - Separate evaluations for mentors and mentees.
  - Progress tracked via submission forms (learning outcomes, contributions, blockers).
  - Final showcase or reflection report at the program’s conclusion.

---

### 5.3 Special Events
- **Workshops**: Hands-on sessions for specific tools (Docker, Helm, Istio, etc.).
- **Hackathons**: Community-driven problem-solving events focused on open-source and cloud-native tooling.
- **Career Guidance Sessions**: Tailored for students and fresh graduates entering the cloud-native field.
- **Collaborations**: Partnerships with universities, global CNCF chapters, and local tech organizations.

---

### 5.4 Online Presence
- **Slack/Discord Community**: Peer-to-peer discussions, Q&A, and sharing resources.
- **GitHub Repository**: Hosting community projects, resources, and event archives.
- **YouTube Channel**: Recordings of past talks, workshops, and panel discussions.
- **Social Media (LinkedIn, Twitter/X, Facebook)**: Updates, highlights, and global engagement.

---

## 6. Impact
- Hundreds of participants across Sri Lanka engaged through meetups and events.
- Established a pipeline connecting **university students to industry mentors**.
- Enhanced visibility of Sri Lanka in the **global cloud-native ecosystem**.
- Contributed to **open-source projects** and knowledge bases.
- Fostered an inclusive space for **career growth, research, and collaboration**.

---

## 7. Future Plans
1. Expand **CNSL Connect** into a recurring bi-annual mentorship cycle.
2. Develop **cloud-native certification support groups** (e.g., CKA, CKAD, CKS).
3. Launch **Sri Lanka Cloud Native Summit** as a large-scale annual event.
4. Build stronger partnerships with **local universities** and **tech companies**.
5. Promote contributions to CNCF open-source projects from Sri Lankan members.
6. Explore **regional outreach** to universities outside Colombo.

---

## 8. Participation
- **How to Join**: Open to all interested in cloud-native technologies.
- **Ways to Contribute**:
  - Attend or speak at meetups.
  - Volunteer for community initiatives.
  - Mentor or enroll as a mentee in CNSL Connect.
  - Contribute to community documentation and open-source projects.

---

## 9. Conclusion
Cloud Native Sri Lanka (CNSL) stands as a growing, impactful community committed to advancing cloud-native technology adoption in the country. Through consistent meetups, structured mentorship, and collaborative initiatives, CNSL is shaping a new generation of cloud-native professionals, while amplifying Sri Lanka’s presence in the global CNCF ecosystem.


---

## 10. Website & UX Updates (2025-10-02)

This section tracks recent changes made to the CNSL website to improve content alignment, UX, and DevX.

### 10.1 Route Consolidation
- **Single contact hub**: Consolidated legacy routes into a single page at `'/contact'`.
  - `'/get-involved'` → Redirect to `'/contact'`.
  - `'/engage'` → Redirect to `'/contact'`.
- **Navigation**: Header and footer now link to `'/contact'`.
- **Sitemap**: Updated to include `'/contact'` and remove old routes.

### 10.2 Contact Page and Messaging Flow
- **New `'/contact'` page** (client-side) with improved form UX:
  - Core fields: name, email, topic, message.
  - Additional fields: affiliation/organization, preferred contact (email/phone), phone (conditional), referral source.
  - Speaking-specific fields: talk title, abstract (with counter), optional slides/demo link.
  - Query param prefills (e.g., `?topic=Speaking&name=...&email=...&org=...&ref=...`).
  - Character counters and validation.
- **API notifications** (`app/api/contact/route.ts`):
  - Sends email via Resend and message via Telegram bot.
  - Includes metadata: affiliation, preferred method, phone, referrer, talk details, page source URL, and user agent.
  - Honeypot field for basic anti-bot protection.

Required env vars:
- `RESEND_API` (HTTP API key), `FROM_EMAIL`, `NOTIFY_EMAIL`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### 10.3 Content Alignment with This Document
- **About** page updated to reflect this doc’s structure: Mission, Vision, Programs, Community structure, Future plans, and Organizers/Advisors.
- **Organizers data** sourced from `data/organizers.json` and rendered on the About page.

### 10.4 Layout & Visual Storytelling
- **Event Spotlight**: Reworked to a split left-right layout to reduce visual weight while maintaining prominence.
- **Asymmetric sections**: Added visual storytelling mosaics on About and Initiatives to break text monotony.
- **Spacing rhythm**: Standardized key sections to `py-20` for consistent vertical rhythm across pages (Blog, Events, Insights, etc.).

### 10.5 Design System Tweaks
- **Buttons**: Unified primary CTAs to a solid theme (blue-600/700) for clarity and consistency; removed gradients in key CTAs.
- **Navigation**: Header, hero, and footer CTAs point consistently to `'/contact'` and `'/events'`.

### 10.6 Backward Compatibility & Redirects
- Added redirect pages to preserve external links to `'/get-involved'` and `'/engage'`.

### 10.7 Next Iterations (Proposed)
- Shared `Section` wrapper to enforce spacing tokens and container widths uniformly.
- Event detail page gallery (asymmetric mosaic + thumbnails) and testimonials band for social proof.
- Optional rate-limiting and CAPTCHA for the contact form if spam appears.

