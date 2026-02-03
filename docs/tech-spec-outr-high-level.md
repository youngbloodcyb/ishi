# Outr Overview

**Table of Contents**

1. Dev Log
2. User Flow
   - Onboarding / OAuth
   - Campaign Creation
3. Tech Spec
   - Database Schema (Drizzle)
   - Outreach OAuth Flow (Server Actions)
   - Outreach API (Server Actions)
   - Workflows (Vercel Workflows)
   - API Routes
4. Frontend Components
   - Campaign Wizard
   - Progress Indicator
   - Celebration Screen
5. Implementation Phases
6. Manual Testing Guide

Outr is an Outreach AI auto-sequencer.

**Core value:** Create Outreach sequences with AI-generated personalized email copy.

**End goal:** Customer creates a campaign, defines a prompt, assigns a sending mailbox. Then AI-generated emails land in their Outreach tasks queue ready for review/send.

**Two ways to sequence contacts:**
1. UI with CSV upload (email, name, optional context)
2. API endpoint accepting JSON or CSV

**Reporting:** Pulled directly from Outreach (# contacted, interested, etc.)

# Dev Log

## 1/18/2026

Implemented first round of code updates via Claude based on this tech spec.

Minor issues with the migration, had to manually adjust `0001` migration file to accommodate existing data.

Claude also implemented the AI SDK without the Vercel AI Gateway -- refactored code to use an AI Gateway key instead.

---

# User Flow

## 1. Onboarding / OAuth

1. User installs Outr via Outreach marketplace
2. OAuth flow completes, storing access/refresh tokens for the user
3. User lands on dashboard, prompted to create first campaign

## 2. Campaign Creation

### Onboarding UX Design

The campaign creation wizard should feel rewarding and game-like, especially for first-time users:

**Visual Design:**
- Multi-step wizard with animated transitions between steps
- Persistent progress bar at the top showing completion (e.g., "Step 2 of 5")
- Each step has a subtle entrance animation (fade-in + slide-up)
- Use Framer Motion for smooth, spring-based animations

**Progress Indicators:**
- Segmented progress bar that fills with a satisfying animation
- Step indicators with checkmarks that animate when completed
- Micro-interactions: buttons pulse subtly on hover, inputs glow on focus

**Celebration on Completion:**
- Confetti animation when first campaign is created (use canvas-confetti or react-confetti)
- Success screen with animated checkmark and campaign stats
- "Achievement unlocked" style toast notification
- Animated counter showing "Campaign #1 Created!"

The UI here should follow the general form of a single page, with clear steps 1, 2, 3, etc (designed with a number inside a circle of color).

The section the user has their mouse over should have normal coloring, while every other section is slightly "dimmed", for emphasis.

### Step 1: Basic Info
- Campaign name
- Campaign description (required, needed for AI context)
- Outreach mailbox ID (default to user's primary mailbox, with option to override)

### Step 2: Sequence Configuration
- First email: manual or automatic
- Number of follow-ups (1-10, default: 2)
- Interval between emails (days)

**Custom field mapping:**
- `custom80`: Subject line
- `custom81-90`: Email body for each step (up to 10 emails)

### Step 3: Prompt Configuration
- **Company research toggle:** Enable/disable web research for personalization
- **Email prompt:** Text area for core email instructions
  - Outr provides quality default prompts (hardcoded)
  - Users can customize or write their own
- **Prompt dropdown:** Select from Outr defaults or prompts from previous campaigns

### Step 4: Test Prompts
- Default test companies (well-known brands, 5 of these)
- User can add custom test emails/companies
- Results cached in localStorage with expiration
- Preview generated emails before finalizing
- User should be able to go back and adjust their prompt

### Step 5: Finalize
1. Create sequence in Outreach via API
2. Store campaign config in Outr database:
   - Campaign metadata
   - Outreach sequence ID
   - Prompt details
   - Mailbox ID
3. Show success UI with celebration animation
4. Redirect to contact import page

---

# Tech Spec

## Database Schema (Drizzle)

### Existing Tables

The following tables already exist in `apps/main/lib/db/schema.ts` (managed via WorkOS):

- **organizations** - WorkOS organization syncing
- **users** - WorkOS user syncing (id, email, firstName, lastName, profilePictureUrl, selectedOrganizationId)
- **organizationMembers** - User-Organization membership with roles (owner, admin, member)
- **invitations** - WorkOS invitation tracking

### New Tables for Outr

```typescript
// lib/db/schema.ts (additions)
import { pgTable, text, timestamp, boolean, jsonb, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { users } from './schema'; // existing users table

// ============================================
// Type Definitions for JSONB columns
// ============================================

export interface OutreachTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO timestamp
}

export interface OutreachConnectionData {
  outreachUserId: number;
  outreachEmail: string;
  defaultMailboxId?: number;
  onboardingCompleted?: boolean;
  campaignsCreated?: number;
}

export interface SequenceConfig {
  firstEmailManual: boolean;
  numFollowups: number;
  intervalDays: number;
}

export interface PromptConfig {
  companyResearchEnabled: boolean;
  prompt: string;
}

export interface OutreachIds {
  sequenceId: number;
  stepIds: number[];
  templateIds: number[];
}

export interface CampaignData {
  name: string;
  description: string;
  mailboxId: number;
  sequence: SequenceConfig;
  promptConfig: PromptConfig;
  outreach: OutreachIds;
}

export interface ContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  context?: string; // user-provided context about this contact
}

export interface GeneratedContent {
  subject: string;
  emails: string[]; // array of HTML email bodies
  companyResearch?: string; // if research was performed
}

export interface OutreachResult {
  prospectId: number;
  sequenceStateId: number;
}

export interface ContactJobData {
  contact: ContactInput;
  generated?: GeneratedContent;
  outreach?: OutreachResult;
}

export type CampaignStatus = 'active' | 'paused' | 'archived';
export type ContactJobStatus = 'pending' | 'generating' | 'creating_prospect' | 'completed' | 'failed';

// ============================================
// Tables
// ============================================

/**
 * Outreach OAuth connections - links users to their Outreach accounts
 * One user can have one Outreach connection
 */
export const outreachConnections = pgTable('outreach_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id)
    .notNull()
    .unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  data: jsonb('data').notNull().$type<OutreachConnectionData>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  data: jsonb('data').notNull().$type<CampaignData>(),
  status: text('status').$type<CampaignStatus>().default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactJobs = pgTable('contact_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
  data: jsonb('data').notNull().$type<ContactJobData>(),
  status: text('status').$type<ContactJobStatus>().default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Type Exports for queries
// ============================================

export type OutreachConnection = typeof outreachConnections.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type ContactJob = typeof contactJobs.$inferSelect;

// ============================================
// Email Generation Concept
// ============================================

/**
 * Email generation uses a single prompt per campaign.
 * One generateObject call produces:
 * - 1 subject line
 * - Up to 10 email bodies (based on campaign's numFollowups setting)
 *
 * Prompt sources:
 * 1. Outr default - a single well-crafted default prompt
 * 2. Previous campaigns - users can reuse prompts from their existing campaigns
 */
export const OUTR_DEFAULT_PROMPT = {
  id: 'outr-default',
  name: 'Outr Default',
  prompt: `Write a personalized outreach sequence for this contact.

For the first email: Introduce yourself and establish relevance to their role/company. Lead with a specific observation about their business and connect it to a problem you can solve. End with a soft, low-commitment CTA (e.g., "Would it make sense to chat?").

For follow-up emails: Each follow-up should take a different angle - share a relevant insight, reference a similar company's success, or offer a helpful resource. Keep them progressively shorter. Never guilt-trip about not responding. Always provide value.

Tone: Professional but conversational. No buzzwords or corporate speak. Write like a helpful human, not a salesperson.`,
};
```

## Outreach OAuth Flow (Server Actions)

```typescript
// lib/outreach-auth.ts
'use server';

const OUTREACH_AUTH_URL = 'https://api.outreach.io/oauth/authorize';
const OUTREACH_TOKEN_URL = 'https://api.outreach.io/oauth/token';

export async function getOutreachAuthUrl(state: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.OUTREACH_CLIENT_ID!,
    redirect_uri: process.env.OUTREACH_REDIRECT_URI!,
    response_type: 'code',
    scope: 'prospects.all sequences.all sequenceStates.all templates.all mailboxes.read',
    state,
  });
  return `${OUTREACH_AUTH_URL}?${params}`;
}

export async function exchangeOutreachCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const response = await fetch(OUTREACH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.OUTREACH_CLIENT_ID!,
      client_secret: process.env.OUTREACH_CLIENT_SECRET!,
      redirect_uri: process.env.OUTREACH_REDIRECT_URI!,
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth exchange failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshOutreachToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const response = await fetch(OUTREACH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.OUTREACH_CLIENT_ID!,
      client_secret: process.env.OUTREACH_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}
```

## Outreach API (Server Actions)

```typescript
// lib/outreach.ts
'use server';

import { db } from '@/lib/db';
import { outreachConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { refreshOutreachToken } from './outreach-auth';

const OUTREACH_API_URL = 'https://api.outreach.io/api/v2';

// Helper to get valid access token (auto-refreshes if needed)
async function getAccessToken(userId: string): Promise<string> {
  const [connection] = await db
    .select()
    .from(outreachConnections)
    .where(eq(outreachConnections.userId, userId))
    .limit(1);

  if (!connection) throw new Error('Outreach connection not found');

  const now = new Date();

  // Refresh if token expires in less than 5 minutes
  if (connection.expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const newTokens = await refreshOutreachToken(connection.refreshToken);
    const newExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);

    await db.update(outreachConnections)
      .set({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(outreachConnections.userId, userId));

    return newTokens.accessToken;
  }

  return connection.accessToken;
}

// Generic Outreach API request
async function outreachRequest(
  userId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const accessToken = await getAccessToken(userId);

  const response = await fetch(`${OUTREACH_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.api+json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Outreach API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ============================================
// Exported Server Actions
// ============================================

export async function outreachGetMailboxes(userId: string) {
  const response = await outreachRequest(userId, '/mailboxes');
  return response.data as Array<{ id: number; attributes: { email: string } }>;
}

export async function outreachCreateSequence(
  userId: string,
  params: {
    name: string;
    description?: string;
  }
): Promise<number> {
  const response = await outreachRequest(userId, '/sequences', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sequence',
        attributes: {
          name: params.name,
          description: params.description,
          sequenceType: 'interval',
        },
      },
    }),
  });
  return response.data.id;
}

