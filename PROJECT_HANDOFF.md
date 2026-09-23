Water Management — Project Handoff
1. Project Overview

This project is a resume/demo version of a water-management web application.

The project is NOT intended to be a public SaaS product.

The main goal is to provide recruiters/employers with a working demo that can be opened online and tested with different roles.

The project must remain lightweight and practical. Do not introduce unnecessary SaaS-level architecture unless explicitly requested.

2. Repository

GitHub repository:

https://github.com/matinmousavi/Water-Management.git

Current working branch:

irrigation-schedules

Original company repository:

https://github.com/karyar-studio/water-management.git

Important:

.env contains secrets and must never be committed.
Never expose JWT secrets, database credentials, API keys, or other private credentials.
The GitHub repository may currently be public temporarily for development/review purposes.
3. Tech Stack
Frontend
React
Vite
React Router
Ant Design
Ant Design RTL
Vazirmatn / Persian UI
JavaScript
Tailwind / Bootstrap may exist in the project
Backend
Node.js
Express
Mongoose
MongoDB
JWT authentication
Cookie-based authentication
Docker / Docker Compose
Deployment

The application is containerized with Docker.

The current development/production-like local environment uses Docker Compose.

4. Main Architecture

The application consists of:

Browser
↓
React / Vite Frontend
↓
Express API
↓
MongoDB

Authentication is cookie based.

The backend determines the authenticated user's workspace and uses that workspace to isolate data.

5. Workspace Architecture

The current system has two workspace types:

owner
demo

Every workspace-scoped entity must belong to a workspace.

Workspace-scoped models include:

User
Land
Well
Irrigation
IrrigationSchedule
ScheduleSnapshot
Note
Notification

The main purpose of workspace isolation is:

Owner data ≠ Demo data

and:

Demo Browser A ≠ Demo Browser B

6. Demo System

The demo system creates an isolated workspace for each browser/session.

The general flow is:

Browser A
↓
GET /demo/session
↓
Create DemoSession A
↓
Create DemoWorkspace A
↓
Create demo users
↓
Create demo lands
↓
Create demo wells
↓
Set demo_session cookie
↓
User selects a role
↓
OTP authentication
↓
JWT contains user/workspace information
↓
Workspace-scoped API access

A second browser receives another session/workspace.

Therefore:

Browser A → Workspace A
Browser B → Workspace B

Changes made in A must not appear in B.

7. Demo Roles

The demo provides three roles:

admin
irrigator
landOwner

Demo users are generated per workspace.

Their mobile numbers and well license codes are generated uniquely from the workspace ID.

Important commits:

fix: generate unique demo user mobiles
fix: generate unique demo well licenses
8. Demo Workspace Seeder

Main file:

backend/utils/demoWorkspaceSeeder.js

The seeder creates:

Users
Demo Admin
Demo Irrigator
Demo Land Owner
Lands
زمین شمالی دمو
زمین مرکزی دمو
زمین جنوبی دمو
Wells
چاه دمو ۱
چاه دمو ۲
چاه دمو ۳

Each demo workspace receives its own copies.

Well license codes are workspace-specific.

Demo user mobile numbers are workspace-specific.

9. Demo Session API

Main file:

backend/apis/demo/demo.js

Main endpoint:

GET /demo/session

Cookie:

demo_session

The endpoint:

Creates a session when the browser has no demo cookie.
Creates a demo workspace.
Seeds the workspace.
Returns demo users.
Reuses an existing valid demo session.
Recreates the session/workspace if the previous workspace no longer exists.

The demo session is intentionally browser/session based.

10. Authentication

Main file:

backend/middlewares/auth.js

Authentication currently requires the authenticated user to have:

workspaceId

Users without a valid workspace are no longer treated as authenticated owner users.

The middleware:

Reads JWT from cookie.
Verifies JWT.
Finds the user.
Requires user.workspaceId.
Finds the workspace.
Requires the workspace to be active.
Sets:
req.user
req.isLogin
req.isAdmin
req.workspaceId
req.workspaceType

If the user has no valid workspace, authentication is rejected.

Important commit:

fix: isolate owner authentication by workspace

11. Owner Workspace

Current legitimate owner workspace:

6ab1928366825a14e96103d3

Type:

owner

Status:

active

The intended owner login for testing is:

سید متین موسوی

The legitimate owner land currently verified during testing:

زمین شمال غربی

