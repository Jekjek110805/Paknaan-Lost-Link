# Paknaan LostLink - Complete Feature Blueprint and Improvement Plan

> Project: Barangay Lost and Found Web System for Barangay Paknaan  
> Version: Capstone-ready professional blueprint  
> Scope: Full-stack web system, database, API, UI/UX, security, integrations, testing, and deployment  
> Intended readers: Students, teachers, barangay officials, developers, and project panelists

---

## 1. Project Overview

### Project Title

**Paknaan LostLink: Barangay Paknaan Lost and Found Web System**

### Short Description

Paknaan LostLink is a mobile-first web platform where residents and community members can report lost items, post found items, search public listings, submit claims, upload proof of ownership, receive notifications, and coordinate item return through barangay officials. The improved system adds role-based dashboards, admin approval, claim verification, AI-based item matching, QR claim slips, Gmail notifications, Facebook sharing, audit logs, security controls, and report generation.

### Vision

To become Barangay Paknaan's trusted digital lost-and-found center, making item recovery faster, more transparent, and more secure for residents and barangay personnel.

### Mission

To provide a secure, accessible, and barangay-friendly platform that connects lost-item reporters, honest finders, and barangay officials through verified reports, guided claims, useful notifications, and accountable record keeping.

### Purpose

- Help residents report and search lost or found items without relying only on word of mouth or scattered Facebook posts.
- Give barangay officials a structured way to verify claims and document returned items.
- Reduce fake claims by requiring proof, audit trails, verification remarks, and QR-based release validation.
- Generate official monthly summaries for barangay documentation.
- Promote community honesty through badges and recognition.

### Main Goal

Build a complete barangay-ready system that supports the full lifecycle of item recovery:

1. Report lost or found item.
2. Admin or official reviews and approves the post.
3. System suggests possible matches.
4. Owner submits claim with proof.
5. Barangay verifies the claim.
6. Approved claimant receives QR claim slip.
7. Item is released and marked returned.
8. Records are included in reports and audit logs.

### Target Users

| User | Description | Main Need |
|---|---|---|
| Admin | System owner or assigned technical/barangay administrator | Full management, analytics, reports, security review |
| Barangay Official | Authorized barangay personnel handling lost-and-found operations | Verify reports, review claims, release items, generate reports |
| Resident / People | Residents, visitors, workers, students, or anyone who lost/found an item in Paknaan | Post, search, claim, receive updates |

### Problem It Solves

| Current Problem | Improved System Response |
|---|---|
| Lost/found reports are scattered across verbal reports, paper logs, and social media | Centralized searchable database |
| Fake claims are hard to detect | Claim proof, official review, suspicious-claim scoring, audit trail |
| People do not know where to check for found items | Public lost/found listing with search and filters |
| Barangay staff manually track claims | Dashboards, status workflow, QR release validation |
| No reliable monthly record | Exportable PDF/CSV reports |
| Users miss updates | In-app and Gmail notifications |
| Matching lost and found reports is manual | AI-assisted matching and similar-item suggestions |

### Why Barangay Paknaan Needs It

Barangay Paknaan can benefit from a practical digital lost-and-found system because residents are likely to report incidents through mobile phones, barangay staff need reliable documentation, and community recovery is faster when verified reports are searchable in one official platform. The system also supports barangay digital transformation by improving transparency, traceability, and resident service.

### What Makes It Innovative

| Innovation | Practical Value |
|---|---|
| AI item matching | Suggests possible lost/found pairs using title, category, description, date, location, and image metadata when available |
| QR claim slips | Gives approved claimants a verifiable release slip that officials can scan or check |
| Suspicious claim detection | Flags repeated weak claims, mismatched proofs, and repeated rejected claimants |
| Role-based dashboards | Admin, official, and resident users see different workflows |
| Gmail notifications | Sends official updates even when users are offline |
| Facebook sharing | Lets approved posts reach the barangay community faster |
| Community honesty badges | Encourages finders and active helpers |
| Bilingual UI | Supports English and Cebuano labels for barangay-friendly access |
| Audit logs | Creates accountability for admin and official actions |
| Report generation | Supports official barangay documentation and capstone evidence |

---

## 2. User Roles and Permissions Blueprint

### Permission Summary

| Permission Area | Admin | Barangay Official | Resident / People |
|---|---|---|---|
| Public lost/found browsing | Yes | Yes | Yes |
| Account registration | Can create/invite users | Invite only or admin-created | Yes |
| Post lost item | Yes | Yes | Yes |
| Post found item | Yes | Yes | Yes |
| Approve/reject reports | Yes | Yes, if assigned by policy | No |
| Submit claims | No, except testing/admin impersonation disabled by default | No, to avoid conflict of interest | Yes |
| Review claims | Yes | Yes | No |
| Approve/reject claims | Yes | Yes | No |
| Generate QR claim slip | Yes | Yes | No |
| Verify QR and release item | Yes | Yes | No |
| Manage users | Yes | Limited view only if enabled | Own profile only |
| Change roles | Yes | No | No |
| Suspend/reactivate users | Yes | Recommend only, unless delegated | No |
| View analytics | Yes | Operational analytics | Own statistics only |
| Export reports | Yes | Yes | No |
| View audit logs | Yes | Limited logs for assigned claims/items | Own activity only |
| System settings | Yes | No | No |

### Admin Role

| Category | Blueprint |
|---|---|
| Can access | Admin dashboard, all reports, all claims, all users, all logs, analytics, report exports, system settings |
| Can create | Official accounts, announcements, reports, admin remarks, manual notifications, badge definitions |
| Can edit | Any item report, user role/status, claim remarks, badge criteria, system settings |
| Can delete | Fraudulent reports, invalid proof files, archived records according to retention policy |
| Can approve | Posts, claims, account verification, AI match confirmation, badge awards |
| Cannot access | Plaintext passwords, raw password reset tokens, private OAuth secrets in UI |
| Dashboard features | Stat cards, pending approvals, suspicious claims, user growth, item trends, return rate, charts, export buttons, recent activity |
| Security restrictions | Must use strong password, optional 2FA, short session expiry, all actions logged, cannot approve own test claims in production |

### Barangay Official Role

| Category | Blueprint |
|---|---|
| Can access | Official dashboard, pending reports, pending claims, QR verification, returned-item workflow, report exports |
| Can create | Verification remarks, claim decisions, release records, manual match suggestions |
| Can edit | Assigned reports, claim status, item custody fields, returned status |
| Can delete | Cannot permanently delete by default; can request archive or flag fraud |
| Can approve | Item posts, claims, QR release, account verification if policy allows |
| Cannot access | User role changes, system-wide settings, secret keys, unrelated admin audit tools |
| Dashboard features | Pending claims, pending reports, items for turnover, approved claims, QR scanner/checker, verification checklist |
| Security restrictions | Actions must be logged; cannot review a claim where they are claimant/reporter/finder; limited exports |

### Resident / People Role

| Category | Blueprint |
|---|---|
| Can access | Public listings, own dashboard, own profile, own posts, own claims, notifications |
| Can create | Lost reports, found reports, claims, claim proof uploads, profile updates |
| Can edit | Own profile, own pending reports, notification preferences |
| Can delete | Own pending reports before approval; request deletion/archive for posted reports |
| Can approve | Nothing requiring authority |
| Cannot access | Admin dashboard, official dashboard, all-user list, claim review queue, audit logs |
| Dashboard features | My lost posts, my found posts, my claims, suggested matches, claim slips, unread notifications, profile verification status |
| Security restrictions | Must verify email for claims; proof required for claims; rate limits on posts/claims; contact details protected |

---

## 3. Feature-by-Feature Blueprint

Each feature below includes purpose, users, workflow, frontend, backend, database, security, user flow, success/error scenarios, suggested layout, and priority.

### A. User Authentication

| Field | Blueprint |
|---|---|
| Feature name | User Authentication |
| Purpose | Let users securely sign up, log in, verify email, reset password, and maintain sessions |
| Who can use it | All roles |
| How it works | Email/password, Gmail OAuth, and Facebook OAuth create or locate a user, then issue a signed session/JWT |
| Frontend requirements | Login page, sign-up page, forgot/reset password pages, email verification result page, OAuth buttons, logout action, auth context/store |
| Backend requirements | Auth controller, password hashing, token signing, OAuth callback handlers, reset/verification token generation, rate limiting |
| Database requirements | `users`, `roles`, `password_resets`, `email_verifications`, `social_accounts`, `activity_logs` |
| Security rules | Hash passwords with Argon2id or bcrypt; store secrets in `.env`; rate-limit login/reset; use HTTPS; never expose tokens in URLs after exchange |
| User flow | Sign up -> verify email -> log in -> role-based dashboard; OAuth login -> provider consent -> callback -> dashboard |
| Success scenario | Valid credentials return session and redirect user to correct dashboard |
| Error scenario | Invalid password returns generic error; unverified email can browse but cannot claim if policy requires verification |
| Suggested UI layout | Mobile-first auth card with barangay seal/brand, email fields, password visibility toggle, Gmail and Facebook buttons, "forgot password" link |
| Priority | Must-have, Phase 2 |

Authentication subfeatures:

| Subfeature | Required Behavior |
|---|---|
| Email sign up | Collect full name, email, password, confirm password, contact number optional; default role is resident |
| Email login | Validate email/password; reject suspended users; log login event |
| Gmail login | Use Google OAuth; map provider email; mark email verified if provider says verified |
| Facebook login | Use Facebook OAuth; store provider ID in `social_accounts`; request minimum scopes |
| Forgot password | Generate short-lived reset token; send reset email; invalidate used token |
| Email verification | Generate token on registration; mark `email_verified_at` on success |
| Logout | Clear frontend token/session; optionally revoke refresh token |
| JWT/session handling | Use short-lived access token and secure refresh strategy where possible |
| Password hashing | Use Argon2id preferred or bcrypt cost 12; never store plaintext |

### B. Role-Based Access Control

| Field | Blueprint |
|---|---|
| Feature name | Role-Based Access Control (RBAC) |
| Purpose | Prevent users from accessing pages or actions outside their authority |
| Who can use it | System-wide |
| How it works | User role is stored in database and included in trusted server session claims; middleware checks roles per route |
| Frontend requirements | Protected route component, role-aware navigation, unauthorized page |
| Backend requirements | `authenticate`, `requireRole`, `requireOwnershipOrRole`, `requireVerifiedAccount` middleware |
| Database requirements | `roles`, `users.role_id`, optional `permissions` if expanding later |
| Security rules | Client role only controls UI; backend is final authority |
| User flow | User tries route -> frontend guard checks -> backend middleware validates -> allow or return 401/403 |
| Success scenario | Official can open claim review; resident is redirected away |
| Error scenario | Missing token returns 401; wrong role returns 403 |
| Suggested UI layout | Simple "Unauthorized" page with safe redirect to correct dashboard |
| Priority | Must-have, Phase 2 |

Protected route groups:

| Route Group | Roles |
|---|---|
| `/admin/*` | Admin only |
| `/official/*` | Barangay Official and Admin |
| `/resident/*` | Resident |
| `/post-lost`, `/post-found` | Authenticated users |
| `/items/:id/claim` | Verified resident |
| `/claims/:id/review` | Barangay Official and Admin |

### C. User Profile Management

| Field | Blueprint |
|---|---|
| Feature name | User Profile Management |
| Purpose | Keep user identity, contact details, address, Zone, and verification status updated |
| Who can use it | All authenticated users for own profile; Admin can review users |
| How it works | User edits profile fields; system validates and stores changes; sensitive changes may require confirmation |
| Frontend requirements | Profile page, edit profile form, photo uploader, change password modal, verification badge |
| Backend requirements | Profile controller, upload handler, password-change endpoint |
| Database requirements | `users`, `item_images` or upload metadata if profile photos are stored separately |
| Security rules | Users can edit only own profile; validate contact number; scan/validate profile image |
| User flow | Open profile -> edit fields -> save -> success toast -> updated dashboard |
| Success scenario | Contact number and Zone update immediately |
| Error scenario | Invalid phone format or oversized photo returns validation error |
| Suggested UI layout | Compact profile header, verification badge, editable fields grouped into Personal, Contact, Security |
| Priority | Must-have, Phase 3 |

Profile fields:

| Field | Notes |
|---|---|
| Full name | Required, 2-100 characters |
| Profile photo | JPG/PNG/WebP, size limit, safe filename |
| Contact number | Philippine mobile format; hidden publicly by default |
| Address | Barangay/local address |
| Zone | Select list for Paknaan Zones |
| Verification status | Unverified, email verified, barangay verified, suspended |
| Password | Change requires current password |

### D. Lost Item Posting

| Field | Blueprint |
|---|---|
| Feature name | Lost Item Posting |
| Purpose | Let users report belongings they lost in or around Barangay Paknaan |
| Who can use it | Resident, Official, Admin |
| How it works | User submits lost report; status starts as pending; official/admin approves before public posting |
| Frontend requirements | Post lost item page, multi-step mobile form, image upload, category selector, contact preference |
| Backend requirements | Item controller, validation, upload service, status service, notification trigger |
| Database requirements | `items`, `item_images`, `notifications`, `activity_logs`, `ai_matches` after approval |
| Security rules | Auth required; validate text length; sanitize content; image type/size checks; rate limit posting |
| User flow | Fill lost item form -> upload optional photos -> submit -> pending approval -> posted after approval |
| Success scenario | Resident sees report in "My Lost Posts" with pending status |
| Error scenario | Future date, missing location, invalid image, or suspended user blocks submission |
| Suggested UI layout | Step 1 Item info, Step 2 Location/date, Step 3 Photos/contact, Step 4 Review |
| Priority | Must-have, Phase 3 |

Required fields:

| Field | Details |
|---|---|
| Title | Example: "Lost black wallet" |
| Category | Electronics, Wallet/Money, ID/Documents, Keys, Jewelry, Clothing, Bag, Vehicle, Pet item, Tools, Others |
| Description | Include color, brand, unique marks, safe hints but avoid revealing all proof details publicly |
| Date lost | Cannot be future date |
| Location lost | Street, landmark, school, market, chapel, Zone |
| Zone | Standardized select value |
| Image upload | Optional but recommended; max 5 images |
| Contact preference | In-app, call, email, barangay-assisted |
| Status | Pending, Approved, Posted, Matched, Claimed, Returned, Archived, Rejected |

### E. Found Item Posting

| Field | Blueprint |
|---|---|
| Feature name | Found Item Posting |
| Purpose | Let honest finders report items they found and optionally turn them over to the barangay |
| Who can use it | Resident, Official, Admin |
| How it works | Finder submits report; system can mark whether item is in barangay custody |
| Frontend requirements | Post found item page, turnover toggle, finder detail privacy options, photo upload |
| Backend requirements | Item controller with `type=found`, custody workflow, notification trigger |
| Database requirements | `items`, `item_images`, `activity_logs`, `notifications`, optional custody fields |
| Security rules | Hide finder contact publicly; require barangay confirmation before "in custody" status |
| User flow | Fill found form -> choose keep/turnover to barangay -> submit -> approval -> public listing |
| Success scenario | Item appears as found after approval; possible owners can submit claims |
| Error scenario | Incomplete finder details or invalid upload stops submission |
| Suggested UI layout | Same as lost item form with "Turned over to barangay?" switch and storage details for officials |
| Priority | Must-have, Phase 3 |

Found-item fields:

| Field | Details |
|---|---|
| Title | Example: "Found motorcycle key near barangay hall" |
| Category | Same controlled category list |
| Description | Appearance and found context |
| Date found | Cannot be future date |
| Location found | Exact or approximate location |
| Zone | Standardized select value |
| Image upload | Max 5 images |
| Finder details | Stored privately |
| Turnover to barangay option | If true, official confirms custody |
| Status tracking | Pending, Posted, Matched, Claimed, Returned, Archived |

### F. Dynamic Lost and Found Listing

| Field | Blueprint |
|---|---|
| Feature name | Dynamic Lost and Found Listing |
| Purpose | Provide searchable public pages for lost and found reports |
| Who can use it | Public users for approved posts; authenticated users get extra actions |
| How it works | API returns paginated items based on query filters; frontend renders cards |
| Frontend requirements | Lost page, found page, item cards, filter drawer, search input, pagination, sorting |
| Backend requirements | Query builder with safe parameters, pagination, sorting, public visibility filtering |
| Database requirements | `items`, `item_images`, indexes for type/status/category/Zone/date |
| Security rules | Only posted/approved public records visible; hide private contact and proof details |
| User flow | Browse -> search/filter -> open item detail -> claim/share/report |
| Success scenario | User finds relevant results quickly |
| Error scenario | Empty result displays helpful state with "Clear filters" and "Post report" actions |
| Suggested UI layout | Sticky search bar, filter chips, 2-column mobile-friendly card list, desktop grid |
| Priority | Must-have, Phase 4 |

Listing controls:

| Control | Behavior |
|---|---|
| Search | Keyword search over title, description, category, location |
| Category filter | Multi-select or dropdown |
| Location filter | Text or landmark select |
| Zone filter | Standard dropdown |
| Date filter | Date range |
| Status filter | Public statuses only by default |
| Pagination | 12 or 20 items per page |
| Sorting | Newest, oldest, closest date, most relevant |

### G. Item Details Page

| Field | Blueprint |
|---|---|
| Feature name | Item Details Page |
| Purpose | Show complete public information and available actions for one item |
| Who can use it | Public for posted items; owners/admins/officials see extra controls |
| How it works | Fetch item, images, public reporter/finder info, similar suggestions, and status history |
| Frontend requirements | Image gallery, detail sections, status timeline, claim/share/report buttons, similar item carousel |
| Backend requirements | Item detail endpoint, privacy serializer, similar-items endpoint |
| Database requirements | `items`, `item_images`, `ai_matches`, `activity_logs`, `claims` |
| Security rules | Mask contact details; do not display proof documents; owner-only/admin-only fields protected |
| User flow | User opens card -> reviews details -> clicks claim/share/report suspicious post |
| Success scenario | User submits a claim or shares post |
| Error scenario | Archived/private item returns not found or limited view |
| Suggested UI layout | Top image gallery, status badge, detail summary, action bar, timeline, similar items |
| Priority | Must-have, Phase 4 |

Details included:

| Section | Content |
|---|---|
| Full item details | Title, type, category, description, date, location, Zone |
| Images | Public item images, blurred placeholders if needed |
| Reporter information | Name initials or verified badge only unless contact permission allows |
| Similar suggestions | AI/manual matching suggestions |
| Claim button | Visible for found items and eligible users |
| Share button | Facebook-ready share action |
| Report suspicious post | Opens reason form |
| Status history | Posted, matched, claimed, returned events |

### H. Claim Request System

| Field | Blueprint |
|---|---|
| Feature name | Claim Request System |
| Purpose | Let possible owners claim found items with proof |
| Who can use it | Verified residents/people |
| How it works | Claimant submits message, ownership details, proof files, optional valid ID; status starts pending |
| Frontend requirements | Submit claim page, proof upload, claim checklist, privacy notice, claim history |
| Backend requirements | Claims controller, proof upload service, notification trigger, suspicious scoring |
| Database requirements | `claims`, `claim_proofs`, `notifications`, `suspicious_flags`, `activity_logs` |
| Security rules | Proof files private; valid ID protected; claimant cannot claim own found item; rate limit claims |
| User flow | Item detail -> Claim button -> proof form -> submit -> pending/under review -> result |
| Success scenario | Claim appears in "My Claims" and official receives notification |
| Error scenario | Missing proof, unsupported file, duplicate active claim, or suspended account blocks claim |
| Suggested UI layout | Step form with item preview, proof checklist, upload area, message box, submit button |
| Priority | Must-have, Phase 5 |

Claim status values:

| Status | Meaning |
|---|---|
| Pending | Submitted and waiting for review |
| Under Review | Official/Admin is evaluating |
| More Proof Required | Claimant must upload additional evidence |
| Approved | Claim accepted; QR claim slip generated |
| Rejected | Claim denied with remarks |
| Returned | Item released and claim closed |

### I. Claim Verification System

| Field | Blueprint |
|---|---|
| Feature name | Claim Verification System |
| Purpose | Give officials a structured process for approving, rejecting, or requesting more proof |
| Who can use it | Barangay Official, Admin |
| How it works | Reviewer checks item details, proof, claimant history, risk score, and adds decision remarks |
| Frontend requirements | Claim review page, side-by-side item/proof viewer, decision buttons, remarks box, contact button |
| Backend requirements | Claim decision endpoints, status transaction, QR generation on approval, audit logging |
| Database requirements | `claims`, `claim_proofs`, `qr_claim_slips`, `activity_logs`, `notifications` |
| Security rules | Official cannot review own claim; all decision remarks logged; proof URLs require authorization |
| User flow | Open claim queue -> review -> approve/reject/request proof -> notify claimant |
| Success scenario | Approved claim generates QR slip and item moves to claimed |
| Error scenario | Already-returned item blocks approval; missing remarks required for rejection |
| Suggested UI layout | Review workspace with left item summary, right proof panel, bottom decision bar |
| Priority | Must-have, Phase 5 |

Verification checklist:

| Check | Purpose |
|---|---|
| Claimant identity | Confirms person is real and contactable |
| Proof description match | Checks unique marks, serial numbers, receipts, photos |
| Date/location consistency | Compares claim story with found report |
| Previous claim behavior | Detects repeated rejected claims |
| Valid ID, optional | Used for official release, stored privately |
| Barangay remarks | Explains decision clearly |

### J. AI-Based Item Matching

| Field | Blueprint |
|---|---|
| Feature name | AI-Based Item Matching |
| Purpose | Suggest possible lost/found matches automatically |
| Who can use it | System automatically; Admin/Official review; Residents see relevant suggestions |
| How it works | When item is posted, service compares it with opposite-type items using rules plus AI scoring |
| Frontend requirements | Suggested matches panel, confidence score badge, "view match" button, admin confirm/reject |
| Backend requirements | AI matching service, prompt builder, fallback rule scorer, scheduled rescan job |
| Database requirements | `ai_matches`, `items`, `item_images`, `notifications`, `activity_logs` |
| Security rules | AI suggestions are not final decisions; do not send private proof or ID files to AI provider |
| User flow | Post approved -> matching job runs -> suggestions stored -> users/officials notified |
| Success scenario | High-score possible match appears in resident dashboard and official review queue |
| Error scenario | AI API fails; fallback rule-based score runs and logs warning |
| Suggested UI layout | Match cards showing compared titles, dates, locations, category, score, and action buttons |
| Priority | High-value, Phase 9 |

Matching signals:

| Signal | Example Weight |
|---|---|
| Category match | 25% |
| Title keyword similarity | 20% |
| Description similarity | 20% |
| Location/Zone proximity | 15% |
| Date closeness | 10% |
| Image similarity or metadata | 10% if available |

### K. QR Code Claim Slip

| Field | Blueprint |
|---|---|
| Feature name | QR Code Claim Slip |
| Purpose | Verify approved item releases and prevent duplicate claiming |
| Who can use it | Claimant downloads/views; Official/Admin scans or checks |
| How it works | On claim approval, backend generates claim ID plus secure token and QR payload |
| Frontend requirements | Printable claim slip, QR display, download/print button, official QR verification page |
| Backend requirements | QR token service, verification endpoint, release transaction |
| Database requirements | `qr_claim_slips`, `claims`, `items`, `activity_logs` |
| Security rules | Token must be random, hashed at rest if possible, single-use, expiry enforced |
| User flow | Claim approved -> QR generated -> claimant presents slip -> official verifies -> item released |
| Success scenario | Valid unused QR marks claim returned and item returned |
| Error scenario | Expired, invalid, or already-used QR is rejected |
| Suggested UI layout | Claim slip with barangay header, item summary, claimant name, claim ID, QR, instructions |
| Priority | High-value, Phase 11 |

QR payload should contain:

| Field | Notes |
|---|---|
| Claim ID | Public identifier |
| Verification token | Random secret or signed token |
| Expiry | Example: 7 days |
| System URL | Opens official verification page |

### L. Gmail Notification System

| Field | Blueprint |
|---|---|
| Feature name | Gmail Notification System |
| Purpose | Send transactional email updates for important account, report, match, and claim events |
| Who can use it | System sends; all users receive based on preferences |
| How it works | Event occurs -> notification service writes in-app notification -> email service sends template |
| Frontend requirements | Email preference toggle, notification center, verified email indicator |
| Backend requirements | Email service using SMTP or Gmail API, templates, queue/retry handling |
| Database requirements | `notifications`, `users`, `email_verifications`, `password_resets` |
| Security rules | Do not expose tokens; use short-lived signed links; avoid sensitive details in email body |
| User flow | Event -> email sent -> user clicks secure link/action |
| Success scenario | User receives approval, reset, or claim update email |
| Error scenario | Email send fails; in-app notification remains and service retries |
| Suggested UI layout | Email templates with barangay header, clear status, one primary action button |
| Priority | High, Phase 8 |