export async function outreachCreateSequenceStep(
  userId: string,
  params: {
    sequenceId: number;
    stepNumber: number;
    stepType: 'manual_email' | 'auto_email';
    intervalMinutes: number;
  }
): Promise<number> {
  const response = await outreachRequest(userId, '/sequenceSteps', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sequenceStep',
        attributes: {
          stepType: params.stepType,
          interval: params.intervalMinutes,
          order: params.stepNumber,
        },
        relationships: {
          sequence: { data: { type: 'sequence', id: params.sequenceId } },
        },
      },
    }),
  });
  return response.data.id;
}

export async function outreachCreateTemplate(
  userId: string,
  params: {
    name: string;
    subject: string;
    bodyHtml: string;
  }
): Promise<number> {
  const response = await outreachRequest(userId, '/templates', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'template',
        attributes: {
          name: params.name,
          subject: params.subject,
          bodyHtml: params.bodyHtml,
          toRecipients: ['{{email}}'],
        },
      },
    }),
  });
  return response.data.id;
}

export async function outreachCreateSequenceTemplate(
  userId: string,
  params: {
    sequenceId: number;
    sequenceStepId: number;
    templateId: number;
  }
): Promise<number> {
  const response = await outreachRequest(userId, '/sequenceTemplates', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sequenceTemplate',
        attributes: { isReply: false, enabled: true },
        relationships: {
          sequence: { data: { type: 'sequence', id: params.sequenceId } },
          sequenceStep: { data: { type: 'sequenceStep', id: params.sequenceStepId } },
          template: { data: { type: 'template', id: params.templateId } },
        },
      },
    }),
  });
  return response.data.id;
}

