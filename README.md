# Career Compass AI

Absolutely. Below is a master prompt you can give to an AI coding agent to build the application. It combines the product concept, UI requirements, AI features, architecture, UX, security, and implementation expectations we discussed.

Build an AI-Powered Job Application & Career Assistant

1. Project Overview

Build a production-quality, modern, responsive full-stack web application called AI Career Assistant.

The application is a job application tracker combined with an AI-powered career management workspace.

The core purpose is to help users manage their entire job search from one place:

Discover and track job opportunities

Manage applications

Track application stages

Manage interviews

Manage tasks

Store interview notes

Research companies and positions

Generate professional emails

Summarize meeting/interview notes

Create AI-powered task plans

Interact with an AI career chatbot

The AI functionality must be integrated into the job-tracking workflow rather than implemented as five unrelated AI demos.

The final application should feel like a polished SaaS product that could realistically be used by job seekers.

2. Primary Product Principle

Build the application around this principle:

AI suggests, the user decides.

AI-generated content must always be reviewable and editable before the user takes an important action.

Do not automatically send emails, submit applications, modify important records, or perform irreversible actions solely because the AI suggested them.

3. Recommended Technology Stack

Use a modern TypeScript-based stack.

Preferred stack:

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui or an equivalent accessible component system

PostgreSQL

Prisma or Drizzle ORM

Secure authentication solution

Server-side API routes/actions where appropriate

AI provider API through a secure server-side integration

Recharts or equivalent for analytics

dnd-kit or equivalent for Kanban drag-and-drop

Object/file storage for resumes and documents

Use current stable versions of dependencies.

If the existing project already has a technology stack, preserve it unless there is a compelling technical reason to change it.

Do not unnecessarily introduce additional frameworks or dependencies.

4. Application Layout

Create a polished application shell with:

Desktop

Persistent left sidebar:

Dashboard

Applications

Interviews

Tasks

AI Workspace

Smart Email

Meeting Notes

Task Planner

Research Assistant

AI Chat

Settings

Profile

The sidebar should clearly separate:

Main

Dashboard

Applications

Interviews

Tasks

AI Workspace

Smart Email

Meeting Notes

Task Planner

Research Assistant

AI Chat

System

Settings

Profile

Tablet

Collapse the sidebar into a compact navigation mode.

Mobile

Use:

Hamburger navigation

Responsive header

Mobile-friendly cards

Stacked layouts

Touch-friendly controls

Do not simply shrink the desktop interface.

Design each major screen intentionally for mobile.

5. Visual Design

The application should have a modern SaaS aesthetic.

Use:

Clean typography

Strong visual hierarchy

Generous spacing

Neutral background colors

One consistent primary accent color

Subtle borders

Subtle shadows

Moderate border radius

Consistent iconography

Smooth but restrained animations

Avoid excessive:

Gradients

Glassmorphism

Neon colors

Huge animations

Decorative elements that reduce usability

The application should look professional and trustworthy.

Prioritize usability over visual gimmicks.

6. Dashboard

Create a modern dashboard that acts as the user's job-search command center.

Display:

Summary cards

Total applications

Applications this month

Interviews

Offers

Rejections

Response rate

Interview rate

Application pipeline

Show:

Saved → Applied → Screening → Interview → Offer

Also support:

Rejected

Withdrawn

Accepted

Upcoming interviews

Display:

Company

Position

Date

Time

Interview type

Interviewer

Meeting link if available

Today's tasks

Show:

High-priority tasks

Due dates

Completion status

Recent activity

Examples:

Application added

Interview scheduled

AI email generated

Notes summarized

Task created

Application status changed

AI assistant card

Include a prominent AI assistant entry point.

Example:

"What would you like help with today?"

Provide suggested actions:

Prepare for an interview

Write a follow-up email

Summarize interview notes

Research a company

Create today's task plan

7. Job Applications

Create a complete application management system.

Each application should support:

Company name

Position/title

Job description

Job URL

Location

Remote/hybrid/on-site

Employment type

Salary range

Application date

Status

Source

Recruiter/contact