Email events:

| Event | Recipient |
|---|---|
| Account created | New user |
| Email verification | New user |
| Report submitted | Reporter/finder |
| Report approved/rejected | Reporter/finder |
| Possible match found | Related item owners and officials |
| Claim submitted | Claimant and officials |
| Claim approved/rejected | Claimant |
| Claim returned | Claimant, finder/reporter, officials |
| Password reset | Requesting user |

### M. Facebook Integration

| Field | Blueprint |
|---|---|
| Feature name | Facebook Integration |
| Purpose | Support Facebook login and safe sharing of approved posts |
| Who can use it | Residents for login/share; Admin/Official for optional page posting |
| How it works | OAuth login links Facebook account; share button opens Facebook share dialog with public item URL |
| Frontend requirements | Facebook login button, share button, generated caption preview |
| Backend requirements | OAuth handler, social account storage, optional page posting service |
| Database requirements | `social_accounts`, `items`, `activity_logs` |
| Security rules | Use minimum permissions; never post automatically without explicit authorization; only share approved public posts |
| User flow | User logs in with Facebook or shares approved post from details page |
| Success scenario | Public post opens Facebook share dialog with caption and item URL |
| Error scenario | Unapproved/private item cannot be shared; OAuth denial returns to login safely |
| Suggested UI layout | Share action on item details and cards; admin caption generator in report view |
| Priority | Medium-high, Phase 10 |

Facebook-ready caption template:

```text
LOST ITEM / FOUND ITEM ALERT - Barangay Paknaan
Item: {title}
Category: {category}
Area: {zone_or_location}
Date: {date}
View details or submit a verified claim: {public_url}
Please avoid posting private owner details in comments.
```

### N. Admin Dashboard

| Field | Blueprint |
|---|---|
| Feature name | Admin Dashboard |
| Purpose | Provide full operational visibility and management controls |
| Who can use it | Admin |
| How it works | Aggregated endpoints return counts, charts, recent logs, and queues |
| Frontend requirements | Stat cards, charts, queues, suspicious claims table, export buttons |
| Backend requirements | Dashboard controller, analytics queries, cache where useful |
| Database requirements | `users`, `items`, `claims`, `activity_logs`, `suspicious_flags`, `report_exports` |
| Security rules | Admin only; all exports logged; sensitive data masked unless needed |
| User flow | Admin opens dashboard -> sees priorities -> reviews queues -> exports reports |
| Success scenario | Admin can identify pending approvals and system trends quickly |
| Error scenario | Query error shows partial dashboard with retry state |
| Suggested UI layout | Dense admin layout: sidebar, top filters, stat cards, charts, work queues |
| Priority | High, Phase 6 |

Dashboard metrics:

| Metric | Purpose |
|---|---|
| Total users | Adoption |
| Total lost reports | Demand |
| Total found reports | Community reporting |
| Pending approvals | Admin workload |
| Pending claims | Verification workload |
| Returned items | Success metric |
| Rejected reports | Moderation quality |
| Common categories | Planning and awareness |
| Frequent locations | Preventive barangay actions |
| Recent activity logs | Accountability |
| Suspicious claims | Fraud prevention |
| Charts and analytics | Defense-ready evidence |
| Export reports | Barangay documentation |

### O. Barangay Official Dashboard

| Field | Blueprint |
|---|---|
| Feature name | Barangay Official Dashboard |
| Purpose | Focus officials on claim verification and item release tasks |
| Who can use it | Barangay Official, Admin |
| How it works | Shows assigned queues for pending reports, pending claims, turnover items, and QR checks |
| Frontend requirements | Official dashboard, verification checklist, QR scanner/checker, contact claimant buttons |
| Backend requirements | Official dashboard endpoint, assigned-queue filters, QR verification endpoint |
| Database requirements | `items`, `claims`, `qr_claim_slips`, `activity_logs`, `notifications` |
| Security rules | Official-only; conflict-of-interest checks; all decisions logged |
| User flow | Official logs in -> reviews pending items/claims -> verifies QR -> marks returned |
| Success scenario | Official processes claim using checklist and releases item safely |
| Error scenario | Invalid QR or mismatched claimant blocks release |
| Suggested UI layout | Task-first dashboard with "Needs Review", "Ready for Release", "QR Verification" panels |
| Priority | High, Phase 6 |

### P. Resident Dashboard

| Field | Blueprint |
|---|---|
| Feature name | Resident Dashboard |
| Purpose | Let residents track posts, claims, matches, notifications, and claim slips |
| Who can use it | Resident / People |
| How it works | Dashboard endpoint returns only current user's records and suggestions |
| Frontend requirements | My lost posts, my found posts, my claims, match suggestions, notification list, profile status |
| Backend requirements | Resident dashboard endpoint with ownership filtering |
| Database requirements | `items`, `claims`, `ai_matches`, `notifications`, `qr_claim_slips`, `user_badges` |
| Security rules | User sees only own private records; public items remain public |
| User flow | Resident logs in -> checks post/claim status -> downloads claim slip if approved |
| Success scenario | User can understand exactly what action is needed next |
| Error scenario | No posts/claims shows clear empty state with post buttons |
| Suggested UI layout | Mobile-first dashboard cards: "My Reports", "My Claims", "Suggested Matches", "Notifications" |
| Priority | High, Phase 6 |

### Q. Admin Report Management

| Field | Blueprint |
|---|---|
| Feature name | Admin Report Management |
| Purpose | Moderate reports before and after public posting |
| Who can use it | Admin; Barangay Official if policy allows |
| How it works | Queue shows pending/flagged reports; reviewer approves, rejects, edits inappropriate content, archives, or deletes fraud |
| Frontend requirements | Manage reports table, filters, review modal, status actions, remarks field |
| Backend requirements | Report status endpoints, edit endpoint, archive/delete endpoint, audit logging |
| Database requirements | `items`, `item_images`, `activity_logs`, `notifications` |
| Security rules | Require remarks for rejection/deletion; preserve audit records; soft delete preferred |
| User flow | Open queue -> review report -> approve/reject/edit/archive -> notify reporter |
| Success scenario | Clean public listing with inappropriate details removed |
| Error scenario | Missing remarks or unauthorized role blocks action |
| Suggested UI layout | Data table with status tabs, item preview drawer, action bar |
| Priority | Must-have, Phase 5-6 |

### R. User Management

| Field | Blueprint |
|---|---|
| Feature name | User Management |
| Purpose | Control account status, roles, verification, and abuse prevention |
| Who can use it | Admin |
| How it works | Admin searches users, reviews activity, changes role/status, verifies or suspends accounts |
| Frontend requirements | User table, search/filter, user detail drawer, role/status controls |
| Backend requirements | User management controller, role change endpoint, suspension endpoint |
| Database requirements | `users`, `roles`, `activity_logs`, `suspicious_flags` |
| Security rules | Admin only; cannot demote last active admin without confirmation; all changes logged |
| User flow | Admin searches user -> opens detail -> verifies/suspends/changes role -> notification sent |
| Success scenario | Abusive user suspended and blocked from posting/claiming |
| Error scenario | Attempt to delete sole admin is rejected |
| Suggested UI layout | Dense table with role/status badges, activity count, risk indicators |
| Priority | High, Phase 6 |

### S. Activity Logs and Audit Trail

| Field | Blueprint |
|---|---|
| Feature name | Activity Logs and Audit Trail |
| Purpose | Track important actions for transparency, debugging, and defense documentation |
| Who can use it | Admin full; Official limited; users limited to own activity |
| How it works | Middleware/service writes action events with actor, target, IP, user agent, metadata |
| Frontend requirements | Admin audit log page, filters by actor/action/date/entity |
| Backend requirements | Activity logging service, log query endpoint, retention policy |
| Database requirements | `activity_logs` |
| Security rules | Logs are append-only for normal users; sensitive metadata redacted |
| User flow | Action occurs -> log inserted -> admin can search/filter |
| Success scenario | Admin can prove who approved/rejected/returned an item |
| Error scenario | Logging failure should not expose sensitive details; critical actions should fail closed if audit required |
| Suggested UI layout | Timeline/table with action chips, actor, target, date, IP |
| Priority | High, Phase 6 and Security |

Events to log:

| Event | Actor |
|---|---|
| Login and failed login | User/System |
| Post creation/edit/approval/rejection | User/Official/Admin |
| Claim submission/review/approval/rejection | User/Official/Admin |
| QR generation/verification/use | Official/Admin |
| Item returned | Official/Admin |
| Role/status changes | Admin |
| Report export | Official/Admin |

### T. Report Generation

| Field | Blueprint |
|---|---|
| Feature name | Report Generation |
| Purpose | Produce monthly and operational reports for barangay documentation |
| Who can use it | Admin, Barangay Official |
| How it works | User selects report type/date range; backend queries data; exports PDF or CSV |
| Frontend requirements | Reports page, date range picker, report cards, export history, download buttons |
| Backend requirements | Report service, PDF/CSV generator, export storage, audit log |
| Database requirements | `report_exports`, `items`, `claims`, `users`, `activity_logs` |
| Security rules | Official/Admin only; exports logged; sensitive personal data minimized |
| User flow | Open Reports -> choose month/type -> generate -> download PDF/CSV |
| Success scenario | Monthly report shows totals, categories, locations, returned items, pending claims |
| Error scenario | Empty period exports valid zero-data report |
| Suggested UI layout | Report builder with tabs: Monthly Summary, Returned Items, Pending Claims, Statistics |
| Priority | High, Phase 12 |

Report types:

| Report | Contents |
|---|---|
| Monthly lost and found summary | Counts by type/status, new reports, returns |
| Returned items report | Claimant, item, official, date returned |
| Pending claims report | Aging queue and status |
| Category statistics | Common lost/found categories |
| Location statistics | Frequent locations/Zones |
| PDF/CSV exports | Defense and barangay documentation |

### U. Community Honesty Badges

| Field | Blueprint |
|---|---|
| Feature name | Community Honesty Badges |
| Purpose | Encourage honest reporting and participation |
| Who can use it | Users earn/view; Admin manages definitions |
| How it works | Badge service awards badges based on completed behaviors |
| Frontend requirements | Badge display on profile/dashboard, badge criteria page, admin badge manager |
| Backend requirements | Badge award service, criteria evaluator, manual award/revoke endpoint |
| Database requirements | `badges`, `user_badges`, `items`, `claims` |
| Security rules | Badges awarded by verified actions; prevent users from self-awarding |
| User flow | User returns/report found item -> official marks returned -> badge awarded |
| Success scenario | Finder receives "Honest Finder" badge after confirmed returned item |
| Error scenario | Fraudulent report removes or prevents badge |
| Suggested UI layout | Small badge chips on profile, dashboard recognition section |
| Priority | Medium, Phase 13 |

Badge criteria:

| Badge | Criteria |
|---|---|
| Honest Finder | Found item was verified and returned |
| Verified Resident | Email and barangay verification complete |
| Active Helper | Multiple useful found reports or shared posts |
| Returned Item Contributor | Participated in a successful item return |

### V. Suspicious Claim Detection

| Field | Blueprint |
|---|---|
| Feature name | Suspicious Claim Detection |
| Purpose | Detect possible fake claims before approval |
| Who can use it | System flags; Admin/Official reviews |
| How it works | Rules calculate risk score using claim behavior, proof quality, mismatches, and history |
| Frontend requirements | Risk badge on claim review, suspicious flag list, explanation panel |
| Backend requirements | Risk scoring service, flag creation, admin review actions |
| Database requirements | `suspicious_flags`, `claims`, `claim_proofs`, `activity_logs` |
| Security rules | Risk score is advisory; human decision required; avoid unfair automatic rejection |
| User flow | Claim submitted -> score calculated -> high-risk flag appears for reviewer |
| Success scenario | Reviewer sees repeated rejected claimant and requests more proof |
| Error scenario | False positive can be dismissed with remarks |
| Suggested UI layout | Risk score meter, reasons list, "dismiss flag" and "request proof" actions |
| Priority | High-value security, Phase 9 or 14 |

Risk signals:

| Signal | Example Rule |
|---|---|
| Multiple claims on many items | More than 3 active claims in 30 days |
| Weak proof | No photo/receipt/unique description |
| Mismatched description | Category/date/location conflict |
| Repeated rejected claims | 2 or more rejected claims recently |
| New unverified account | Email not verified or no contact number |

### W. Multilingual Support

| Field | Blueprint |
|---|---|
| Feature name | Multilingual Support |
| Purpose | Make the system understandable to English and Cebuano users |
| Who can use it | All users |
| How it works | UI strings load from language files and toggle per user/session |
| Frontend requirements | Language toggle, `en` and `ceb` dictionaries, simple labels |
| Backend requirements | Optional notification template localization |
| Database requirements | `users.preferred_language`, localized notification templates optional |
| Security rules | Do not translate stored evidence automatically; keep original user content |
| User flow | User toggles English/Cebuano -> UI updates and preference is saved |
| Success scenario | Non-technical residents can follow forms clearly |
| Error scenario | Missing translation falls back to English |
| Suggested UI layout | Header language toggle: English / Cebuano |
| Priority | Medium, Phase 13 |

### X. Mobile-First UI

| Field | Blueprint |
|---|---|
| Feature name | Mobile-First UI |
| Purpose | Support the most likely access device: mobile phones |
| Who can use it | All users |
| How it works | Responsive layouts, large touch targets, compact navigation, card-based browsing |
| Frontend requirements | Responsive CSS, bottom nav for residents, adaptive dashboards, accessible forms |
| Backend requirements | API pagination and optimized image sizes to keep mobile fast |
| Database requirements | No special table; image metadata helps serve thumbnails |
| Security rules | Do not hide security actions on mobile; all critical flows must be accessible |
| User flow | User can post/search/claim comfortably on small screens |
| Success scenario | Forms fit without horizontal scrolling |
| Error scenario | Long labels wrap cleanly; no overlapping buttons |
| Suggested UI layout | Bottom navigation for residents; sidebar becomes drawer on admin/official mobile |
| Priority | Must-have, all phases |

Mobile UI requirements:

| Requirement | Implementation |
|---|---|
| Responsive design | CSS grid/flex with mobile first breakpoints |
| Large action buttons | Minimum 44px touch target |
| Simple navigation | Bottom nav or drawer |
| Easy post form | Stepper, autosave draft optional |
| Card display | Image, title, status, location, date |
| Barangay-friendly theme | Trustworthy green/blue accents with warm highlights |

### Y. Notification Center

| Field | Blueprint |
|---|---|
| Feature name | Notification Center |
| Purpose | Keep users updated inside the system |
| Who can use it | All authenticated users |
| How it works | Event service creates notifications; users see unread count and history |
| Frontend requirements | Notification bell, unread badge, notification page, mark read/all read actions |
| Backend requirements | Notification controller, event integration, optional websocket/polling |
| Database requirements | `notifications` |
| Security rules | Users only see their own notifications; admin broadcast restricted |
| User flow | Event occurs -> unread badge increments -> user opens notification -> navigates to item/claim |
| Success scenario | User sees "Claim approved" and downloads slip |
| Error scenario | Deleted target shows notification but disables broken link |
| Suggested UI layout | Notification drawer on desktop, full page on mobile |
| Priority | High, Phase 8 with email |

Notification fields:

| Field | Purpose |
|---|---|
| Title/message | Clear short update |
| Type | Report, claim, match, account, system |
| Link | Target page |
| Read status | Unread count |
| History | Audit-friendly user updates |

### Z. Search and Smart Filters

| Field | Blueprint |
|---|---|
| Feature name | Search and Smart Filters |
| Purpose | Help users find relevant reports quickly |
| Who can use it | Public and authenticated users |
| How it works | Keyword and filters are sent to API; backend performs safe query and returns ranked results |
| Frontend requirements | Search bar, filter chips, advanced filter drawer, recently posted section, similar search |
| Backend requirements | Search endpoint, indexes, relevance scoring, sanitized query parameters |
| Database requirements | `items` indexes; optional full-text search table later |
| Security rules | Parameterized queries; rate limit broad search; no private fields searched publicly |
| User flow | Enter keyword -> apply category/Zone/date/status -> view results -> open item |
| Success scenario | Results are relevant and paginated |
| Error scenario | Invalid date range returns validation error; empty query still shows recent posts |
| Suggested UI layout | Prominent search bar with filters below; mobile filter sheet |
| Priority | Must-have, Phase 4 |

Search capabilities:

| Capability | Behavior |
|---|---|
| Keyword search | Title, description, location |
| Category filter | Controlled categories |
| Zone filter | Zone dropdown |
| Date range | Lost/found date filter |
| Status filter | Public statuses or admin statuses based on role |
| Similar item search | Uses AI/rules to show likely matches |
| Recently posted | Default landing list |

---

## 4. Database Blueprint

Recommended production path: PostgreSQL. Current capstone/simple deployment path: SQLite can work, but design the schema so it can migrate to PostgreSQL later. Use UUIDs if supported; otherwise integer IDs are acceptable for SQLite.

### Entity Relationship Summary

| Entity | Relationships |
|---|---|
| users | Belongs to role; has many items, claims, notifications, badges, social accounts, logs |
| roles | Has many users |
| items | Belongs to reporter/finder user; has many images, claims, AI matches, suspicious flags |
| item_images | Belongs to item |
| claims | Belongs to item and claimant; has many claim proofs; may have one QR claim slip |
| claim_proofs | Belongs to claim |
| notifications | Belongs to user |
| activity_logs | Optionally belongs to actor user and target entity |
| ai_matches | Connects lost item and found item |
| qr_claim_slips | Belongs to claim |
| badges | Has many user badges |
| user_badges | Connects user and badge |
| report_exports | Created by admin/official user |
| password_resets | Belongs to user |
| email_verifications | Belongs to user |
| social_accounts | Belongs to user |
| suspicious_flags | Belongs to claim/item/user depending on flag target |

### `roles`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| name | varchar(50) | `admin`, `official`, `resident` | Unique index |
| display_name | varchar(100) | Human-readable role name |  |
| description | text | Role purpose |  |
| created_at | timestamp | Created date |  |

### `users`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| role_id | integer/uuid | User role | FK -> roles.id, index |
| full_name | varchar(120) | Legal/display name | index |
| email | varchar(150) | Login email | unique index |
| password_hash | text | Hashed password; nullable for OAuth-only until password set |  |
| contact_number | varchar(30) | Private phone number | index optional |
| address | text | Address details |  |
| zone | varchar(50) | User zone | index |
| profile_photo_url | text | Profile photo |  |
| preferred_language | varchar(10) | `en` or `ceb` |  |
| email_verified_at | timestamp | Email verification timestamp | index |
| barangay_verified_at | timestamp | Official verification timestamp | index |
| status | varchar(30) | active, suspended, archived | index |
| last_login_at | timestamp | Last successful login |  |
| created_at | timestamp | Created date | index |
| updated_at | timestamp | Updated date |  |

### `items`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Reporter/finder account | FK -> users.id, index |
| type | varchar(20) | lost or found | composite index with status |
| title | varchar(150) | Item title | full-text/index |
| category | varchar(80) | Controlled category | index |
| description | text | Public description | full-text/index |
| date_occurred | date | Date lost/found | index |
| location_text | varchar(255) | Location or landmark | index |
| zone | varchar(50) | Zone | index |
| contact_preference | varchar(50) | in_app, call, email, barangay_assisted |  |
| finder_name | varchar(120) | Found item finder name, private if needed |  |
| finder_contact | varchar(50) | Private finder contact |  |
| turnover_to_barangay | boolean | Whether finder plans turnover | index |
| custody_status | varchar(50) | not_in_custody, pending_turnover, in_custody, released | index |
| storage_location | varchar(150) | Barangay storage location |  |
| status | varchar(50) | pending, approved, posted, matched, claimed, returned, archived, rejected | index |
| admin_remarks | text | Moderation notes |  |
| approved_by | integer/uuid | Admin/official who approved | FK -> users.id |
| approved_at | timestamp | Approval timestamp | index |
| archived_at | timestamp | Archive timestamp | index |
| created_at | timestamp | Created date | index |
| updated_at | timestamp | Updated date |  |

Important indexes:

- `(type, status, created_at)`
- `(category, zone, status)`
- `(date_occurred, type)`
- Full-text index on title/description/location if database supports it.

### `item_images`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| item_id | integer/uuid | Parent item | FK -> items.id, index |
| uploaded_by | integer/uuid | Uploader | FK -> users.id |
| file_url | text | Public or protected URL |  |
| file_name | varchar(255) | Stored file name |  |
| mime_type | varchar(100) | image/jpeg, image/png, image/webp | index |
| file_size | integer | Bytes |  |
| sort_order | integer | Gallery order |  |
| created_at | timestamp | Upload date |  |

### `claims`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| item_id | integer/uuid | Claimed item | FK -> items.id, index |
| claimant_id | integer/uuid | Claimant user | FK -> users.id, index |
| claim_message | text | Ownership explanation |  |
| status | varchar(50) | pending, under_review, more_proof_required, approved, rejected, returned | index |
| risk_score | integer | 0-100 suspicious score | index |
| reviewer_id | integer/uuid | Official/Admin reviewer | FK -> users.id |
| reviewer_remarks | text | Decision remarks |  |
| reviewed_at | timestamp | Review date | index |
| approved_at | timestamp | Approval date |  |
| returned_at | timestamp | Return/release date | index |
| created_at | timestamp | Claim date | index |
| updated_at | timestamp | Updated date |  |

Important indexes:

- `(item_id, status)`
- `(claimant_id, status)`
- `(risk_score, status)`

### `claim_proofs`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| claim_id | integer/uuid | Parent claim | FK -> claims.id, index |
| proof_type | varchar(50) | photo, receipt, serial_number, valid_id, other |
| file_url | text | Protected proof file URL |  |
| file_name | varchar(255) | Stored file name |  |
| mime_type | varchar(100) | Allowed file type | index |
| file_size | integer | Bytes |  |
| notes | text | Optional description |  |
| is_sensitive | boolean | True for valid ID/private documents | index |
| created_at | timestamp | Upload date |  |

### `notifications`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Recipient | FK -> users.id, index |
| type | varchar(50) | report, claim, match, account, system | index |
| title | varchar(150) | Notification title |  |
| message | text | Notification body |  |
| link_url | text | Optional target URL |  |
| channel | varchar(30) | in_app, email, both | index |
| is_read | boolean | Read status | composite index with user |
| read_at | timestamp | Read date |  |
| created_at | timestamp | Created date | index |

### `activity_logs`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| actor_user_id | integer/uuid | User performing action | FK -> users.id, index |
| action | varchar(100) | login, create_item, approve_claim, etc. | index |
| entity_type | varchar(50) | user, item, claim, qr, report | index |
| entity_id | varchar(80) | Target entity ID | index |
| ip_address | varchar(80) | Request IP |  |
| user_agent | text | Browser/client info |  |
| metadata_json | json/text | Redacted extra data |  |
| created_at | timestamp | Event date | index |

### `ai_matches`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| lost_item_id | integer/uuid | Lost item | FK -> items.id, index |
| found_item_id | integer/uuid | Found item | FK -> items.id, index |
| score | decimal/integer | Match confidence 0-100 | index |
| match_reason | text | Explanation |  |
| status | varchar(50) | suggested, confirmed, rejected, dismissed | index |
| reviewed_by | integer/uuid | Reviewer | FK -> users.id |
| reviewed_at | timestamp | Review date |  |
| created_at | timestamp | Created date | index |

Unique constraint:

- `(lost_item_id, found_item_id)` to prevent duplicate matches.

### `qr_claim_slips`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| claim_id | integer/uuid | Approved claim | FK -> claims.id, unique |
| token_hash | text | Hashed verification token | unique index |
| qr_payload | text/json | Encoded payload or URL |  |
| expires_at | timestamp | Expiry date | index |
| used_at | timestamp | When scanned/released | index |
| used_by | integer/uuid | Official who released | FK -> users.id |
| status | varchar(50) | active, used, expired, revoked | index |
| created_at | timestamp | Created date |  |

### `badges`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| code | varchar(50) | honest_finder, verified_resident | unique |
| name | varchar(100) | Display name |  |
| description | text | Badge meaning |  |
| criteria_json | json/text | Award criteria |  |
| icon_url | text | Optional badge icon |  |
| is_active | boolean | Badge available | index |
| created_at | timestamp | Created date |  |