export async function outreachCreateProspect(
  userId: string,
  params: {
    email: string;
    firstName?: string;
    lastName?: string;
    customFields: Record<string, string>;
  }
): Promise<number> {
  const response = await outreachRequest(userId, '/prospects', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'prospect',
        attributes: {
          emails: [params.email],
          firstName: params.firstName,
          lastName: params.lastName,
          ...params.customFields,
        },
      },
    }),
  });
  return response.data.id;
}

export async function outreachCreateSequenceState(
  userId: string,
  params: {
    prospectId: number;
    sequenceId: number;
    mailboxId: number;
  }
): Promise<number> {
  const response = await outreachRequest(userId, '/sequenceStates', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sequenceState',
        relationships: {
          prospect: { data: { type: 'prospect', id: params.prospectId } },
          sequence: { data: { type: 'sequence', id: params.sequenceId } },
          mailbox: { data: { type: 'mailbox', id: params.mailboxId } },
        },
      },
    }),
  });
  return response.data.id;
}
```

## Workflows (Vercel Workflows)

### Campaign Creation Workflow

```typescript
// workflows/create-campaign.ts
import { db } from '@/lib/db';
import { campaigns, outreachConnections, type CampaignData, type SequenceConfig } from '@/lib/db/schema';
import {
  outreachCreateSequence,
  outreachCreateSequenceStep,
  outreachCreateTemplate,
  outreachCreateSequenceTemplate,
} from '@/lib/outreach';
import { eq } from 'drizzle-orm';

interface CreateCampaignInput {
  userId: string;
  name: string;
  description: string;
  mailboxId: number;
  sequence: SequenceConfig;
  promptConfig: {
    companyResearchEnabled: boolean;
    prompt: string;
  };
}

