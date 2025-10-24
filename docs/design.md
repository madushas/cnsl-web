# CNSL Community Website & Operations Platform - Functional Specification

---

## 1. Overview

This document describes the **complete functional design** for the CNSL community website and integrated operations platform.
The goal is to:

* Showcase CNSL initiatives publicly.
* Manage events (meetups, outreach) and programs (CNSL Connect mentorship) via user accounts.
* Provide organizers with dashboards to handle event registrations, communications, check-ins, and reporting.

The platform is split into two logical sections:

* **Public Website** (open access, content showcase, conversions)
* **Authenticated Webapp** (user account area + organizer/admin tools)

---

## 2. Public Website Structure

### 2.1 Home Page

* Hero section: tagline + quick CTA (“Join the Community”, “Register for Next Meetup”).
* Cards highlighting **CNSL Connect**, **University Outreach**, and **Monthly Meetups**.
* Section: “Upcoming Event” → show next meetup card with date, city, speakers, and Register button.
* Recent blogs/news highlights.
* Partner/Sponsor logo carousel.
* Footer: newsletter signup, social links, Code of Conduct, privacy, contact.

---

### 2.2 About Page

* Mission, Vision, and Objectives.
* Introduction to Cloud Native Sri Lanka’s role in CNCF ecosystem.
* Community structure: organizers, volunteers, mentors.
* Team cards with photos, bios, and LinkedIn/GitHub links.
* Code of Conduct with acknowledgment requirement (linked in all registrations).

---

### 2.3 Programs Pages

**Each program gets its own subpage with clear content sections.**

#### CNSL Connect (Mentorship Program)

* Overview of program purpose and outcomes.
* Timeline of cohort cycle (applications, matching, mid-review, final showcase).
* Eligibility and expectations for mentors & mentees.
* Application button (opens authenticated flow).
* FAQ (time commitment, process, contact).

#### University Outreach

* Description: sessions at universities, workshops, knowledge-sharing.
* Step-by-step “How to request a session” with intake form link.
* Showcase of past collaborations (logos, recap blurbs, photos).
* Testimonials from university partners.

#### Monthly Meetups

* Explanation of meetup format (lightning talks, panels, networking).
* Archive of past meetups with thumbnails linking to detail pages.
* Link to speak: “Submit a talk proposal”.

---

### 2.4 Events Page

* **Events List View**:

  * Filter: city, date range, topic.
  * Card: event title, date/time, venue, short description, “Register” button.

* **Event Detail Page**:

  * Banner with title, date, city, venue, Google Map link.
  * Agenda with sessions/speakers (with bios and talk abstracts).
  * Capacity + number of spots left.
  * RSVP/Registration button (login required).
  * Code of Conduct reminder.
  * Past event recaps: photos, recordings, slides.

---

### 2.5 Blog / Updates

* Blog listing (cards with image, date, author, tags).
* Categories: “Recap”, “News”, “Guides”.
* Post detail page with social sharing buttons.

---

### 2.6 Get Involved

* **Membership**: Create account to join.
* **Volunteer**: Apply via form (linked to user profile).
* **Speak at Meetup**: Submit talk proposal form.
* **Mentor/Mentee**: Link to CNSL Connect application.
* **Partner/Sponsor**: Inquiry form.

---

### 2.7 Contact

* Simple form (name, email, subject, message).
* Email routing to organizers.
* Social media links.

---

## 3. User Accounts & Profile

### 3.1 Authentication

* Options: Email login (Resend magic link) + OAuth (Google, GitHub).
* Onboarding flow: First-time login asks user to complete profile.

### 3.2 User Profile

* Personal details: name, email, photo, city, occupation.
* Skills & interests (tags).
* Event history (registered, attended, feedback submitted).
* Mentorship/Outreach applications (status view).
* Consents dashboard (newsletter, WhatsApp updates, photo consent, CoC acceptance).

---

## 4. Event Registration Flow

### 4.1 Flow Steps

1. **Browse event** → click Register.
2. If not logged in → redirect to login/signup.
3. Confirm RSVP:

   * Checkbox: “I agree to Code of Conduct”.
   * Confirm button.
4. System creates `Registration` record (user_id, event_id, status = registered).
5. Generate **unique QR code** (opaque token, non-human readable).
6. Email sent to user (via Resend):

   * Confirmation with QR image
   * Event details + calendar file (.ics)
   * Venue details + map link
   * Code of Conduct link