### `user_badges`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Badge owner | FK -> users.id, index |
| badge_id | integer/uuid | Badge | FK -> badges.id, index |
| awarded_by | integer/uuid | System/Admin/Official | FK -> users.id nullable |
| reason | text | Award reason |  |
| awarded_at | timestamp | Award date | index |

Unique constraint:

- `(user_id, badge_id)` unless repeatable badges are allowed.

### `report_exports`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| generated_by | integer/uuid | Admin/official | FK -> users.id, index |
| report_type | varchar(80) | monthly, returned_items, pending_claims, etc. | index |
| date_from | date | Start date | index |
| date_to | date | End date | index |
| format | varchar(20) | pdf, csv | index |
| file_url | text | Export file URL/path |  |
| summary_json | json/text | Counts included in export |  |
| created_at | timestamp | Generated date | index |

### `password_resets`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Reset user | FK -> users.id, index |
| token_hash | text | Hashed reset token | unique index |
| expires_at | timestamp | Expiry | index |
| used_at | timestamp | Used date | index |
| created_at | timestamp | Created date |  |

### `email_verifications`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Verifying user | FK -> users.id, index |
| token_hash | text | Hashed token | unique index |
| expires_at | timestamp | Expiry | index |
| verified_at | timestamp | Verified date |  |
| created_at | timestamp | Created date |  |

### `social_accounts`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Linked user | FK -> users.id, index |
| provider | varchar(50) | google, facebook | composite unique |
| provider_user_id | varchar(200) | Provider account ID | composite unique |
| provider_email | varchar(150) | Email from provider | index |
| access_token_encrypted | text | Optional encrypted token if needed |  |
| refresh_token_encrypted | text | Optional encrypted refresh token |  |
| linked_at | timestamp | Linked date |  |

Unique constraint:

- `(provider, provider_user_id)`.

### `suspicious_flags`

| Field | Data Type | Description | Relationship / Index |
|---|---|---|---|
| id | integer/uuid | Primary key | PK |
| user_id | integer/uuid | Related user | FK -> users.id, index |
| claim_id | integer/uuid | Related claim | FK -> claims.id nullable, index |
| item_id | integer/uuid | Related item | FK -> items.id nullable, index |
| flag_type | varchar(80) | multiple_claims, weak_proof, mismatch, repeated_rejection | index |
| severity | varchar(30) | low, medium, high | index |
| score | integer | Risk contribution |  |
| reason | text | Explanation |  |
| status | varchar(50) | open, reviewed, dismissed, confirmed | index |
| reviewed_by | integer/uuid | Reviewer | FK -> users.id nullable |
| reviewed_at | timestamp | Review date |  |
| created_at | timestamp | Created date | index |

---

## 5. API Routes Blueprint

### API Standards

Base URL:

```text
/api
```

Standard success response:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed"
}
```

Standard error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {}
  }
}
```

Common security rules for all protected routes:

- Require valid session/JWT.
- Validate body and query parameters.
- Use parameterized database queries.
- Log admin/official decisions.
- Return 401 for unauthenticated and 403 for unauthorized.

### Authentication Routes

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| POST | `/auth/register` | Public | `{ fullName, email, password, contactNumber?, zone? }` | `{ user, token? }` or verification required | Email format, strong password, unique email | Hash password, rate limit |
| POST | `/auth/login` | Public | `{ email, password }` | `{ user, accessToken, refreshToken? }` | Required email/password | Generic errors, rate limit, log attempts |
| POST | `/auth/logout` | Authenticated | `{ refreshToken? }` | `{ message: "Logged out" }` | Token optional | Revoke refresh token if used |
| POST | `/auth/forgot-password` | Public | `{ email }` | `{ message: "If email exists, reset link sent" }` | Valid email | Do not reveal account existence |
| POST | `/auth/reset-password` | Public | `{ token, newPassword }` | `{ message: "Password reset" }` | Valid token, strong password | Hash token at rest, expire token |
| GET | `/auth/verify-email?token=` | Public | Query token | `{ message: "Email verified" }` | Valid token | Hash token lookup, expire token |
| POST | `/auth/resend-verification` | Authenticated | none | `{ message: "Verification sent" }` | User not verified | Rate limit |
| GET | `/auth/google` | Public | none | Redirect | none | OAuth state/PKCE |
| GET | `/auth/google/callback` | Public | OAuth code | Redirect with app session | Valid OAuth response | State validation |
| GET | `/auth/facebook` | Public | none | Redirect | none | OAuth state |
| GET | `/auth/facebook/callback` | Public | OAuth code | Redirect with app session | Valid OAuth response | State validation |
| GET | `/auth/me` | Authenticated | none | `{ user }` | Valid token | Exclude password hash |

### Users and Profiles

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| GET | `/users` | Admin | Query search/status/role | `{ users, total }` | Safe query params | Admin only |
| GET | `/users/:id` | Admin or self | none | `{ user }` | Valid ID | Hide sensitive fields |
| PATCH | `/users/:id/profile` | Self or Admin | `{ fullName, contactNumber, address, zone, preferredLanguage }` | `{ user }` | Field length/format | Ownership or Admin |
| POST | `/users/:id/profile-photo` | Self or Admin | multipart file | `{ profilePhotoUrl }` | Image type/size | Upload validation |
| PATCH | `/users/:id/password` | Self | `{ currentPassword, newPassword }` | `{ message }` | Current password, strength | Hash new password |
| PATCH | `/users/:id/role` | Admin | `{ role }` | `{ user }` | Valid role | Audit log |
| PATCH | `/users/:id/verify` | Admin/Official if allowed | `{ verificationType }` | `{ user }` | Valid type | Audit log |
| PATCH | `/users/:id/suspend` | Admin | `{ reason }` | `{ user }` | Reason required | Block sole admin suspension |
| PATCH | `/users/:id/reactivate` | Admin | `{ reason }` | `{ user }` | Reason required | Audit log |
| GET | `/users/:id/activity` | Admin or self limited | Query page/limit | `{ logs }` | Safe pagination | Privacy filtering |

### Items, Lost Items, Found Items

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| GET | `/items` | Public | Query filters | `{ items, total, page }` | Safe filters | Public serializer only |
| GET | `/items/:id` | Public/owner/admin | none | `{ item }` | Valid ID | Privacy serializer |
| POST | `/items/lost` | Authenticated | Lost item fields | `{ item }` | Required fields, date not future | Rate limit, sanitize |
| POST | `/items/found` | Authenticated | Found item fields | `{ item }` | Required fields, date not future | Rate limit, sanitize |
| PATCH | `/items/:id` | Owner while pending, Admin/Official | Item fields | `{ item }` | Status rules | Ownership/role check |
| DELETE | `/items/:id` | Owner pending, Admin | `{ reason? }` | `{ message }` | Valid ID | Soft delete, audit |
| POST | `/items/:id/images` | Owner/Admin/Official | multipart files | `{ images }` | Max count/type/size | Upload validation |
| DELETE | `/items/:id/images/:imageId` | Owner pending, Admin/Official | none | `{ message }` | Valid IDs | Ownership/role |
| PATCH | `/items/:id/approve` | Admin/Official | `{ remarks? }` | `{ item }` | Pending status | Audit, notify |
| PATCH | `/items/:id/reject` | Admin/Official | `{ remarks }` | `{ item }` | Remarks required | Audit, notify |
| PATCH | `/items/:id/archive` | Admin/Official | `{ reason }` | `{ item }` | Reason required | Audit |
| POST | `/items/:id/report-suspicious` | Authenticated | `{ reason, details? }` | `{ flag }` | Reason required | Rate limit |
| GET | `/items/:id/status-history` | Public limited/Admin full | none | `{ history }` | Valid ID | Redact private logs |
| GET | `/items/:id/similar` | Public/Auth | Query type/limit | `{ matches }` | Safe params | Public fields only |

### Claims and Verification

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| POST | `/claims` | Verified resident | `{ itemId, claimMessage }` plus proofs | `{ claim }` | Item exists, proof required | Cannot claim own found item |
| GET | `/claims/my` | Authenticated | Query status | `{ claims }` | Safe query | Own claims only |
| GET | `/claims` | Admin/Official | Query status/risk/page | `{ claims, total }` | Safe query | Role required |
| GET | `/claims/:id` | Claimant/Admin/Official | none | `{ claim }` | Valid ID | Private proof authorization |
| POST | `/claims/:id/proofs` | Claimant if allowed | multipart files | `{ proofs }` | Type/size/count | Private storage |
| PATCH | `/claims/:id/status` | Admin/Official | `{ status, remarks }` | `{ claim }` | Valid transition | Audit log |
| PATCH | `/claims/:id/request-proof` | Admin/Official | `{ remarks }` | `{ claim }` | Remarks required | Notify claimant |
| PATCH | `/claims/:id/approve` | Admin/Official | `{ remarks }` | `{ claim, qrSlip }` | Claim under review | Generate QR, audit |
| PATCH | `/claims/:id/reject` | Admin/Official | `{ remarks }` | `{ claim }` | Remarks required | Audit, notify |
| POST | `/claims/:id/contact` | Admin/Official | `{ channel, message }` | `{ message }` | Channel allowed | Log contact |
| PATCH | `/claims/:id/mark-returned` | Admin/Official | `{ qrToken?, remarks? }` | `{ claim, item }` | Approved claim | Prevent duplicate return |
| GET | `/claims/:id/history` | Claimant/Admin/Official | none | `{ history }` | Valid ID | Role/ownership |

### AI Matching

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| POST | `/ai/matches/run/:itemId` | Admin/Official/System | `{ force?: boolean }` | `{ matches }` | Valid item | Do not send sensitive proof |
| GET | `/ai/matches` | Admin/Official | Query status/score | `{ matches }` | Safe query | Role required |
| GET | `/ai/matches/my` | Authenticated | none | `{ matches }` | Current user | Own related items only |
| PATCH | `/ai/matches/:id/confirm` | Admin/Official | `{ remarks? }` | `{ match }` | Valid match | Audit |
| PATCH | `/ai/matches/:id/reject` | Admin/Official | `{ remarks }` | `{ match }` | Remarks required | Audit |

### Notifications

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| GET | `/notifications` | Authenticated | Query unread/page | `{ notifications, unreadCount }` | Safe query | Own notifications only |
| PATCH | `/notifications/:id/read` | Authenticated | none | `{ notification }` | Valid ID | Ownership |
| PATCH | `/notifications/read-all` | Authenticated | none | `{ count }` | none | Ownership |
| POST | `/notifications/broadcast` | Admin | `{ title, message, targetRole? }` | `{ count }` | Required title/message | Admin only, audit |

### Dashboards

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| GET | `/dashboard/admin` | Admin | Query date range | `{ stats, charts, queues }` | Safe dates | Admin only |
| GET | `/dashboard/official` | Admin/Official | Query assigned/status | `{ queues, stats }` | Safe query | Role required |
| GET | `/dashboard/resident` | Resident | none | `{ myItems, myClaims, matches, notifications }` | none | Own data only |

### Reports

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| GET | `/reports/summary` | Admin/Official | Query date range | `{ summary }` | Valid dates | Role required |
| POST | `/reports/generate` | Admin/Official | `{ reportType, dateFrom, dateTo, format }` | `{ exportId, fileUrl }` | Valid type/format | Audit, data minimization |
| GET | `/reports/exports` | Admin/Official | Query page | `{ exports }` | Safe pagination | Role required |
| GET | `/reports/exports/:id/download` | Admin/Official | none | File download | Valid ID | Authorized download |

### Uploads

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| POST | `/uploads/item-images` | Authenticated | multipart files | `{ files }` | JPG/PNG/WebP, max size | Virus/type checks |
| POST | `/uploads/claim-proofs` | Authenticated | multipart files | `{ files }` | Images/PDF if allowed | Private storage |
| POST | `/uploads/profile-photo` | Authenticated | multipart file | `{ fileUrl }` | Image only | Ownership |

### QR Claim Slip

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| GET | `/qr/claims/:claimId/slip` | Claimant/Admin/Official | none | `{ slip }` | Approved claim | Ownership/role |
| POST | `/qr/claims/:claimId/regenerate` | Admin/Official | `{ reason }` | `{ slip }` | Reason required | Revoke old token |
| POST | `/qr/verify` | Admin/Official | `{ claimId, token }` | `{ valid, claim, item }` | Required token | Constant-time token check |
| POST | `/qr/release` | Admin/Official | `{ claimId, token, remarks? }` | `{ claim, item }` | Valid active token | Single-use transaction |