/**
 * Workflow: Create Campaign
 *
 * Orchestrates the full campaign creation process:
 * 1. Create sequence in Outreach
 * 2. Create sequence steps
 * 3. Create email templates with custom field merge tags
 * 4. Associate templates with steps
 * 5. Store campaign in database
 */
export async function workflowCreateCampaign(input: CreateCampaignInput) {
  'use workflow';

  // Step 1: Create the sequence in Outreach
  const sequenceId = await stepCreateSequence({
    userId: input.userId,
    name: input.name,
    description: input.description,
  });

  // Step 2: Create sequence steps
  const stepIds = await stepCreateSequenceSteps({
    userId: input.userId,
    sequenceId,
    config: input.sequence,
  });

  // Step 3: Create templates
  const templateIds = await stepCreateTemplates({
    userId: input.userId,
    campaignName: input.name,
    numEmails: 1 + input.sequence.numFollowups,
  });

  // Step 4: Associate templates with steps
  await stepAssociateTemplates({
    userId: input.userId,
    sequenceId,
    stepIds,
    templateIds,
  });

  // Step 5: Store campaign in database
  const campaignId = await stepStoreCampaign({
    userId: input.userId,
    data: {
      name: input.name,
      description: input.description,
      mailboxId: input.mailboxId,
      sequence: input.sequence,
      promptConfig: input.promptConfig,
      outreach: {
        sequenceId,
        stepIds,
        templateIds,
      },
    },
  });

  // Step 6: Update user stats (for gamification)
  await stepUpdateUserStats({ userId: input.userId });

  return { campaignId, sequenceId };
}

// ============================================
// Individual Steps
// ============================================

const stepCreateSequence = async ({
  userId,
  name,
  description,
}: {
  userId: string;
  name: string;
  description: string;
}): Promise<number> => {
  'use step';
  return outreachCreateSequence(userId, { name, description });
};

const stepCreateSequenceSteps = async ({
  userId,
  sequenceId,
  config,
}: {
  userId: string;
  sequenceId: number;
  config: SequenceConfig;
}): Promise<number[]> => {
  'use step';

  const totalEmails = 1 + config.numFollowups;
  const stepIds: number[] = [];

  for (let i = 0; i < totalEmails; i++) {
    const isFirst = i === 0;
    const stepType = isFirst && config.firstEmailManual ? 'manual_email' : 'auto_email';
    const intervalMinutes = isFirst ? 0 : config.intervalDays * 1440 * i;

    const stepId = await outreachCreateSequenceStep(userId, {
      sequenceId,
      stepNumber: i + 1,
      stepType,
      intervalMinutes,
    });
    stepIds.push(stepId);
  }

  return stepIds;
};

const stepCreateTemplates = async ({
  userId,
  campaignName,
  numEmails,
}: {
  userId: string;
  campaignName: string;
  numEmails: number;
}): Promise<number[]> => {
  'use step';

  const templateIds: number[] = [];

  for (let i = 0; i < numEmails; i++) {
    const customFieldNum = 81 + i; // custom81, custom82, etc.
    const templateId = await outreachCreateTemplate(userId, {
      name: `${campaignName} - Email ${i + 1}`,
      subject: '{{custom80}}',
      bodyHtml: `Hi {{#if first_name}}{{first_name}}{{else}}there{{/if}},<br><br>{{{custom${customFieldNum}}}}<br><br>{{sender.first_name}}`,
    });
    templateIds.push(templateId);
  }

  return templateIds;
};

const stepAssociateTemplates = async ({
  userId,
  sequenceId,
  stepIds,
  templateIds,
}: {
  userId: string;
  sequenceId: number;
  stepIds: number[];
  templateIds: number[];
}): Promise<void> => {
  'use step';

  for (let i = 0; i < stepIds.length; i++) {
    await outreachCreateSequenceTemplate(userId, {
      sequenceId,
      sequenceStepId: stepIds[i],
      templateId: templateIds[i],
    });
  }
};

const stepStoreCampaign = async ({
  userId,
  data,
}: {
  userId: string;
  data: CampaignData;
}): Promise<string> => {
  'use step';

  const [campaign] = await db.insert(campaigns)
    .values({
      userId,
      data,
      status: 'active',
    })
    .returning({ id: campaigns.id });

  return campaign.id;
};

const stepUpdateUserStats = async ({ userId }: { userId: string }): Promise<void> => {
  'use step';

  const [connection] = await db
    .select()
    .from(outreachConnections)
    .where(eq(outreachConnections.userId, userId))
    .limit(1);

  if (connection) {
    await db.update(outreachConnections)
      .set({
        data: {
          ...connection.data,
          campaignsCreated: (connection.data.campaignsCreated ?? 0) + 1,
          onboardingCompleted: true,
        },
        updatedAt: new Date(),
      })
      .where(eq(outreachConnections.userId, userId));
  }
};
```

### Contact Processing Workflow

```typescript
// workflows/process-contact.ts
import { db } from '@/lib/db';
import { contactJobs, campaigns, outreachConnections, type ContactJobData } from '@/lib/db/schema';
import { outreachCreateProspect, outreachCreateSequenceState } from '@/lib/outreach';
import { eq } from 'drizzle-orm';
import { generateObject } from 'ai';
import { z } from 'zod';