Legacy users without a workspace exist in the database.

They must NOT regain access simply because they have old records.

12. Important Legacy Data Issue

There were legacy users and records that did not have a workspace.

Previously, queries using:

{ workspaceId: null }

could accidentally match documents where workspaceId was missing.

This caused old records to appear as if they belonged to the owner workspace.

The authentication logic was changed so users without a workspace are rejected.

Owner login was tested afterward.

Result:

Old legacy lands no longer appeared.
Only the legitimate owner land appeared.

This was an important security/isolation fix.

13. Workspace-Scoped API Rule

Any API dealing with workspace data should generally include:

workspaceId: req.workspaceId

in database queries.

This applies to:

find
findOne
findOneAndUpdate
findOneAndDelete
updateOne
deleteOne
create

Whenever an entity belongs to a workspace, the workspace must be part of the authorization boundary.

Do not rely only on the document _id.

14. Lands API

Main file:

backend/apis/lands/lands.js

The Lands API has been audited and workspace-scoped.

Important protections include:

GET list filtered by workspaceId
GET single land filtered by workspaceId
Land creation includes workspaceId
PATCH filtered by workspaceId
DELETE filtered by workspaceId
Well lookup is workspace-scoped
Notes are workspace-scoped
Attached wells are workspace-scoped

This area has already been reviewed and tested.

15. Wells / Land Owner Access

Land Owner access to land/well details was corrected.

Important frontend files:

Land.jsx
Well.jsx

Land Owner users can now see the required well details.

Important commit:

fix: enable well details for land owners

16. Irrigation Logs

Land Owner log creation was fixed.

Important frontend file:

AddIrrigationLog.jsx

Land Owner can create the required well irrigation log.

Important commit:

fix: fix land owner well log creation

Irrigator operational behavior was also tested.

17. Irrigations API

Main file:

backend/apis/irrigations/irrigations.js

This API has been audited.

Workspace scoping currently exists for:

irrigation list
irrigation creation
single irrigation
irrigation update
irrigation deletion
well lookups
land lookups
conflict checks
group irrigation queries
related workspace data
SMS-related land/well lookups
18. Irrigation Workspace Ownership Fix

During the audit, an issue was found in the irrigation update logic.

The update code copied request-body fields into an existing irrigation document.

The workspaceId field was explicitly excluded from being overwritten.

The same protection was applied to group irrigation update logic.

This was tested by editing a group irrigation log.

Result:

PASS

The group irrigation log could be edited successfully after the change.

Relevant commit:

fix: protect irrigation workspace ownership

19. Dashboard

Main file:

backend/apis/dashboard/dashboard.js

Dashboard queries were audited and changed to include workspace scoping.

Workspace-scoped dashboard data includes:

Wells
Irrigations
Schedules
Notes
Notifications / related data
Land references
Well references
Land groups
Personal data where applicable

Reference lookups use workspace-aware queries instead of relying only on IDs.

Important commit:

fix: scope dashboard data by workspace

Dashboard was tested with the owner user.

Result:

PASS

20. Browser Isolation Test

Browser isolation has been tested.

Test scenario:

Browser A

Initial well:

چاه دمو ۱

Changed to:

چاه دمو ۱ - تست

Browser B / Incognito

Still showed:

چاه دمو ۱

Then Browser B changed its own well to:

چاه دمو ۱ - تست ۲

Browser A still showed:

چاه دمو ۱ - تست

Result:

PASS

21. Irrigation Log Isolation Test

A log was created/changed in one demo browser.

The same role in another browser did not see the other browser's data.

Result:

PASS

22. Owner ↔ Demo Isolation

Owner and demo workspaces were tested separately.

Demo data must not appear in owner workspace.

Owner data must not appear in demo workspace.

This separation was tested and passed.

23. Demo User Isolation

The demo user list only exposes users belonging to the current demo workspace.

Legacy users are not exposed through the demo session API.

24. Current Docker State

The project runs through Docker Compose.

Current local containers:

water-management
water-management_mongo

The application container currently uses:

node:22-alpine

MongoDB uses:

mongodb/mongodb-community-server:latest

The application is currently reachable locally on:

http://localhost:5173

The Docker environment has been successfully rebuilt after system restart.

25. Docker Restart Test

After a system restart:

docker compose ps

showed both containers running.

The application was successfully brought back up.

The site was successfully opened again.