Recruiter email

Notes

Resume used

Cover letter

Tags

Created date

Updated date

Statuses:

Saved
Applied
Screening
Interview
Offer
Accepted
Rejected
Withdrawn

Allow users to:

Create

Edit

Delete

Duplicate

Search

Filter

Sort

View details

Change status

8. Application List

Create both:

Table view

Desktop-friendly table containing:

Company

Position

Status

Location

Applied date

Next step

Last updated

Card view

Responsive mobile-friendly card layout.

Provide:

Search

Status filtering

Date filtering

Location filtering

Sorting

Pagination or efficient loading for large datasets

9. Kanban Application Board

Create a drag-and-drop Kanban board.

Columns:

Saved
Applied
Screening
Interview
Offer
Accepted
Rejected

Each application should appear as a card.

Card should show:

Company

Position

Location

Status

Applied date

Next interview if applicable

Dragging an application between columns should update its status.

Persist the change in the database.

Provide appropriate loading and error handling.

10. Application Details

Create a detailed application page.

Sections:

Overview

Company

Position

Status

Location

Salary

Application date

Job description

Display the saved job description.

Contacts

Recruiter

Email

Interviewers

Documents

Resume

Cover letter

Other files

Interviews

Show associated interviews.

Notes

Allow manual notes.

AI tools

Provide contextual actions:

Generate follow-up email

Research company

Prepare for interview

Summarize notes

Create task plan

The AI tools should automatically receive the relevant application context.

11. Interview Management

Create an interview management system.

Each interview should contain:

Application

Interview type

Date

Time

Interviewer

Meeting URL

Location

Notes

Status

Preparation tasks

Interview types can include:

Recruiter screen

Phone screen

Technical

Behavioral

System design

Hiring manager

Final interview

Display upcoming interviews in:

List view

Calendar-friendly view if practical

12. Smart Email Generator

Build an AI-powered email generation interface.

Users should select:

Application

Example:

Acme — Senior Frontend Developer

Email purpose

Options:

Application follow-up

Interview thank-you

Interview confirmation

Recruiter response

Asking for an update

Networking

Referral request

Salary negotiation

Rejection response

Custom

Tone

Professional

Friendly

Concise

Warm

Formal

Additional context

Allow the user to provide custom instructions.

Example:

"Mention that I'm still very interested in the role."

Then generate the email.

The output must be editable.

Actions:

Edit

Regenerate

Copy

Save draft

Discard

Never automatically send an AI-generated email.

13. Structured AI Prompts

Do not send vague prompts to the AI.

Every AI feature must use structured prompts containing relevant context.

Prompt structure should include:

ROLE
TASK
APPLICATION CONTEXT
USER CONTEXT
RELEVANT DOCUMENTS
USER PREFERENCES
CONSTRAINTS
OUTPUT FORMAT
SAFETY REQUIREMENTS

Example:

ROLE:
You are a professional career communication assistant.

TASK:
Generate a concise interview follow-up email.

APPLICATION CONTEXT:
Company: ...
Position: ...
Interview date: ...
Recruiter: ...

USER PREFERENCES:
Tone: Professional
Length: Concise

CONSTRAINTS:
Do not invent facts.
Do not claim events happened if they are not present in the provided context.
Do not fabricate company information.
Do not include unsupported achievements.

OUTPUT:
Return a subject and editable email body.

Keep AI prompt construction on the server.

Never expose private API keys or server-side secrets to the browser.

14. Meeting Notes Summarizer

Create an interface where users can:

Paste meeting/interview notes

Upload supported text/document content where appropriate

Select the related application/interview

Generate a summary

The AI should produce structured output:

Summary

Short overview of the meeting.

Key discussion points

Important topics discussed.

Questions asked

Questions the interviewer asked, where available.

User responses / important points

Relevant information from the notes.

What went well

Potential strengths identified from the supplied notes.

Areas to improve

Potential improvement areas based only on the supplied information.

Next steps

Action items extracted from the notes.

The user must be able to edit the generated summary.

Allow selected action items to become application tasks.

