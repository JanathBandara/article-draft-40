# Welcome to Lovable project - Article Drafting MVP

## Project info

This is my submission for the **24-Hour Low-Code Challenge — Article Drafting MVP**. It is a small but functional app that turns an **AI-related interview transcript** plus **supporting sources** into a **story-driven draft article**, with human-in-the-loop controls.

**URL**: https://lovable.dev/projects/ffe84cf4-c645-4553-8512-413488195d48

## How can I edit this code?

There are several ways of editing the application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ffe84cf4-c645-4553-8512-413488195d48) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <https://github.com/JanathBandara/article-draft-40.git>

# Step 2: Navigate to the project directory.
cd article-draft-40

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ffe84cf4-c645-4553-8512-413488195d48) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

------------------------------------------------------------------------------------------------------------------

## Problem Framing & Assumptions

The challenge is to build a 24-hour MVP that transforms an AI-related interview transcript and supporting sources into a story-driven draft article with human-in-the-loop (HITL) controls.
The problem space requires:
-	Automatic extraction of key points from transcripts.
-	Editor approval/reordering of these points.
-	Draft generation guided by story direction
-	Source mapping to connect claims back to references.
-	A quote checker to verify quoted text.
-	Export capability for further editorial use.
Assumptions made:
-	All transcripts and supporting sources are publicly accessible.
-	Transcript input is provided as plain text.
-	Supporting sources are attached as URLs or text extracts or PDFs.
-	Editors primarily follow a Happy Path workflow (one transcript + a few sources per project).
-	OpenAI APIs are available and billed (quota for testing purposes).
-	Since I have integrated APIs, all outputs adapt to any new transcript or sources. Therefore, no simulation/mocking is used.


## Architecture Description

The solution uses a low-code frontend (Lovable.dev) connected to Supabase Edge Functions, which make calls to OpenAI APIs.
Flow of the app as follows,
1.	Input Layer
-	Transcript (pasted text).
-	Supporting sources (URLs or uploads).

2.	Edge Function: extract-key-points
-	Calls OpenAI Chat Completion API.
-	Returns 5 - 10 key points in JSON with provenance hints.

3.	Editor Review (HITL)
-	User edits, deletes, or reorders points.
-	Final list passed to next stage.

4.	Edge Function: generate-draft
-	Takes approved points + story direction + sources.
-	Produces Markdown draft, paragraph - level source mapping, and list of quotes.

5.	Edge Function: check-quotes
-	For each quote, checks transcript and sources.
-	Returns snippet + source + “found / not found”.

6.	Frontend Integration (Lovable)
-	Displays draft with inline source labels.
-	Displays quote checker results in a summary table.
-	Allows export as Markdown and JSON.


## Handling Key-Point Approval, Source Mapping & Quote Checks

1.	Key-Point Approval:
-	Extracted automatically by OpenAI (extract-key-points).
-	Editor can approve, edit, delete, or reorder points in Lovable UI.
-	Approved list is passed to the drafting step.

2.	Source Mapping:
-	generate-draft function outputs a paragraph_sources array mapping each paragraph index -> sources.
-	Lovable UI displays these as inline labels below each paragraph (“Source: Transcript / Source 1”).

3.	Quote Checker:
-	generate-draft identifies quotes used.
-	check-quotes verifies each against transcript/sources,
•	If found, returns exact snippet + source.
•	If not found, returns “Not Found” with optional closest snippet.
-	Lovable displays results both inline and in a summary list.


## Trade-offs & Next Steps

Trade-offs made within 24 hours:
-	Focused on a Happy Path MVP (single transcript, few sources).
-	Used OpenAI APIs directly (fast to integrate, but cost per request).
-	Minimal UI design in Lovable (clarity over advanced styling).
-	Error handling. For fallback notifications if APIs fail, but no retry batching.
-	Quote checker relies on AI + substring matching. Not optimized for very long transcripts.

If given another day, I would:
-	Add chunking + map-reduce summarization to handle 100k+ character transcripts efficiently.
-	Improve UI/UX with progress indicators, collapsible sections, and inline editing.
-	Add versioning (save checkpoints of draft evolution).
-	Expand multi-source attribution to show popover with all supporting passages.
-	Implement lightweight testing for quote checker logic.
-	Optimize costs by batching multiple quotes into a single LLM request.


## 3-Minute Demo Video
https://drive.google.com/file/d/1TX9rgrIhN6MOPkiCo42_XxUW54NAmclK/view?usp=drive_link 


## Sample Inputs
-	Interview transcript: https://singjupost.com/transcript-sam-altman-on-agi-gpt-5-and-whats-next-the-openai-podcast-ep-1/
-	Sources;
•	https://openai.com/index/introducing-gpt-5-for-developers/
•	https://openai.com/index/our-approach-to-ai-safety/
•	https://openai.com/index/gpt-5-new-era-of-work/


## A provenance JSON

https://drive.google.com/file/d/1EfbZEF-H4aH2Jv7SHSKZWUF1k4SKHblo/view?usp=drive_link 