26. Important Docker Note

The current Docker Compose service name for the application may differ from the container name.

At one point:

Container:

water-management

Service:

akeep

was shown by:

docker compose ps

Therefore, when checking logs, first inspect:

docker compose ps

and use the actual Compose service name.

Example:

docker compose logs --tail=50 akeep

Do not assume the service name is water-management.

27. Production Dockerfile

The production Dockerfile was previously fixed.

Important change:

CMD ["node", "server.js"]

instead of:

CMD node .

A .dockerignore was also added.

The .dockerignore excludes things such as:

node_modules
dist
.git
.env
.env.*
npm-debug.log*

Important commit:

fix: prepare production docker deployment

28. Current Deployment Goal

This project is intended to be deployed online as a resume/demo application.

It does NOT need to become a full public SaaS application.

Target:

Recruiter
↓
Public demo URL
↓
Demo session
↓
Choose role
↓
Test application

The owner/private workspace must remain isolated from public demo workspaces.

29. Current Audit Status

The project has received a focused workspace-isolation audit.

Completed areas:

Authentication — PASS
Demo sessions — PASS
Demo workspace creation — PASS
Browser isolation — PASS
Owner/demo isolation — PASS
User isolation — PASS
Land isolation — PASS
Well isolation — PASS
Irrigation isolation — PASS
Dashboard isolation — PASS
Land Owner well access — PASS
Land Owner log creation — PASS
Irrigator operation — PASS
Group irrigation update — PASS
Docker restart — PASS

The audit is intentionally paused here.

Do NOT restart the entire audit from zero unless explicitly requested.

The current priority is deployment.

30. Known / Deferred Work

The application has not been declared a fully audited production SaaS system.

Some deeper security and architecture reviews may still be possible later.

Examples of potential future audit areas:

strict request-body whitelisting
remaining API edge cases
authorization checks for every mutable field
rate limiting
public demo abuse prevention
session cleanup / expiration
production reverse proxy
HTTPS
MongoDB exposure
backup strategy
production logging
error handling
deployment hardening

These are intentionally deferred for the resume-demo stage unless specifically requested.

Do not block deployment solely because these deeper production concerns have not been completed.

31. Important Development Rule

When continuing this project:

Do not restart the project analysis from zero.
Read this handoff first.
Inspect the actual repository files before changing code.
Treat the current repository as the source of truth for implementation.
Treat this document as the source of truth for project history, decisions, completed tests, and deferred work.
Do not repeat tests that are already documented as passed unless a code change could affect them.
Do not undo completed workspace isolation.
Do not remove workspace filtering from APIs.
Do not expose secrets.
Do not introduce unnecessary architecture.
32. Working Style

The developer/user prefers:

Persian informal communication.
Direct and practical instructions.
One step at a time.
Do not ask unnecessary confirmation questions.
Do not repeat information already known.
Do not restart completed work.
For code changes, provide complete changed files when practical.
User tests the change.
After successful testing, commit.
Git commit titles should be short, professional English.
User handles git add/commit/push.
Do not give unnecessary git commands.
Avoid Postman when browser/UI testing is sufficient.
33. Current Exact Project State

The project is currently in this state:

Workspace isolation implemented
↓
Major isolation tests passed
↓
Irrigation audit completed to current checkpoint
↓
Docker running successfully
↓
Project is suitable to move toward online demo deployment

Current priority:

DEPLOYMENT

Do not continue a large audit unless explicitly requested.

34. Recommended Next Step

The next major task is:

Prepare the current Dockerized application for online deployment as a resume demo.

Recommended deployment architecture:

Domain
↓
Nginx / Reverse Proxy
↓
Dockerized Application
↓
MongoDB

The deployment should be inexpensive and simple.

The project does not need a complex cloud architecture.

35. Git / Commit History Relevant to Current State

Relevant commits include:

fix: prepare production docker deployment
fix: generate unique demo user mobiles
fix: generate unique demo well licenses
fix: isolate owner authentication by workspace
fix: enable well details for land owners
fix: fix land owner well log creation
fix: scope dashboard data by workspace
fix: protect irrigation workspace ownership
36. Handoff Rule

When a significant project milestone is completed, update this file.

The update should include:

what changed
what was tested
test result
commit title
current next step
any newly deferred issues

This file exists specifically so the project can be continued from a new AI chat without reconstructing the entire previous conversation.