interface ProcessContactInput {
  jobId: string;
}

/**
 * Schema for AI-generated email content.
 * A single prompt generates:
 * - 1 subject line (used for all emails in the sequence)
 * - Up to 10 email bodies (first email + follow-ups)
 */
const EmailGenerationSchema = z.object({
  subject: z.string().describe('Email subject line for the sequence'),
  emails: z.array(z.string()).max(10).describe('Email bodies: first email followed by follow-ups'),
});

/**
 * Workflow: Process Contact
 *
 * Processes a single contact for a campaign:
 * 1. Load job and campaign data
 * 2. Optionally research the company
 * 3. Generate personalized emails using AI
 * 4. Create prospect in Outreach
 * 5. Add prospect to sequence
 * 6. Update job status
 */
export async function workflowProcessContact(input: ProcessContactInput) {
  'use workflow';

  const { jobId } = input;

  // Step 1: Load data and update status
  const { job, campaign, userId } = await stepLoadJobData({ jobId });

  await stepUpdateJobStatus({ jobId, status: 'generating' });

  try {
    // Step 2: Research company if enabled
    let companyResearch: string | undefined;
    if (campaign.data.promptConfig.companyResearchEnabled && job.data.contact.companyName) {
      companyResearch = await stepResearchCompany({
        companyName: job.data.contact.companyName,
      });
    }

    // Step 3: Generate email content
    const generated = await stepGenerateEmails({
      contact: job.data.contact,
      prompt: campaign.data.promptConfig.prompt,
      numEmails: 1 + campaign.data.sequence.numFollowups,
      companyResearch,
    });

    await stepUpdateJobStatus({
      jobId,
      status: 'creating_prospect',
      generated,
    });

    // Step 4: Create prospect in Outreach
    const prospectId = await stepCreateProspect({
      userId,
      contact: job.data.contact,
      generated,
    });

    // Step 5: Add to sequence
    const sequenceStateId = await stepAddToSequence({
      userId,
      prospectId,
      sequenceId: campaign.data.outreach.sequenceId,
      mailboxId: campaign.data.mailboxId,
    });

    // Step 6: Mark as completed
    await stepUpdateJobStatus({
      jobId,
      status: 'completed',
      outreach: { prospectId, sequenceStateId },
    });

    return { success: true, prospectId, sequenceStateId };

  } catch (error) {
    await stepUpdateJobStatus({
      jobId,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return { success: false, error };
  }
}

// ============================================
// Individual Steps
// ============================================

const stepLoadJobData = async ({ jobId }: { jobId: string }) => {
  'use step';

  const [job] = await db
    .select()
    .from(contactJobs)
    .where(eq(contactJobs.id, jobId))
    .limit(1);
  if (!job) throw new Error('Job not found');

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, job.campaignId))
    .limit(1);
  if (!campaign) throw new Error('Campaign not found');

  // userId from campaign is used for Outreach API calls
  return { job, campaign, userId: campaign.userId };
};