Do not present AI interpretation as verified fact.

15. AI Task Planner

Create an AI-powered planning tool.

Example user request:

"I have a technical interview with Acme next Thursday. Help me prepare."

The AI should generate a structured plan.

Example:

Interview Preparation

High Priority
- Research Acme
- Review React performance
- Review system design fundamentals

Medium Priority
- Prepare interviewer questions
- Review job description

Low Priority
- Practice behavioral questions

Each generated task should contain:

Title

Description

Priority

Due date

Estimated effort

Related application/interview

Users must be able to:

Edit tasks

Delete tasks

Change priority

Change dates

Mark complete

Convert AI suggestions into actual tasks

AI must not silently create large numbers of tasks without user confirmation.

16. Task Management

Create a dedicated Tasks page.

Support:

Task creation

Editing

Completion

Deletion

Priority

Due date

Categories

Application association

Interview association

Views:

Today

Upcoming

Overdue

Completed

Provide filters and sorting.

17. AI Research Assistant

Build a research assistant specifically for job-search research.

The user should be able to research:

Companies

Positions

Industries

Interview topics

Technologies

Competitors

Products

Recent company developments

For company research, structure the output as:

Company Overview
What They Do
Products
Industry
Recent Developments
Competitors
Technology
Potential Interview Topics
Questions to Ask
Key Talking Points

Where external research is used, clearly distinguish sourced information from AI-generated interpretation.

Do not fabricate sources.

Important information should be verifiable against original sources.

Include appropriate responsible-AI messaging.

18. AI Chatbot Interface

Create a polished conversational AI interface.

The chatbot should allow users to ask questions about their job search.

Examples:

What interviews do I have this week?

Which applications haven't received a response?

Prepare me for my Acme interview.

Write a follow-up email for Acme.

Summarize my last interview.

What should I work on today?

Which companies am I most interested in?

The assistant should use relevant application context when appropriate.

The chatbot should not assume which application the user means when multiple applications could match.

Ask for clarification when necessary.

19. AI Context Awareness

This is a core requirement.

The AI system should understand relationships between:

User
 ↓
Applications
 ↓
Interviews
 ↓
Notes
 ↓
Tasks
 ↓
Research
 ↓
Emails

For example:

If the user asks:

"Prepare me for my Acme interview."

the system should retrieve the relevant:

Application

Job description

Interview date

Interview type

Interviewer

Existing notes

Existing tasks

Saved research

and provide appropriate context to the AI.

Do not send unnecessary private user data to the AI model.

Only provide the minimum context required for the requested operation.

20. Editable AI Outputs

Every major AI feature must produce an editable result.

Never make AI output read-only.

Support:

Edit

Regenerate

Copy

Save

Delete/discard

Convert to task where appropriate

Clearly label AI-generated content.

Example:

✨ AI-generated content
Review and edit before using.

21. Responsible AI

Include a clear but unobtrusive disclaimer around AI features.

Use messaging such as:

AI-generated content may contain errors or inaccuracies. Review and verify important information before relying on it or sharing it.

For research:

Research results may be incomplete or outdated. Verify important information using original sources.

For emails:

Review AI-generated emails carefully before sending.

The application must never imply that AI output is guaranteed to be accurate.

Do not fabricate:

Companies

Jobs

Recruiters

Interview details

Sources

Salary information

User achievements

Conversation history

If required information is unavailable, the AI should say so.

22. Authentication and Data Isolation

Implement secure authentication.

Every user's data must be isolated.

A user must never be able to access another user's:

Applications

Resumes

Emails

Notes

Tasks

Research

AI conversations

Enforce authorization on the server.

Do not rely only on hiding UI elements.

23. Database Design

Create a normalized database schema around entities such as:

User
Application
Interview
Task
Note
EmailDraft
ResearchSession
ChatConversation
ChatMessage
Document
Contact

Establish appropriate relationships.

For example:

User
 ├── Applications
 │    ├── Interviews
 │    ├── Notes
 │    ├── Tasks
 │    ├── Documents
 │    ├── Contacts
 │    └── EmailDrafts
 │
 ├── ResearchSessions
 │
 └── ChatConversations
      └── ChatMessages