7. Reminder emails:

   * T-72h: event reminder
   * T-24h: final reminder + QR link
8. At venue: Organizer scans QR (mobile scanner app or web dashboard).
9. Status updates to “Checked-In”.
10. Post-event: system sends feedback form link to attendees.

---

### 4.2 Organizer Event Dashboard

* Create event (title, description, venue, capacity, start/end time).
* Manage sessions (add speakers, agenda items).
* View RSVPs (searchable by name/email).
* Export RSVP list (CSV).
* Check-in view: scan QR or manual lookup.
* Track attendance (registered vs. checked-in).
* Post-event reports: attendance rate, feedback scores.

---

## 5. University Outreach Module

### 5.1 Partner Request Flow

* Form on Outreach page:

  * University name, department, contact details
  * Audience size, preferred dates
  * Topics requested
  * Objectives (career guidance, technical deep dive, etc.)
* Organizer dashboard: requests → approve/decline → assign organizer & speaker.

### 5.2 Delivery Tracking

* Event created under “Outreach” type.
* Attendance + feedback recorded.
* Institution page updated with recap + impact stats.

---

## 6. CNSL Connect (Mentorship Module)

### 6.1 Application Flow

* Mentor Application: experience, skills, availability, mentoring style.
* Mentee Application: background, goals, preferred skills, availability.
* Both stored in DB, reviewed by organizers.

### 6.2 Matching

* Semi-automated: filter mentees by goals/skills → suggest mentors.
* Manual approval by organizers.

### 6.3 Cohort Portal

* Announcements (by organizers).
* Mentor/Mentee dashboard:

  * Pair info, schedule meetings, log notes.
  * Track goals/milestones.
* Midpoint evaluation form.
* Final evaluation form + auto certificate generation.

---

## 7. Content & Communication System

### 7.1 CMS Pages

* Editable via simple admin interface (Markdown editor for blog, program pages).
* Upload media assets (photos, slides).

### 7.2 Emails (via Resend)

* Templates:

  * RSVP Confirmation
  * Event Reminder (72h, 24h)
  * Feedback Request
  * Application received / accepted / declined
  * Mentorship cohort updates

### 7.3 Notifications

* Email is primary.
* Optional WhatsApp broadcast for urgent updates (event changes).

---

## 8. Governance & Safety

* Code of Conduct acceptance required for all RSVPs/applications.
* Incident report form (confidential submission).
* Photo/video consent opt-out available in profile.
* Privacy & Terms of Service pages mandatory.

---

## 9. Feedback & Metrics

* **Events**:

  * Post-event feedback form (overall rating, session-specific rating, comments).
  * NPS calculation.
* **Mentorship**:

  * Midpoint + final evaluations.
  * Retention tracking.
* **Outreach**:

  * Institution impact metrics (#sessions, avg. attendance, repeat collaborations).

Dashboard reports for organizers:

* Event conversion funnel (page views → RSVPs → attendance → feedback).
* Mentorship cohort health.
* Outreach activity by institution.

---

## 10. Admin / Moderator Functions

* Dashboard with role-based access (Organizer, Moderator, Admin).
* Manage users (assign roles: mentor, speaker, sponsor).
* Approve content before publishing.
* Event lifecycle management.
* Cohort and outreach pipelines.
* Incident report inbox.

---

## 11. Data Models (Simplified)

* **User**: id, name, email, roles, consents.
* **Profile**: user_id, bio, skills, interests.
* **Event**: id, title, desc, type (meetup/outreach), date, venue, capacity.
* **Session**: id, event_id, speaker_id, abstract.
* **Registration**: user_id, event_id, qr_token, status.
* **Feedback**: event_id, user_id, ratings, comments.
* **Application**: user_id, type (mentor/mentee/outreach), fields, status.
* **Match**: mentor_id, mentee_id, cohort_id.
* **Certificate**: user_id, cohort_id, issued_on, file_url.

---

## 12. Content Assets Needed

* Logos (dark/light).
* Event photography (with consent).
* Speaker photos/bios.
* Templates: slide decks, certificate, email.
* Social media banners for events.

---

## 13. Success Criteria

* Clean, modern, responsive site.
* 1-click event registration with QR-based check-in.
* Organized dashboards reduce manual workload.
* Mentorship and outreach programs visible and manageable.
* Attendee experience is professional and consistent.

---