### Facebook, Gmail/Email, Badges, Activity Logs

| Method | Endpoint | Access | Request Body | Example Response | Validation | Security |
|---|---|---|---|---|---|---|
| POST | `/facebook/share-caption/:itemId` | Authenticated | none | `{ caption, publicUrl }` | Approved item | Public items only |
| POST | `/facebook/page-post/:itemId` | Admin/Official | `{ caption }` | `{ externalPostId }` | Approved item | Requires page permission, audit |
| POST | `/email/test` | Admin | `{ email }` | `{ message }` | Valid email | Admin only |
| POST | `/email/resend/:notificationId` | Admin/Official | none | `{ message }` | Notification exists | Role required |
| GET | `/badges` | Public | none | `{ badges }` | none | Public active only |
| GET | `/badges/my` | Authenticated | none | `{ badges }` | none | Own badges |
| POST | `/badges/:id/award` | Admin | `{ userId, reason }` | `{ userBadge }` | Valid user/badge | Audit |
| DELETE | `/badges/user/:userBadgeId` | Admin | `{ reason }` | `{ message }` | Reason required | Audit |
| GET | `/activity-logs` | Admin | Query filters | `{ logs, total }` | Safe query | Admin only |
| GET | `/activity-logs/my` | Authenticated | Query page | `{ logs }` | Safe pagination | Own safe logs |

---

## 6. Frontend Blueprint

### Recommended Frontend Stack

| Area | Recommendation |
|---|---|
| Framework | React with Vite and TypeScript |
| Routing | React Router |
| State | Context/Zustand for auth and app state; React Query for server data |
| Forms | React Hook Form plus Zod validation |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Existing CSS or Tailwind if adopted consistently |
| QR | `qrcode.react` or backend-generated QR image |
| i18n | Simple JSON dictionaries or `react-i18next` |

### Page List

| Page | Route | Users | Purpose |
|---|---|---|---|
| Home | `/` | Public | Search entry, latest approved reports, quick actions |
| Login | `/login` | Public | Email/Gmail/Facebook login |
| Sign Up | `/signup` | Public | Resident registration |
| Forgot Password | `/forgot-password` | Public | Password reset request |
| Reset Password | `/reset-password` | Public | Set new password |
| Verify Email | `/verify-email` | Public | Email verification result |
| Browse Lost Items | `/lost` | Public | Lost reports listing |
| Browse Found Items | `/found` | Public | Found reports listing |
| Item Details | `/items/:id` | Public/Auth | Full item view |
| Post Lost Item | `/post-lost` | Auth | Lost report form |
| Post Found Item | `/post-found` | Auth | Found report form |
| Submit Claim | `/items/:id/claim` | Verified resident | Claim form |
| Resident Dashboard | `/resident/dashboard` | Resident | Own posts, claims, matches |
| Official Dashboard | `/official/dashboard` | Official/Admin | Review queues and QR |
| Admin Dashboard | `/admin/dashboard` | Admin | Full analytics and queues |
| Manage Reports | `/admin/reports/manage` | Admin/Official | Approve/reject/archive |
| Manage Claims | `/official/claims` | Official/Admin | Review claims |
| Manage Users | `/admin/users` | Admin | Role/status management |
| Reports and Analytics | `/reports` | Admin/Official | Generate PDF/CSV |
| Notifications | `/notifications` | Auth | Notification center |
| Profile | `/profile` | Auth | Profile management |
| Settings | `/settings` | Auth | Language, notification preferences, security |
| About | `/about` | Public | System and barangay information |
| Contact Barangay | `/contact` | Public | Barangay contact and office hours |
| Unauthorized | `/unauthorized` | Any | Access denied |

### Component List

| Component Group | Components |
|---|---|
| Layout components | `PublicLayout`, `DashboardLayout`, `AdminSidebar`, `OfficialSidebar`, `ResidentBottomNav`, `TopBar`, `Footer`, `PageHeader` |
| Auth components | `LoginForm`, `SignupForm`, `OAuthButtons`, `PasswordField`, `EmailVerificationBanner`, `ProtectedRoute` |
| Dashboard components | `StatCard`, `ChartPanel`, `RecentActivityList`, `TaskQueue`, `RiskFlagPanel`, `QuickActions` |
| Form components | `TextField`, `SelectField`, `DateField`, `TextArea`, `FileUploader`, `ZoneSelect`, `CategorySelect`, `ContactPreferenceSelector`, `FormStepper` |
| Table components | `DataTable`, `UserTable`, `ReportTable`, `ClaimTable`, `AuditLogTable`, `ExportTable` |
| Modal components | `ConfirmDialog`, `ReviewReportModal`, `ReviewClaimModal`, `RequestProofModal`, `SuspendUserModal`, `ImagePreviewModal` |
| Notification components | `NotificationBell`, `NotificationDrawer`, `NotificationList`, `UnreadBadge`, `Toast` |
| Search/filter components | `SearchBar`, `FilterDrawer`, `FilterChips`, `DateRangePicker`, `SortSelect`, `EmptyResults` |
| Item components | `ItemCard`, `ItemGallery`, `ItemStatusBadge`, `ItemTimeline`, `SimilarItems`, `ShareButton`, `SuspiciousPostButton` |
| Claim components | `ClaimForm`, `ProofUploader`, `ClaimStatusBadge`, `ClaimTimeline`, `ClaimReviewPanel`, `VerificationChecklist` |
| QR components | `QRClaimSlip`, `QRCodeDisplay`, `QRScanner`, `QRManualVerifyForm`, `PrintableSlip` |
| Badge components | `BadgeChip`, `BadgeGrid`, `BadgeCriteriaCard` |
| Report components | `ReportBuilder`, `ReportPreview`, `ExportButton`, `ReportSummaryCards` |

### Frontend State and Data Pattern

| Concern | Pattern |
|---|---|
| Auth | `AuthProvider` stores user/session and refreshes `/auth/me` |
| API data | React Query queries/mutations with loading/error states |
| Forms | React Hook Form with Zod schema per form |
| Notifications | Poll `/notifications` every 30-60 seconds or use websocket later |
| Uploads | Multipart upload with progress indicator |
| Errors | Central API error handler shows toast and field errors |
| Roles | Route guards and role-aware nav |

### Suggested Folder Structure

```text
src/
  api/
    client.ts
    auth.api.ts
    items.api.ts
    claims.api.ts
    dashboard.api.ts
    reports.api.ts
  components/
    auth/
    dashboard/
    forms/
    items/
    claims/
    qr/
    notifications/
    tables/
    layout/
  contexts/
    AuthContext.tsx
    LanguageContext.tsx
  hooks/
    useAuth.ts
    useItems.ts
    useClaims.ts
    useNotifications.ts
  pages/
    public/
    auth/
    resident/
    official/
    admin/
  routes/
    AppRoutes.tsx
    ProtectedRoute.tsx
  styles/
    tokens.css
  utils/
    formatters.ts
    validators.ts
    status.ts
  i18n/
    en.json
    ceb.json
```

---

## 7. Backend Blueprint

### Recommended Backend Stack

| Area | Recommendation |
|---|---|
| Runtime | Node.js |
| Framework | Express with TypeScript |
| Database | SQLite for capstone; PostgreSQL for production |
| Query layer | Prisma/Drizzle/Knex recommended; current raw SQLite must use parameterized queries |
| Validation | Zod or Joi |
| Auth | JWT/session with secure secrets |
| Upload | Multer plus file validation |
| Email | Nodemailer with Gmail SMTP or Gmail API |
| AI | Gemini API or pluggable matching provider |
| QR | `qrcode` package or frontend QR rendering from secure token |
| Reports | PDFKit, jsPDF, or Puppeteer-generated PDFs; CSV stringify |
| Logging | Pino/Winston plus database audit logs |

### Backend Folder Structure

```text
server/
  app.ts
  server.ts
  config/
    env.ts
    database.ts
    cors.ts
  controllers/
    auth.controller.ts
    user.controller.ts
    item.controller.ts
    claim.controller.ts
    dashboard.controller.ts
    report.controller.ts
    notification.controller.ts
    qr.controller.ts
    ai.controller.ts
    badge.controller.ts
  models/
    user.model.ts
    item.model.ts
    claim.model.ts
    notification.model.ts
  routes/
    auth.routes.ts
    users.routes.ts
    items.routes.ts
    claims.routes.ts
    dashboards.routes.ts
    reports.routes.ts
    uploads.routes.ts
    qr.routes.ts
    ai.routes.ts
    notifications.routes.ts
  middleware/
    authenticate.ts
    requireRole.ts
    validate.ts
    upload.ts
    rateLimit.ts
    errorHandler.ts
    audit.ts
  services/
    auth.service.ts
    email.service.ts
    upload.service.ts
    item.service.ts
    claim.service.ts
    aiMatching.service.ts
    qr.service.ts
    report.service.ts
    notification.service.ts
    badge.service.ts
    suspiciousClaim.service.ts
    facebook.service.ts
  validators/
    auth.schema.ts
    item.schema.ts
    claim.schema.ts
    user.schema.ts
    report.schema.ts
  jobs/
    aiMatch.job.ts
    archiveOldReports.job.ts
    emailRetry.job.ts
  utils/
    crypto.ts
    sanitize.ts
    pagination.ts
    errors.ts
```

### Backend Responsibilities

| Layer | Responsibility |
|---|---|
| Controllers | Parse request, call service, return response |
| Routes | Bind HTTP methods to controllers and middleware |
| Middleware | Auth, role checks, validation, rate limits, uploads, audit |
| Services | Business logic such as approving reports, matching items, sending notifications |
| Models/repositories | Database queries |
| Validators | Input schemas and error messages |
| Error handling | Consistent API errors and safe logs |
| Logging | Request logs and activity logs |

### Critical Backend Transactions

| Transaction | Required Atomic Actions |
|---|---|
| Approve report | Update item status, write activity log, notify owner, trigger AI match |
| Approve claim | Update claim, update item status, generate QR slip, write log, notify claimant |
| Mark returned | Validate QR, mark QR used, claim returned, item returned, award badge, write log |
| Suspend user | Update status, invalidate sessions if supported, write log |
| Generate report | Query data, create file, write export record, write log |

---

## 8. UI/UX Design Blueprint

### Design Direction

Paknaan LostLink should feel trustworthy, practical, and easy for barangay residents to use. Avoid a marketing-style landing page as the main experience. The first screen should immediately support finding, posting, or checking item reports.

### Color Palette

| Token | Color | Usage |
|---|---|---|
| Primary Green | `#18794E` | Barangay identity, primary actions, success |
| Deep Blue | `#1E3A8A` | Admin/official navigation, links, trust accent |
| Warm Gold | `#F59E0B` | Pending status, highlights, callouts |
| Soft Red | `#DC2626` | Errors, rejected, high-risk flags |
| Slate Text | `#1F2937` | Main text |
| Muted Text | `#6B7280` | Secondary text |
| Surface | `#FFFFFF` | Cards, forms, panels |
| Page Background | `#F6F8FA` | App background |
| Border | `#DDE3EA` | Inputs, tables, dividers |

Avoid using only one dominant hue. Green and blue should provide trust, with gold for pending states and red only for critical errors.

### Typography

| Element | Recommendation |
|---|---|
| Font family | Inter, system UI, Segoe UI, Arial |
| Body | 14-16px mobile, 16px desktop |
| Headings | Clear hierarchy; avoid oversized dashboard headings |
| Buttons | 14-15px, semibold |
| Tables | Compact but readable, 13-14px |
| Language | Short, plain English/Cebuano labels |

### Buttons

| Button Type | Style | Examples |
|---|---|---|
| Primary | Green filled | Post Item, Submit Claim, Approve |
| Secondary | White with border | Cancel, View Details |
| Danger | Red filled or outline | Reject, Suspend, Delete |
| Icon button | Square, 40-44px | Search, filter, print, share, scan |
| Disabled | Muted background | Waiting states |

### Icons

Use Lucide icons:

| Action | Icon Suggestion |
|---|---|
| Search | `Search` |
| Filter | `SlidersHorizontal` |
| Post | `PlusCircle` |
| Lost item | `HelpCircle` or `SearchX` |
| Found item | `PackageCheck` |
| Claim | `FileCheck` |
| QR | `QrCode` |
| Notification | `Bell` |
| Report | `FileText` |
| User | `User` |
| Settings | `Settings` |
| Share | `Share2` |