Use indexes for frequently searched fields.

24. Security

Follow secure application-development practices.

Requirements:

Never expose API keys in frontend code

Validate input server-side

Sanitize user-generated content appropriately

Enforce authorization server-side

Secure file uploads

Restrict file types and sizes

Protect sensitive endpoints

Avoid leaking private data through AI prompts

Handle AI provider errors safely

Do not expose internal prompts or secrets to users

Use secure authentication/session handling

25. Accessibility

Build the application with accessibility in mind.

Requirements:

Semantic HTML

Keyboard navigation

Visible focus states

Accessible forms

Proper labels

Accessible dialogs

Appropriate ARIA usage

Sufficient color contrast

Do not rely on color alone to communicate status

Screen-reader-friendly feedback

Interactive components should be usable without a mouse.

26. Loading, Empty, and Error States

Every asynchronous operation must have a proper state.

Implement:

Loading

Skeletons

Spinners where appropriate

Disabled submit states

Empty

Examples:

"You don't have any applications yet."

Provide a useful CTA:

"Add your first application"

Errors

Show useful messages instead of raw API errors.

For AI failures:

"The AI service couldn't complete this request. Please try again."

Never expose internal stack traces or sensitive error information.

27. Responsive UI Requirements

Test all major interfaces at:

Mobile

Tablet

Desktop

Large desktop

Ensure:

No accidental horizontal overflow

Tables have appropriate mobile alternatives

Forms remain usable

Modals fit small screens

AI chat works well on mobile

Kanban has an appropriate mobile interaction

Sidebar/navigation remains accessible

Buttons remain touch-friendly

28. Performance

Prioritize:

Fast initial load

Code splitting

Lazy loading where appropriate

Optimized images

Efficient database queries

Pagination for large lists

Debounced search

Efficient AI requests

Caching where appropriate

Do not load large datasets unnecessarily.

29. AI Error Handling

AI requests can fail.

Handle:

Timeouts

Rate limits

Invalid responses

Provider errors

Network failures

Missing context

Never leave the user with an infinite loading state.

Provide a retry option.

30. AI Output Validation

Where structured AI output is expected, use a strict schema.

For example:

Task:
{
  title,
  description,
  priority,
  dueDate,
  estimatedMinutes
}

Validate AI responses before storing them.

Do not blindly trust arbitrary model output.

If the response doesn't match the expected structure, handle it gracefully.

31. UX Rules

Follow these principles throughout the application:

Keep workflows simple.

Avoid unnecessary modals.

Provide immediate feedback after actions.

Preserve user input when errors occur.

Make destructive actions explicit.

Use confirmation for important irreversible actions.

Keep AI actions understandable.

Always allow users to review AI output.

Never hide important information behind unnecessary interactions.

Keep terminology consistent throughout the application.

32. Suggested Development Order

Build the application incrementally.

Phase 1 — Foundation

Implement:

Project setup

Design system

Application shell

Responsive sidebar

Authentication

Database

User profile

Phase 2 — Job Tracker

Implement:

Applications

Application details

CRUD

Search

Filters

Statuses

Kanban

Dashboard statistics

Phase 3 — Interviews and Tasks

Implement:

Interviews

Interview details

Tasks

Upcoming tasks

Application/interview relationships

Phase 4 — AI Foundation

Create a reusable server-side AI service.

It should handle:

Prompt construction

Context retrieval

AI provider communication

Structured output

Validation

Error handling

Do not duplicate AI API logic throughout the application.

Phase 5 — AI Features

Implement:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

AI Research Assistant

AI Chatbot

Phase 6 — Context Awareness

Connect the AI features to:

Applications

Interviews

Notes

Tasks

Research

Emails

Phase 7 — Polish

Add:

Loading states

Empty states

Error handling

Accessibility

Animations

Responsive improvements

Performance optimization

Security review

33. Example End-to-End AI Workflow

The final application should support a workflow like this:

Step 1

User adds:

Acme
Senior Frontend Developer

Step 2

User saves the job description.

Step 3

AI can analyze the job description and identify relevant skills and interview topics.

Step 4

User moves the application to:

Interview

Step 5

User creates an interview for next Thursday.

Step 6

User asks:

"Prepare me for my Acme interview."

The AI uses the application, job description, interview details, and existing notes.

Step 7

AI generates a preparation plan.

User reviews it and selects:

Add tasks

Step 8

After the interview, user pastes their notes.

Step 9

Meeting Notes Summarizer generates:

Summary

Key points

Strengths

Areas to improve

Next steps

Step 10

User converts next steps into tasks.

Step 11

User asks:

"Write a thank-you email."

The Smart Email Generator uses the interview context and notes.

Step 12

User edits the email.

Step 13

User copies or saves the email.

The application never sends it automatically.

34. Code Quality Requirements

Write maintainable production-quality code.

Use:

Strong TypeScript types

Reusable components

Clear naming

Small focused functions

Reusable server-side services

Centralized validation

Consistent error handling

Environment variables for secrets

Clear separation of concerns

Avoid:

Huge components

Duplicated AI logic

Hardcoded credentials

Hardcoded user-specific data

Excessive client-side state

Unnecessary dependencies

any types unless genuinely necessary

Fake AI responses in production code

35. Seed/Demo Data

During development, provide realistic demo data so the UI can be evaluated.

Include example:

Applications

Interviews

Tasks

Notes

Contacts

Email drafts

Research results

Clearly separate demo/seed data from real user data.

Do not hardcode fake data into production user accounts unless explicitly intended.

36. Final Acceptance Criteria

The application is considered complete when a user can:

Register/login securely

View a polished responsive dashboard

Navigate using the sidebar

Add and manage job applications

Move applications through a Kanban pipeline

Search and filter applications

View application details

Schedule/manage interviews

Create and manage tasks

Generate professional emails using AI

Edit AI-generated emails

Summarize interview/meeting notes

Convert AI-generated action items into tasks

Generate an AI interview preparation plan

Research a company with the AI research assistant

Chat with the AI career assistant

Have AI features use relevant application context

Review and edit AI output

See responsible-AI disclaimers

Use the application comfortably on mobile, tablet, and desktop

Receive appropriate loading, empty, and error states

Have their data securely isolated from other users

37. Most Important Implementation Rule

Do not attempt to build the entire application as one giant implementation.

Build it in logical stages.

At every stage:

Implement the feature.

Connect it to the database where necessary.

Validate inputs.

Handle loading/error/empty states.

Make it responsive.

Check accessibility.

Test the feature.

Only then move to the next feature.

Prioritize a polished, functional MVP over a huge collection of unfinished features.

The final result should feel like a cohesive, modern AI career-management SaaS product, not a collection of unrelated pages.
Absolutely. I’d recommend a warm beige + white palette that feels professional, calm, and premium without looking overly corporate.

You can add this directly to the master prompt:

Visual Design & Colour System

The application must use a modern beige and white colour palette.

The overall aesthetic should feel:

Premium

Calm

Professional

Minimal

Warm

Modern

Trustworthy

Avoid bright, saturated colours as the primary visual identity.

Primary Colour Palette

Use the following palette consistently throughout the application:

Primary Beige

#C8A982

Use for:

Primary buttons

Selected navigation states

Important UI accents

Active tabs

Progress indicators

AI feature highlights

Light Beige

#E8DCCB

Use for:

Secondary backgrounds

Cards requiring subtle emphasis

Hover states

AI assistant panels

Tags/badges

Soft section backgrounds

Cream

#F7F3EC

Use as the primary application background.

This should create a warm alternative to a standard pure-white SaaS background.

White

#FFFFFF

Use for:

Cards

Forms

Modals

Navigation surfaces where appropriate

Main content containers

Dark Brown / Charcoal

#2F2A24

Use for:

Primary text

Headings

Navigation text

Important labels

Avoid pure black where possible.

Secondary Text

#756E65

Use for:

Descriptions

Metadata

Helper text