const stepUpdateJobStatus = async ({
  jobId,
  status,
  generated,
  outreach,
  errorMessage,
}: {
  jobId: string;
  status: ContactJobData['status'] extends string ? string : never;
  generated?: { subject: string; emails: string[]; companyResearch?: string };
  outreach?: { prospectId: number; sequenceStateId: number };
  errorMessage?: string;
}): Promise<void> => {
  'use step';

  const [job] = await db
    .select()
    .from(contactJobs)
    .where(eq(contactJobs.id, jobId))
    .limit(1);
  if (!job) return;

  const updatedData: ContactJobData = {
    ...job.data,
    ...(generated && { generated }),
    ...(outreach && { outreach }),
  };

  await db.update(contactJobs)
    .set({
      status: status as any,
      data: updatedData,
      errorMessage: errorMessage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(contactJobs.id, jobId));
};

const stepResearchCompany = async ({ companyName }: { companyName: string }): Promise<string> => {
  'use step';

  // Use Exa, Perplexity, or similar for company research
  // This is a placeholder - implement with your preferred service
  try {
    // const results = await exa.searchAndContents(`${companyName} company overview`, { ... });
    // Process and return summary
    return `${companyName} is a company.`; // Placeholder
  } catch {
    return `${companyName} is a company.`;
  }
};

/**
 * Generate personalized email sequence for a contact.
 * Uses a single campaign prompt to generate 1 subject + multiple email bodies.
 */
const stepGenerateEmails = async ({
  contact,
  prompt,
  numEmails,
  companyResearch,
}: {
  contact: { email: string; firstName?: string; lastName?: string; companyName?: string; context?: string };
  prompt: string;
  numEmails: number;
  companyResearch?: string;
}): Promise<{ subject: string; emails: string[]; companyResearch?: string }> => {
  'use step';

  const emailPrompt = `<system_prompt>
You are an expert sales email copywriter. Generate a personalized ${numEmails}-email sequence.

You must return:
- 1 subject line (used for the entire sequence)
- ${numEmails} email bodies (first email + ${numEmails - 1} follow-ups)

Write ONLY the email body content. Do not include:
- Greetings like "Hi [Name]" (added automatically)
- Sign-offs or signatures (added automatically)

Format each email body as clean HTML with <p> tags. Keep paragraphs short.
</system_prompt>

<contact>
Name: ${contact.firstName || ''} ${contact.lastName || ''}
Email: ${contact.email}
Company: ${contact.companyName || 'Unknown'}
${contact.context ? `Context: ${contact.context}` : ''}
</contact>

${companyResearch ? `<company_research>\n${companyResearch}\n</company_research>` : ''}

<campaign_prompt>
${prompt}
</campaign_prompt>`;

  const { object } = await generateObject({
    model: 'anthropic/claude-sonnet-4-20250514',
    prompt: emailPrompt,
    schema: EmailGenerationSchema,
  });

  return {
    subject: object.subject,
    emails: object.emails,
    companyResearch,
  };
};

const stepCreateProspect = async ({
  userId,
  contact,
  generated,
}: {
  userId: string;
  contact: { email: string; firstName?: string; lastName?: string };
  generated: { subject: string; emails: string[] };
}): Promise<number> => {
  'use step';

  const customFields: Record<string, string> = {
    custom80: generated.subject,
  };
  generated.emails.forEach((body, i) => {
    customFields[`custom${81 + i}`] = body;
  });

  return outreachCreateProspect(userId, {
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    customFields,
  });
};

const stepAddToSequence = async ({
  userId,
  prospectId,
  sequenceId,
  mailboxId,
}: {
  userId: string;
  prospectId: number;
  sequenceId: number;
  mailboxId: number;
}): Promise<number> => {
  'use step';

  return outreachCreateSequenceState(userId, {
    prospectId,
    sequenceId,
    mailboxId,
  });
};
```

### Batch Contact Processing Workflow

```typescript
// workflows/process-batch.ts
import { db } from '@/lib/db';
import { contactJobs, type ContactInput } from '@/lib/db/schema';
import { start } from 'workflow/api';
import { workflowProcessContact } from './process-contact';

interface ProcessBatchInput {
  campaignId: string;
  contacts: ContactInput[];
}

/**
 * Workflow: Process Batch
 *
 * Handles bulk contact upload:
 * 1. Create job records for all contacts
 * 2. Trigger individual processing workflows
 */
export async function workflowProcessBatch(input: ProcessBatchInput) {
  'use workflow';

  const { campaignId, contacts } = input;

  // Step 1: Create all job records
  const jobIds = await stepCreateJobRecords({ campaignId, contacts });

  // Step 2: Start individual workflows for each contact
  for (const jobId of jobIds) {
    await start(workflowProcessContact, [{ jobId }]);
  }

  return { jobIds, count: jobIds.length };
}

const stepCreateJobRecords = async ({
  campaignId,
  contacts,
}: {
  campaignId: string;
  contacts: ContactInput[];
}): Promise<string[]> => {
  'use step';

  const records = await db.insert(contactJobs)
    .values(
      contacts.map((contact) => ({
        campaignId,
        data: { contact },
        status: 'pending' as const,
      }))
    )
    .returning({ id: contactJobs.id });

  return records.map((r) => r.id);
};
```

## API Routes

### POST /api/campaigns
Create a new campaign (triggers `workflowCreateCampaign`).

### POST /api/campaigns/[id]/contacts
Upload contacts CSV/JSON (triggers `workflowProcessBatch`).

### GET /api/campaigns/[id]/contacts
Get contact processing status.

### POST /api/campaigns/[id]/test
Test email generation with sample contact.

### GET /api/mailboxes
Get user's Outreach mailboxes.

---

# Frontend Components

## Campaign Wizard

The campaign wizard is a **single-page layout** where all steps are visible at once. Each step is numbered with a colored circle indicator. The section the user hovers over has normal coloring, while all other sections are slightly dimmed for emphasis.

```typescript
// components/campaign-wizard/wizard-section.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface WizardSectionProps {
  stepNumber: number;
  title: string;
  children: ReactNode;
  isHovered: boolean;
  anyHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function WizardSection({
  stepNumber,
  title,
  children,
  isHovered,
  anyHovered,
  onMouseEnter,
  onMouseLeave,
}: WizardSectionProps) {
  // Dim this section if another section is hovered
  const isDimmed = anyHovered && !isHovered;

  return (
    <motion.section
      className="relative p-6 rounded-xl border border-gray-200 bg-white"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{
        opacity: isDimmed ? 0.5 : 1,
        scale: isDimmed ? 0.98 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Step number circle */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {stepNumber}
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Section content */}
      <div className="pl-14">{children}</div>
    </motion.section>
  );
}
```

```typescript
// components/campaign-wizard/campaign-wizard.tsx
'use client';

import { useState } from 'react';
import { WizardSection } from './wizard-section';
import { BasicInfoStep } from './steps/basic-info';
import { SequenceConfigStep } from './steps/sequence-config';
import { PromptConfigStep } from './steps/prompt-config';
import { TestPromptsStep } from './steps/test-prompts';
import { FinalizeStep } from './steps/finalize';

const STEPS = [
  { number: 1, title: 'Basic Info', component: BasicInfoStep },
  { number: 2, title: 'Sequence Configuration', component: SequenceConfigStep },
  { number: 3, title: 'Prompt Configuration', component: PromptConfigStep },
  { number: 4, title: 'Test Your Prompts', component: TestPromptsStep },
  { number: 5, title: 'Create Campaign', component: FinalizeStep },
];

export function CampaignWizard() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({});

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-gray-600 mt-2">Set up your AI-powered email sequence</p>
      </header>

      {STEPS.map((step) => {
        const StepComponent = step.component;
        return (
          <WizardSection
            key={step.number}
            stepNumber={step.number}
            title={step.title}
            isHovered={hoveredStep === step.number}
            anyHovered={hoveredStep !== null}
            onMouseEnter={() => setHoveredStep(step.number)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <StepComponent formData={formData} setFormData={setFormData} />
          </WizardSection>
        );
      })}
    </div>
  );
}
```

## Progress Indicator

Optional progress bar for the top of the page showing overall completion.

```typescript
// components/campaign-wizard/progress-bar.tsx
'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}
```

## Celebration Screen

```typescript
// components/campaign-wizard/celebration.tsx
'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface CelebrationProps {
  campaignNumber: number;
  onContinue: () => void;
}