### Cards

| Card | Requirements |
|---|---|
| Item card | Fixed image aspect ratio, title, category, Zone/location, date, status badge, actions |
| Dashboard card | Compact stat, icon, trend label |
| Match card | Two item summaries with score |
| Badge card | Badge icon, name, criteria |
| Empty card | Simple icon, clear message, next action |

Use 8px border radius unless existing style system uses a different standard.

### Forms

| Requirement | Implementation |
|---|---|
| Mobile-first | Single column by default |
| Validation | Inline errors below fields |
| Required fields | Clear labels, not only placeholder |
| Long forms | Multi-step sections with progress |
| Uploads | Drag/drop desktop, tap upload mobile, preview thumbnails |
| Review screen | Show summary before submission for lost/found and claims |

### Tables

| Table | Behavior |
|---|---|
| Admin tables | Search, filters, sticky actions, pagination |
| Mobile tables | Convert to stacked row cards |
| Status | Color-coded badges |
| Actions | Icon buttons with tooltips |

### Status Badges

| Status | Color |
|---|---|
| Pending | Gold |
| Approved | Blue |
| Posted | Green/Blue |
| Matched | Purple or Blue accent |
| Claimed | Amber |
| Returned | Green |
| Rejected | Red |
| Archived | Gray |
| Suspicious | Red outline |

### Dashboard Charts

| Chart | Best Use |
|---|---|
| Line chart | Monthly report volume |
| Bar chart | Categories and locations |
| Donut chart | Status distribution |
| Table/list | Recent activity and pending queues |

### Empty, Loading, and Error States

| State | Example |
|---|---|
| Empty | "No found items match your filters." Button: "Clear filters" |
| Loading | Skeleton item cards or table rows |
| Error | "We could not load reports. Try again." |
| Unauthorized | "You do not have access to this page." |
| Upload error | "Image must be JPG, PNG, or WebP and under 5 MB." |

### Mobile Navigation

| User | Navigation |
|---|---|
| Public | Top bar with Search, Lost, Found, Login |
| Resident | Bottom nav: Home, Lost, Found, Post, Dashboard |
| Official | Drawer/sidebar with Dashboard, Claims, Reports, QR |
| Admin | Sidebar with Dashboard, Reports, Claims, Users, Analytics, Logs |

---

## 9. System Workflow Blueprint

### Workflow 1: Resident Signs Up

1. User opens Sign Up.
2. Enters name, email, password, contact number, Zone.
3. Backend validates fields and creates resident account.
4. Password is hashed.
5. Email verification token is created.
6. Gmail notification sends verification link.
7. User verifies email.
8. User logs in and lands on Resident Dashboard.
9. Activity log records account creation and verification.

### Workflow 2: Resident Posts Lost Item

1. Resident opens Post Lost Item.
2. Form collects title, category, description, date lost, location, Zone, images, and contact preference.
3. Frontend validates required fields.
4. Backend validates and stores report as `pending`.
5. Admin/official receives notification.
6. Resident sees pending status in dashboard.
7. After approval, item becomes public and AI matching runs.

### Workflow 3: Resident Posts Found Item

1. Finder opens Post Found Item.
2. Form collects item details, finder details, found location, photos, and turnover option.
3. If turnover is selected, item enters custody confirmation queue.
4. Backend stores report as `pending`.
5. Official/Admin reviews.
6. Approved item appears in Found Items page.
7. Possible owners can claim it.

### Workflow 4: Admin Approves Post

1. Admin opens Manage Reports.
2. Reviews pending report and images.
3. Admin approves or rejects.
4. If approved, item status becomes `posted`.
5. Reporter/finder receives notification and email.
6. AI matching job compares item with opposite-type reports.
7. Activity log records decision.

### Workflow 5: AI Checks Possible Matches

1. Posted item triggers match service.
2. Service fetches active opposite-type items.
3. Rule-based pre-score filters likely candidates.
4. AI evaluates candidate summaries and returns match scores.
5. System stores matches in `ai_matches`.
6. If score passes threshold, users and officials are notified.
7. Official can confirm or reject match.

### Workflow 6: User Submits Claim

1. User opens Found Item details.
2. Clicks Claim.
3. System checks account verification and claim eligibility.
4. User enters ownership message and uploads proof.
5. Backend stores claim as `pending`.
6. Suspicious-claim service calculates risk score.
7. Official/Admin receives notification.
8. Claimant tracks claim status in dashboard.

### Workflow 7: Barangay Official Verifies Claim

1. Official opens pending claim.
2. Reviews claimant profile, message, proof files, item details, and risk score.
3. Official may contact claimant, request more proof, approve, or reject.
4. Rejection requires remarks.
5. Approval creates QR claim slip.
6. All decisions create activity logs and notifications.

### Workflow 8: Claim Is Approved

1. Claim status changes to `approved`.
2. Item status changes to `claimed`.
3. QR claim slip is generated with claim ID and secure token.
4. Claimant receives in-app and email notification.
5. Claimant can download/print/view the slip.
6. Official dashboard shows claim as ready for release.

### Workflow 9: QR Claim Slip Is Used

1. Claimant visits barangay office with QR slip and ID if required.
2. Official opens QR verification page.
3. Official scans QR or enters claim ID/token.
4. Backend validates claim status, token, expiry, and unused state.
5. Official confirms release.
6. System marks QR as used, claim as returned, item as returned.
7. Finder/reporter/claimant are notified.

### Workflow 10: Report Is Archived

1. Returned or old item reaches archive policy threshold.
2. Admin/official archives manually or scheduled job archives automatically.
3. Item is removed from active public listings.
4. Audit and report data remain available.

### Workflow 11: Monthly Report Is Generated

1. Official/Admin opens Reports.
2. Selects month and report type.
3. Backend aggregates items, claims, returns, locations, categories, and pending cases.
4. PDF/CSV is generated.
5. Export record is stored in `report_exports`.
6. Activity log records generation.
7. File can be downloaded for barangay documentation.

---

## 10. Security Blueprint

### Authentication and Session Security

| Security Area | Implementation |
|---|---|
| Password hashing | Argon2id preferred or bcrypt cost 12 |
| JWT secret | Store in environment variable; minimum 32 random bytes |
| Token expiry | Short access token; refresh token if supported |
| OAuth security | State parameter, exact redirect URI, minimal scopes |
| Forgot password | Hashed token, one-time use, 1-hour expiry |
| Email verification | Hashed token, expiry, safe redirect |
| Suspended users | Block login, posting, claiming, and sensitive actions |

### Authorization Security

| Security Area | Implementation |
|---|---|
| Role middleware | `requireRole(["admin"])`, etc. |
| Ownership checks | Users can only edit own pending records |
| Claim restrictions | User cannot claim own found item |
| Conflict checks | Official cannot approve own claim |
| Protected files | Claim proofs and valid IDs require authorization |

### Input and Data Security

| Security Area | Implementation |
|---|---|
| Validation | Zod/Joi schemas on every request |
| SQL injection prevention | Parameterized queries or ORM |
| XSS prevention | Escape output; sanitize rich text; avoid raw HTML |
| CSRF protection | Required if cookie-based auth is used; less critical for bearer token but still protect sensitive forms if cookies exist |
| File validation | MIME sniffing, extension whitelist, size limit, random filename |
| Upload privacy | Proof files stored in protected path, not public folder |
| Rate limiting | Auth, reset password, posting, claiming, search endpoints |
| CORS | Restrict to deployed frontend origin |

### Privacy Protection

| Data | Protection |
|---|---|
| Reporter/finder contact | Mask by default; reveal only through barangay-assisted workflow |
| Claim proofs | Visible only to claimant, Admin, assigned Official |
| Valid IDs | Optional, sensitive, protected, retention-limited |
| Email addresses | Mask in public UI |
| Activity logs | Redact tokens, passwords, proof details |

### Fraud and Abuse Controls

| Control | Implementation |
|---|---|
| Suspicious claim scoring | Multiple claims, weak proof, mismatches, repeated rejections |
| Admin review | High-risk claims require careful verification |
| Account suspension | Admin can suspend abusive users |
| Audit logs | Track every approval, rejection, release, role change |
| QR single-use | Prevent duplicate claiming |
| Proof checklist | Officials follow consistent review steps |

---

## 11. Integration Blueprint

### Gmail Integration

| Option | Use Case | Notes |
|---|---|---|
| Gmail SMTP via Nodemailer | Capstone-friendly transactional emails | Requires Gmail account and app password or Workspace configuration |
| Gmail API | More robust OAuth-based sending | More setup; better long-term control |
| Transactional provider fallback | Production alternative | Mailgun, SendGrid, Resend, etc. if Gmail limits become a problem |

Implementation steps:

1. Create barangay/system Gmail account.
2. Configure secure app password or Gmail API credentials.
3. Store credentials in `.env`.
4. Create email templates for verification, password reset, report status, matches, and claims.
5. Send email through `email.service.ts`.
6. Save in-app notification regardless of email success.
7. Retry failed emails and log failures.

Recommended environment variables:

```env
EMAIL_PROVIDER=gmail_smtp
GMAIL_USER=paknaanlostlink@gmail.com
GMAIL_APP_PASSWORD=replace_with_app_password
EMAIL_FROM_NAME=Paknaan LostLink
APP_PUBLIC_URL=https://your-domain.example
```

### Facebook Integration

| Feature | Implementation |
|---|---|
| Facebook login | OAuth login with `email` and `public_profile` scopes |
| Share button | Client opens Facebook share dialog using public item URL |
| Generated caption | Backend or frontend builds approved caption |
| Optional barangay page posting | Requires a Facebook app, page authorization, permissions, and review |
| Privacy | Share only approved public posts; do not include private contact or proof details |

Implementation steps:

1. Create Meta/Facebook app.
2. Configure OAuth redirect URL.
3. Store `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.
4. Implement `/auth/facebook` and callback.
5. Store linked account in `social_accounts`.
6. Add share button to item details.
7. Make page posting optional because permissions and review can be harder than share dialog.

### AI Integration

| AI Area | Plan |
|---|---|
| Provider | Gemini or another AI API |
| Trigger | After report approval and on scheduled rescans |
| Input | Public item fields only: title, category, description, date, location, Zone |
| Output | Matched item IDs, score, explanation |
| Storage | `ai_matches` table |
| Fallback | Rule-based matching if API fails |
| Human review | Officials/Admin confirm or reject AI suggestions |

Prompt shape:

```text
You assist a barangay lost-and-found system.
Compare the new {lost/found} item against candidate {found/lost} items.
Return only likely matches with a confidence score from 0 to 100.
Consider category, title, description, date, location, and Zone.
Do not make a final claim decision.
Return valid JSON:
[{ "candidateId": "...", "score": 84, "reason": "..." }]
```

### QR Code Integration

| Area | Plan |
|---|---|
| Generate QR | On claim approval |
| Payload | URL or JSON containing claim ID and random token |
| Store | Hash token in `qr_claim_slips` |
| Validate | Claim ID, token, expiry, status, unused |
| Release | Mark QR used, claim returned, item returned in one transaction |
| Duplicate prevention | Unique active QR per claim; single-use token |

Verification flow:

1. Official scans QR.
2. App opens `/official/qr/verify?claimId=...&token=...`.
3. Backend checks hashed token and claim status.
4. Official confirms release.
5. Backend marks item returned and QR used.

---

## 12. Development Roadmap

### Phase 1: Project Setup and Database Design

| Item | Details |
|---|---|
| Tasks | Finalize stack, env config, database schema, migrations, seed roles/admin |
| Deliverables | Working dev environment, schema, seed data, `.env.example` |
| Estimated difficulty | Medium |
| Dependencies | Existing React/Express project |
| Testing checklist | App starts, DB connects, roles seeded, migrations repeat safely |

### Phase 2: Authentication and Role Access

| Item | Details |
|---|---|
| Tasks | Register, login, logout, JWT/session, email verification, forgot password, RBAC middleware, protected routes |
| Deliverables | Auth API, auth pages, role guards |
| Estimated difficulty | Hard |
| Dependencies | Phase 1 |
| Testing checklist | Valid login, wrong password, duplicate email, expired token, role restrictions |

### Phase 3: Lost and Found Posting

| Item | Details |
|---|---|
| Tasks | Lost/found forms, item create endpoints, status pending, owner dashboard entries |
| Deliverables | Post Lost, Post Found, basic My Reports |
| Estimated difficulty | Medium |
| Dependencies | Phase 2 |
| Testing checklist | Required fields, date validation, auth required, pending status |

### Phase 4: Dynamic Listing and Item Details

| Item | Details |
|---|---|
| Tasks | Public listing APIs, filters, search, pagination, item details, status history |
| Deliverables | Lost page, Found page, Item Details |
| Estimated difficulty | Medium |
| Dependencies | Phase 3 |
| Testing checklist | Filters, sorting, pagination, privacy masking, empty states |

### Phase 5: Claim Request and Verification

| Item | Details |
|---|---|
| Tasks | Claim submit, proof upload placeholder, review queue, approve/reject/request proof |
| Deliverables | Submit Claim, Manage Claims, claim history |
| Estimated difficulty | Hard |
| Dependencies | Phase 4 |
| Testing checklist | Claim proof required, status transitions, reviewer remarks, notifications |

### Phase 6: Admin and Barangay Dashboards

| Item | Details |
|---|---|
| Tasks | Admin stats, official queues, resident dashboard, charts, recent activity |
| Deliverables | Three role dashboards |
| Estimated difficulty | Hard |
| Dependencies | Phases 2-5 |
| Testing checklist | Correct role data, counts match DB, mobile layout |

### Phase 7: Image Upload and File Validation

| Item | Details |
|---|---|
| Tasks | Multer/upload service, item images, profile photos, claim proofs, protected storage |
| Deliverables | Secure upload endpoints and previews |
| Estimated difficulty | Hard |
| Dependencies | Phases 3 and 5 |
| Testing checklist | File type, size limit, bad extension, private proof access |

### Phase 8: Gmail Notifications

| Item | Details |
|---|---|
| Tasks | Email service, templates, event triggers, notification center, preferences |
| Deliverables | In-app and Gmail notifications |
| Estimated difficulty | Medium-hard |
| Dependencies | Phases 2-5 |
| Testing checklist | Verification email, reset email, report/claim emails, failed email handling |

### Phase 9: AI Matching

| Item | Details |
|---|---|
| Tasks | Rule scorer, Gemini integration, match storage, suggested matches UI, review actions |
| Deliverables | AI match suggestions and notifications |
| Estimated difficulty | Hard |
| Dependencies | Phases 3-4, API key |
| Testing checklist | High/low match score, API failure fallback, no private proof sent |

### Phase 10: Facebook Integration

| Item | Details |
|---|---|
| Tasks | Facebook OAuth, share button, caption generator, optional page posting |
| Deliverables | Facebook login and post sharing |
| Estimated difficulty | Hard |
| Dependencies | Phase 2, Meta app credentials |
| Testing checklist | OAuth success/fail, share only approved posts, privacy-safe caption |

### Phase 11: QR Claim Slip

| Item | Details |
|---|---|
| Tasks | QR generation, printable slip, verification page, release transaction |
| Deliverables | QR claim slip and official verification |
| Estimated difficulty | Medium-hard |
| Dependencies | Phase 5 |
| Testing checklist | Valid QR, expired QR, reused QR, returned status updates |

### Phase 12: Reports and Analytics

| Item | Details |
|---|---|
| Tasks | Summary queries, PDF export, CSV export, export history |
| Deliverables | Reports page and downloadable files |
| Estimated difficulty | Hard |
| Dependencies | Phases 3-6 |
| Testing checklist | Date ranges, empty report, export permissions, totals match DB |

### Phase 13: UI/UX Polish

| Item | Details |
|---|---|
| Tasks | Mobile polish, status badges, empty/loading/error states, bilingual labels, badges |
| Deliverables | Presentation-ready UI |
| Estimated difficulty | Medium |
| Dependencies | All major pages |
| Testing checklist | Mobile screens, no overlapping text, accessible colors, Cebuano toggle |

### Phase 14: Security Testing

| Item | Details |
|---|---|
| Tasks | SQL injection tests, XSS tests, role bypass tests, upload tests, rate-limit checks, audit log review |
| Deliverables | Security test report and fixes |
| Estimated difficulty | Hard |
| Dependencies | Full feature set |
| Testing checklist | All critical routes protected, invalid files blocked, claims cannot be abused |

### Phase 15: Final Deployment

| Item | Details |
|---|---|
| Tasks | Production env, build, database setup, hosting, SSL, backups, final smoke test |
| Deliverables | Deployed system and deployment guide |
| Estimated difficulty | Medium-hard |
| Dependencies | Security testing complete |
| Testing checklist | Production login, posting, claim, email, QR, report export, backups |

---

## 13. Testing Blueprint

### Functional Test Cases

| Test Case | Steps | Expected Result |
|---|---|---|
| Sign up | Enter valid resident details and submit | Account created, verification email sent |
| Duplicate sign up | Use existing email | Generic duplicate email validation |
| Login | Use correct email/password | User enters correct dashboard |
| Wrong login | Use wrong password | Login rejected without revealing which field is wrong |
| Role restriction | Resident opens admin route | 403 or unauthorized page |
| Post lost item | Submit complete lost form | Item created as pending |
| Post found item | Submit complete found form | Item created as pending |
| Missing post field | Submit without title/category | Field errors shown |
| Search item | Search keyword and filters | Relevant paginated results |
| Item details | Open approved item | Details shown with private data hidden |
| Submit claim | Upload proof and claim message | Claim pending and official notified |
| Submit claim without proof | Submit empty proof | Validation error |
| Approve claim | Official approves with remarks | Claim approved, QR generated |
| Reject claim | Official rejects with remarks | Claim rejected, claimant notified |
| Request more proof | Official requests proof | Claim status changes and claimant notified |
| AI match | Approve report with similar opposite item | Match created with score |
| Email notification | Trigger report approval | In-app notification and email sent |
| Facebook sharing | Share approved item | Share dialog/caption opens |
| QR verification | Verify valid QR | Item and claim marked returned |
| QR duplicate | Scan same QR again | System rejects as used |
| Admin dashboard | Admin logs in | Stats, queues, charts load |
| Official dashboard | Official logs in | Pending claims/reports load |
| Resident dashboard | Resident logs in | Own posts, claims, matches load |
| Report generation | Generate monthly PDF/CSV | File is created and export logged |
| File upload | Upload valid image | Stored and preview shown |
| Invalid file upload | Upload `.exe` or oversized image | Upload rejected |

### Security Test Cases

| Test Case | Attack/Scenario | Expected Result |
|---|---|---|
| SQL injection | Search `' OR '1'='1` | No query break; safe result |
| XSS in description | Submit `<script>alert(1)</script>` | Script escaped/sanitized |
| JWT tampering | Modify role in token/local storage | Server rejects unauthorized action |
| Claim own found item | Finder tries to claim own item | Rejected |
| Unverified claim | Unverified user submits claim if policy requires verified | Rejected with verification message |
| Suspended user | Suspended account posts/claims | Rejected |
| Proof privacy | Other resident opens proof URL | 403 |
| Rate limit login | Many failed login attempts | Temporary rate limit |
| Missing admin remarks | Reject report without remarks | Validation error |
| CSRF if cookies used | Cross-site sensitive request | CSRF token required/rejected |

### UI/UX Test Cases

| Test Case | Expected Result |
|---|---|
| Mobile lost item form | No horizontal scrolling; buttons easy to tap |
| Mobile admin table | Rows become readable stacked cards or scrollable table |
| Long item title | Text wraps without overlapping |
| Empty listing | Helpful empty state with actions |
| Slow API | Loading skeletons appear |
| API error | Clear retry message appears |
| Language toggle | Labels change to English/Cebuano with fallback |

---

## 14. Deployment Blueprint

### Environment Variables

```env
# App
NODE_ENV=production
PORT=3000
APP_PUBLIC_URL=https://paknaan-lostlink.example
FRONTEND_URL=https://paknaan-lostlink.example

# Database
DATABASE_URL=./database.sqlite
# or postgresql://user:password@host:5432/paknaan_lostlink

# Auth
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=replace_with_another_long_random_secret

# Email
EMAIL_PROVIDER=gmail_smtp
GMAIL_USER=paknaanlostlink@gmail.com
GMAIL_APP_PASSWORD=replace_with_app_password
EMAIL_FROM_NAME=Paknaan LostLink

# Google OAuth / Gmail / Gemini
GOOGLE_CLIENT_ID=replace
GOOGLE_CLIENT_SECRET=replace
GOOGLE_CALLBACK_URL=https://paknaan-lostlink.example/api/auth/google/callback
GEMINI_API_KEY=replace

# Facebook
FACEBOOK_APP_ID=replace
FACEBOOK_APP_SECRET=replace
FACEBOOK_CALLBACK_URL=https://paknaan-lostlink.example/api/auth/facebook/callback

# Uploads
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=5

# Security
CORS_ORIGIN=https://paknaan-lostlink.example
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Database Setup

| Step | Description |
|---|---|
| Create database | SQLite file for capstone or PostgreSQL database for production |
| Run migrations | Create all tables and indexes |
| Seed roles | admin, official, resident |
| Seed first admin | Use secure setup command or manual DB seed |
| Backup | Schedule daily DB backup |
| Retention | Archive old items and purge sensitive proof files according to policy |

### Hosting Options

| Option | Good For | Notes |
|---|---|---|
| Render | Node backend with simple deployment | Good capstone option |
| Railway | Full-stack app with database add-ons | Convenient, may require paid plan |
| Vercel + Render | Vercel frontend, Render backend | Common split deployment |
| VPS | Full control | More setup for SSL, backups, server maintenance |
| Local barangay PC | Offline/local demo | Not ideal for public access without network setup |

### Frontend Deployment

1. Set `VITE_API_URL` to deployed backend URL.
2. Run build command.
3. Deploy static `dist` folder to Vercel, Netlify, or same Express server.
4. Verify routes work with SPA fallback.

### Backend Deployment

1. Configure production `.env`.
2. Install dependencies.
3. Run database migrations.
4. Start server with process manager or hosting platform.
5. Configure CORS and allowed frontend origin.
6. Serve uploads safely or connect external storage.

### File Storage

| Option | Use Case |
|---|---|
| Local `uploads/` | Capstone demo and simple deployment |
| Cloud object storage | Production reliability |
| Private storage for proofs | Required for valid IDs and claim evidence |

Rules:

- Item images may be public after approval.
- Claim proofs and valid IDs must be private.
- Generate random filenames.
- Limit upload size.
- Back up important files.

### Email Configuration

1. Use a dedicated Gmail account or Workspace account.
2. Store credentials only in environment variables.
3. Send test email from admin page or deployment script.
4. Monitor failed sends.
5. Keep password reset and email verification tokens short-lived.

### Domain and SSL

| Requirement | Plan |
|---|---|
| Domain | Use school/project domain or barangay subdomain |
| SSL | HTTPS required for OAuth, secure cookies, and user trust |
| Redirect | Force HTTP to HTTPS |
| OAuth callbacks | Must exactly match deployed domain |

### Backup Plan

| Backup | Schedule |
|---|---|
| Database | Daily automated backup |
| Upload files | Daily or weekly depending on volume |
| Exported reports | Monthly archive |
| Environment secrets | Stored securely outside repo |
| Restore test | At least once before defense/deployment |

---

## 15. Final Summary

Paknaan LostLink becomes more than a basic lost-and-found website. With the improvements in this blueprint, it becomes a complete barangay service system that supports verified reporting, public search, claim submission, official review, AI-assisted matching, QR-based release, Gmail updates, Facebook reach, dashboards, analytics, audit logs, and report generation.

The system is innovative because it uses modern technologies for practical barangay problems: AI reduces manual matching effort, QR slips prevent duplicate claiming, suspicious-claim scoring improves security, and bilingual mobile-first design makes the system usable for everyday residents. It is useful because it improves item recovery, creates official documentation, and gives each user role a clear workflow. It is secure because it applies password hashing, RBAC, validation, upload protection, audit logs, privacy controls, and claim verification checks.

For capstone defense, Paknaan LostLink can be presented as a realistic community-focused platform with a complete lifecycle:

1. Report an item.
2. Approve and publish the report.
3. Match possible lost/found pairs.
4. Submit and verify claims.
5. Generate QR claim slips.
6. Release items securely.
7. Produce official reports.

This roadmap is practical to build phase by phase while still being impressive enough to demonstrate full-stack development, database design, system architecture, cybersecurity awareness, UI/UX design, and real-world barangay impact.