Secondary labels

Borders

#DED5C9

Use for:

Card borders

Input borders

Dividers

Table borders

Colour Hierarchy

The general visual hierarchy should be:

                    White
                      ↓
              ┌───────────────┐
              │     Cards     │
              └───────────────┘

Cream ─────────────────────────────
#F7F3EC       Main background

Light Beige ───────────────────────
#E8DCCB       Secondary surfaces

Primary Beige ─────────────────────
#C8A982       Actions / accents

Dark Brown ─────────────────────────
#2F2A24       Text

The application should feel light and spacious, with beige used as an accent rather than covering the entire interface.

Example Dashboard

Use a layout similar to:

┌───────────────────────────────────────────────────────────┐
│ WHITE HEADER                                               │
│ 🔍 Search                         🔔        👤 Alex        │
├───────────────┬───────────────────────────────────────────┤
│               │                                           │
│ CREAM         │   Good morning, Alex 👋                  │
│ SIDEBAR       │                                           │
│               │   ┌────────┐ ┌────────┐ ┌────────┐       │
│ 🏠 Dashboard  │   │   42   │ │   8    │ │   2    │       │
│ 💼 Jobs       │   │Applied │ │Interv. │ │ Offers │       │
│ 📅 Interviews │   └────────┘ └────────┘ └────────┘       │
│ ✅ Tasks      │                                           │
│               │   Application Pipeline                    │
│ ────────────  │                                           │
│ AI WORKSPACE  │   Saved → Applied → Interview → Offer    │
│               │                                           │
│ ✉️ Emails     │   ┌───────────────────────────────────┐   │
│ 📝 Notes      │   │                                   │   │
│ 🧠 Planner    │   │         WHITE CONTENT CARD        │   │
│ 🔎 Research   │   │                                   │   │
│ 💬 AI Chat    │   └───────────────────────────────────┘   │
│               │                                           │
│ ⚙ Settings    │   ✨ AI Assistant                         │
└───────────────┴───────────────────────────────────────────┘

Buttons

Primary buttons should use the primary beige:

Background: #C8A982
Text: #FFFFFF

Example:

┌─────────────────────┐
│   Generate Email    │
└─────────────────────┘

Hover:

#B89570

Secondary buttons:

Background: #F7F3EC
Border: #DED5C9
Text: #2F2A24

AI Feature Styling

AI features should have a subtle visual identity without introducing a completely different colour scheme.

Use:

AI Background: #F3EBDD
AI Border:     #E8DCCB
AI Accent:     #C8A982

For example:

┌──────────────────────────────────────────────┐
│ ✨ AI Assistant                              │
│                                              │
│ What would you like help with?              │
│                                              │
│ [ Prepare for interview ]                    │
│ [ Generate follow-up email ]                 │
│ [ Research company ]                         │
└──────────────────────────────────────────────┘

Status Colours

Use status colours sparingly so they don't conflict with the beige identity.

Suggested statuses:

Applied

#8A8178

Screening

#B08B55

Interview

#8D806A

Offer

#71866A

Accepted

#5F7D62

Rejected

#A36F68

These should primarily appear as small badges, indicators, or icons rather than large coloured backgrounds.

Typography

Use a clean modern sans-serif font.

Recommended:

Inter

Geist

Manrope

Plus Jakarta Sans

Use dark brown rather than pure black for the primary text.

Headings should be confident but not excessively heavy.

Design Principles

Follow these principles throughout the application:

White space is important.

Beige should be an accent, not an overwhelming background colour.

Use white cards against the cream background to create depth.

Keep shadows subtle.

Use consistent border radius.

Avoid excessive gradients.

Avoid overly saturated colours.

Keep AI features visually recognizable but integrated with the overall design.

Maintain sufficient colour contrast for accessibility.

The interface should feel like a premium career-management product rather than a generic AI dashboard.

The final visual identity should resemble a warm, elegant, modern SaaS application built around beige, cream, white, and dark brown, with restrained accent colours for status indicators.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d9ef926f-ba0c-4835-84bf-1841c03f9bfa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