export function Celebration({ campaignNumber, onContinue }: CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <motion.div
        className="text-center space-y-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Campaign Created!
        </motion.h1>

        <motion.div
          className="inline-block px-4 py-2 bg-purple-100 rounded-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-purple-600 font-medium">
            Campaign #{campaignNumber} Unlocked
          </span>
        </motion.div>

        <motion.button
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          onClick={onContinue}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Contacts
        </motion.button>
      </motion.div>
    </div>
  );
}
```

---

# Implementation Phases

## Phase 1: Core Infrastructure
- [ ] Database setup (Postgres + Drizzle)
- [ ] Outreach OAuth flow
- [ ] Outreach API server actions
- [ ] Vercel Workflows setup

## Phase 2: Campaign Creation
- [ ] Campaign wizard UI with animations
- [ ] Campaign creation workflow
- [ ] Prompt configuration
- [ ] Celebration screen

## Phase 3: Contact Processing
- [ ] CSV/JSON upload UI
- [ ] Contact processing workflow
- [ ] Batch processing workflow
- [ ] Job status tracking/polling

## Phase 4: Polish
- [ ] Prompt testing UI
- [ ] Prompt selection UI (Outr defaults + previous campaigns)
- [ ] Sound effects (optional)
- [ ] Error handling & retries
- [ ] Campaign analytics dashboard

---

# Manual Testing Guide

High-level happy path testing for core product areas. Use this as a guide for general manual QA.

## 1. Outreach App Installation

**Objective:** Verify the OAuth flow works correctly from the Outreach marketplace.

- [ ] Navigate to Outreach marketplace and locate Outr app
- [ ] Click "Install" and confirm permissions dialog
- [ ] Complete OAuth authorization flow
- [ ] Verify redirect back to Outr dashboard
- [ ] Confirm user record created in database with valid tokens
- [ ] Verify default mailbox is detected and stored

## 2. New User Onboarding

**Objective:** First-time user lands on dashboard and is guided to create their first campaign.

- [ ] After OAuth, user lands on dashboard
- [ ] Empty state prompts user to create first campaign
- [ ] "Create Campaign" CTA is prominent and clear
- [ ] Progress indicators show user is at step 0/5

## 3. First Campaign Creation

**Objective:** Complete the full campaign wizard with celebration animations.

### Step 1: Basic Info
- [ ] Enter campaign name
- [ ] Enter campaign description
- [ ] Mailbox defaults to user's primary mailbox
- [ ] Can optionally select different mailbox from dropdown
- [ ] "Next" button enabled only when required fields complete

### Step 2: Sequence Configuration
- [ ] Toggle between manual/automatic first email
- [ ] Adjust number of follow-ups (1-10)
- [ ] Set interval between emails (days)
- [ ] Defaults are sensible (2 follow-ups, manual first email)

### Step 3: Prompt Configuration
- [ ] Company research toggle works
- [ ] Outr default prompts available in dropdown
- [ ] Can customize prompt text
- [ ] Custom prompt will be available in future campaigns (stored with campaign)

### Step 4: Test Prompts
- [ ] Default test companies displayed (5 well-known brands)
- [ ] Can add custom test contact
- [ ] "Generate Preview" creates sample emails
- [ ] Preview displays subject line and all email bodies
- [ ] Can go back and adjust prompt, then re-test
- [ ] Results feel personalized based on company

### Step 5: Finalize
- [ ] "Create Campaign" triggers workflow
- [ ] Loading state shown during creation
- [ ] Sequence created in Outreach (verify via Outreach UI)
- [ ] Campaign stored in Outr database
- [ ] **Celebration screen appears with confetti**
- [ ] "Campaign #1 Created!" achievement shown
- [ ] "Add Contacts" CTA redirects to contact import

## 4. Contact Import (First Campaign)

**Objective:** Upload contacts and verify they're processed correctly.

### CSV Upload
- [ ] Drag-and-drop CSV file works
- [ ] Click-to-upload works
- [ ] CSV parsed and preview shown (first 5 rows)
- [ ] Column mapping UI if headers don't match expected fields
- [ ] Validation errors shown for malformed rows
- [ ] "Import X Contacts" button shows count

### Processing
- [ ] Import triggers batch processing workflow
- [ ] Progress indicator shows jobs being processed
- [ ] Individual contact status updates (pending → generating → creating_prospect → completed)
- [ ] Can see generated email previews for each contact
- [ ] Failed jobs show error message

### Outreach Verification
- [ ] Prospects created in Outreach with correct custom fields
- [ ] Prospects added to sequence
- [ ] Tasks appear in Outreach task queue (if manual first email)
- [ ] Email content matches generated preview

## 5. Second Campaign Creation

**Objective:** Repeat user creates another campaign with streamlined experience.

- [ ] Dashboard now shows existing campaign(s)
- [ ] "Create Campaign" button accessible
- [ ] Wizard remembers nothing from previous campaign (fresh start)
- [ ] **Prompt dropdown shows Outr defaults + prompts from first campaign**
- [ ] Can select existing prompt or write a new one
- [ ] Celebration shows "Campaign #2 Created!"
- [ ] User stats updated (campaignsCreated incremented)

## 6. Campaign Management

**Objective:** User can view and manage existing campaigns.

- [ ] Campaign list shows all campaigns with status
- [ ] Can click into campaign to see details
- [ ] Contact processing status visible (X completed, Y pending, Z failed)
- [ ] Can pause campaign (prevents new contacts from processing)
- [ ] Can archive campaign (removes from active list)
- [ ] Can add more contacts to existing campaign

## 7. Reporting & Analytics

**Objective:** User can view campaign performance pulled from Outreach.

- [ ] Campaign detail page shows Outreach metrics
- [ ] Metrics include: contacted, opened, replied, interested
- [ ] Data refreshes on page load (or manual refresh button)
- [ ] Empty state if no activity yet

## 8. Token Refresh

**Objective:** Verify OAuth tokens refresh automatically before expiration.

- [ ] After ~2 hours, make an API call that requires Outreach access
- [ ] Token should auto-refresh without user intervention
- [ ] User remains logged in
- [ ] New token stored in database

## 9. API Endpoint (Optional)

**Objective:** Verify programmatic contact import via API.

- [ ] POST to `/api/campaigns/[id]/contacts` with JSON body
- [ ] Authentication required (API key or session)
- [ ] Returns job IDs for tracking
- [ ] Contacts processed same as CSV upload

---

## Testing Notes

**Test Accounts:**
- Use Outreach sandbox/dev environment when available
- Create dedicated test user for QA

**Data Cleanup:**
- Delete test sequences from Outreach after testing
- Clear test campaigns from Outr database

**Edge Cases (for later):**
- OAuth token expired and refresh also expired
- Outreach API rate limiting
- Large CSV upload (1000+ contacts)
- Malformed CSV files
- Duplicate email addresses
