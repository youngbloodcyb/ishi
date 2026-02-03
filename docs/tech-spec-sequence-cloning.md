# Sequence Cloning Feature Spec

**Created:** 2026-02-01
**Status:** Draft

## Overview

This feature enables users to clone an existing Outreach sequence into Outr, replacing email subjects and bodies with AI-powered custom field placeholders. This allows users to leverage their existing high-performing sequences while gaining AI personalization capabilities.

## Feature Summary

1. **Configurable Custom Fields** - Allow organizations to configure which Outreach custom fields Outr uses
2. **Sequence Cloning** - Clone an existing Outreach sequence, replacing email content with custom field templates

---

## Part 1: Custom Field Configuration

### Background

Currently, Outr hardcodes custom field usage:
- `custom80`: Subject line (shared across sequence)
- `custom81-90`: Email bodies (up to 10 emails)

This limits users to 10 emails per sequence and may conflict with existing custom field usage in their Outreach account.

### Requirements

Allow organizations to configure their own custom field mappings:

| Field Type | Min | Max | Notes |
|------------|-----|-----|-------|
| Subject line | 1 | 1 | Single custom field for subject |
| Initial email body | 1 | 1 | First email in sequence |
| Follow-up email bodies | 1 | 19 | Additional emails (total 21 possible) |

Outreach supports `custom1` through `custom99` (99 total custom fields).

### Data Model Changes

Add a `data` jsonb column to the `organizations` table and define `OrganizationData` in `lib/db/schema.ts`:

```typescript
// New interface for organization-level settings
export interface CustomFieldMapping {
  subject: number;      // e.g., 80 for custom80
  emailBodies: number[]; // e.g., [81, 82, 83] for custom81-83
}

export interface OrganizationData {
  customFieldMapping?: CustomFieldMapping;
  // Future org-level settings can be added here
}

// Updated organizations table
export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 255 }).primaryKey(), // WorkOS org ID
  name: varchar("name", { length: 255 }).notNull(),
  data: jsonb("data").$type<OrganizationData>(), // NEW - nullable, defaults handled in code
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
```

This keeps custom field configuration at the organization level, so all team members share the same field mappings.

### Default Configuration

When no custom field mapping is configured, use current defaults:
```typescript
const DEFAULT_CUSTOM_FIELD_MAPPING: CustomFieldMapping = {
  subject: 80,
  emailBodies: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
};
```

### Settings UI

Add a "Custom Fields" section to Organization Settings (`/settings/integrations` or `/settings/outreach`).

**Access control**: Only organization admins and owners can modify these settings. Members can view but not edit.

```
┌─────────────────────────────────────────────────────────────┐
│  Outreach Custom Field Configuration                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Subject Line Field                                         │
│  ┌─────────────────────────────────┐                       │
│  │ custom80                      ▼ │                       │
│  └─────────────────────────────────┘                       │
│  ℹ️ This custom field stores the AI-generated subject line │
│                                                             │
│  Email Body Fields                                          │
│  Configure custom fields for each email position            │
│                                                             │
│  Email 1 (Initial): ┌─────────┐                            │
│                     │ custom81│  [Required]                │
│                     └─────────┘                            │
│  Email 2 (Follow-up 1): ┌─────────┐                        │
│                         │ custom82│  [Required]            │
│                         └─────────┘                        │
│  Email 3 (Follow-up 2): ┌─────────┐                        │
│                         │ custom83│  [Required]            │
│                         └─────────┘                        │
│                                                             │
│  [+ Add Follow-up Email Field]     (max 21 total)          │
│                                                             │
│  ⚠️ Minimum 3 fields required (subject + 2 emails)         │
│                                                             │
│  [Save Configuration]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Validation Rules

1. **Minimum fields**: 1 subject + 3 email bodies (initial + 2 follow-ups) = 4 total
2. **Maximum fields**: 1 subject + 21 email bodies = 22 total
3. **No duplicates**: Each custom field number can only be used once
4. **Valid range**: Custom field numbers must be 1-99
5. **Uniqueness**: Cannot use the same field for subject and body

### Server Actions

```typescript
// lib/services/organization.ts

export async function updateOrganizationCustomFieldMapping(
  organizationId: string,
  mapping: CustomFieldMapping
): Promise<void> {
  const { user } = await withAuth({ ensureSignedIn: true });

  // Verify user has admin/owner role in this org
  const membership = await getOrganizationMembership(user.id, organizationId);
  if (!membership || membership.role === "member") {
    throw new Error("Only admins and owners can update organization settings");
  }

  // Validate mapping
  if (mapping.emailBodies.length < 3) {
    throw new Error("Minimum 3 email body fields required");
  }
  if (mapping.emailBodies.length > 21) {
    throw new Error("Maximum 21 email body fields allowed");
  }
  if (mapping.emailBodies.includes(mapping.subject)) {
    throw new Error("Subject field cannot also be used for email body");
  }

  const allFields = [mapping.subject, ...mapping.emailBodies];
  const uniqueFields = new Set(allFields);
  if (uniqueFields.size !== allFields.length) {
    throw new Error("Duplicate custom field numbers not allowed");
  }

  // Get current org data and merge
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  await db
    .update(organizations)
    .set({
      data: {
        ...org?.data,
        customFieldMapping: mapping,
      },
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));
}

export async function getOrganizationCustomFieldMapping(
  organizationId: string
): Promise<CustomFieldMapping> {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return org?.data?.customFieldMapping ?? DEFAULT_CUSTOM_FIELD_MAPPING;
}
```

### Migration Path

1. **Database migration**: Add `data` jsonb column to `organizations` table (nullable)
2. Existing campaigns continue to work with hardcoded defaults
3. New campaigns use org-configured fields (or defaults if not configured)
4. Organizations can configure custom fields at any time via Settings

---

## Part 2: Sequence Cloning

### User Flow

1. User navigates to "Clone Sequence" (accessible from dashboard or campaigns page)
2. User enters an Outreach sequence ID
3. System fetches and analyzes the sequence
4. System displays analysis results with warnings/errors
5. User confirms to create the cloned sequence
6. System creates new sequence with AI custom field templates

### Sequence Analysis

Before cloning, analyze the source sequence to determine compatibility:

#### Step Types

Outreach supports these step types:
- `auto_email` - Automated email send
- `manual_email` - Email requires manual review/send
- `call` - Phone call task
- `task` - Generic task

**Handling non-email steps:**
- `call` and `task` steps are **preserved as-is** (no AI replacement)
- User is warned that these steps will remain unchanged

#### Capacity Check

Calculate required custom fields:
```
Required fields = (number of email steps) × (max variants per step)
```

**Example analysis:**
```
Sequence "Enterprise Outreach" (ID: 12345)
├── Step 1: manual_email (2 variants) → Needs 2 custom fields
├── Step 2: call → Preserved (no fields needed)
├── Step 3: auto_email (3 variants) → Needs 3 custom fields
├── Step 4: auto_email (1 variant) → Needs 1 custom field
└── Step 5: task → Preserved (no fields needed)

Total email custom fields needed: 6 (2+3+1)
Subject fields needed: 1 per unique subject variant

Configured capacity: 10 email body fields
✅ Sufficient capacity
```

#### Variant Handling

Outreach sequences can have multiple template variants per step (A/B testing). Each variant needs its own custom field.

**Important**: The analysis must account for variants:
```typescript
interface SequenceStepAnalysis {
  stepId: number;
  order: number;
  stepType: 'auto_email' | 'manual_email' | 'call' | 'task';
  interval: number;
  templateVariants: Array<{
    templateId: number;
    subject: string;
    bodyHtml: string;
  }>;
}
```

### Error Conditions

| Condition | Severity | Message |
|-----------|----------|---------|
| Sequence not found | Error | "Sequence with ID {id} not found in your Outreach account" |
| Insufficient custom fields | Error | "This sequence requires {n} email body fields but only {m} are configured. Please add more custom fields in settings." |
| No email steps | Error | "This sequence contains no email steps to clone" |
| Contains call/task steps | Warning | "This sequence contains {n} non-email steps (calls/tasks) that will be preserved without AI personalization" |
| Very high variant count | Warning | "This sequence has {n} template variants. Consider reducing variants to maximize AI personalization potential." |

### Cloning Process

#### Step 1: Fetch Source Sequence

```typescript
// New Outreach API functions needed

export async function outreachGetSequence(
  userId: string,
  sequenceId: number
): Promise<OutreachSequence> {
  const response = await outreachRequest(
    userId,
    `/sequences/${sequenceId}?include=sequenceSteps`
  );
  return response.data;
}

export async function outreachGetSequenceSteps(
  userId: string,
  sequenceId: number
): Promise<OutreachSequenceStep[]> {
  const response = await outreachRequest(
    userId,
    `/sequenceSteps?filter[sequence][id]=${sequenceId}&include=sequenceTemplates`
  );
  return response.data;
}

export async function outreachGetTemplate(
  userId: string,
  templateId: number
): Promise<OutreachTemplate> {
  const response = await outreachRequest(userId, `/templates/${templateId}`);
  return response.data;
}
```

#### Step 2: Analyze Sequence

```typescript
interface SequenceAnalysis {
  sequenceId: number;
  sequenceName: string;
  totalSteps: number;
  emailSteps: number;
  callSteps: number;
  taskSteps: number;
  totalVariants: number;
  requiredBodyFields: number;
  requiredSubjectFields: number;
  configuredBodyFields: number;
  configuredSubjectFields: number;
  canClone: boolean;
  errors: string[];
  warnings: string[];
  steps: SequenceStepAnalysis[];
}

export async function analyzeSequenceForCloning(
  userId: string,
  organizationId: string,
  sequenceId: number
): Promise<SequenceAnalysis> {
  const customFieldMapping = await getOrganizationCustomFieldMapping(organizationId);
  const sequence = await outreachGetSequence(userId, sequenceId);
  const steps = await outreachGetSequenceSteps(userId, sequenceId);

  // Build analysis...
}
```

#### Step 3: Create Cloned Sequence

For email steps, replace template content with custom field placeholders:

**Original template:**
```html
Subject: Quick question about {{company}}'s growth plans
Body: Hi {{first_name}}, I noticed {{company}} recently expanded into...
```

**Cloned template (using custom81 for this step):**
```html
Subject: {{custom80}}
Body: {{{custom81}}}
```

The cloning preserves:
- Sequence name (with " (Outr Clone)" suffix)
- Sequence type (interval/date)
- Step order and intervals
- Step types (manual_email vs auto_email)
- Non-email steps (call/task) exactly as-is
- Variant structure (each variant gets a unique custom field)

### Custom Field Assignment Strategy

Assign custom fields sequentially across steps and variants:

```
Step 1 (manual_email, 2 variants):
  - Variant A: body → custom81
  - Variant B: body → custom82

Step 3 (auto_email, 3 variants):
  - Variant A: body → custom83
  - Variant B: body → custom84
  - Variant C: body → custom85

Step 4 (auto_email, 1 variant):
  - Variant A: body → custom86

All subjects: → custom80 (single field, personalized per prospect)
```

**Mapping storage:**

Store the field assignment in the campaign data for use during contact processing:

```typescript
interface ClonedSequenceMapping {
  sourceSequenceId: number;
  subjectField: number;
  stepMappings: Array<{
    stepOrder: number;
    stepType: string;
    variantMappings: Array<{
      templateId: number;
      bodyField: number;
    }>;
  }>;
}
```

### UI Components

#### Clone Sequence Dialog/Page

```
┌─────────────────────────────────────────────────────────────┐
│  Clone Outreach Sequence                               [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Enter the ID of an Outreach sequence to clone:             │
│  ┌─────────────────────────────────────┐                   │
│  │ 12345                               │  [Analyze]        │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ℹ️ Find sequence IDs in your Outreach Sequences page      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Analysis Results

```
┌─────────────────────────────────────────────────────────────┐
│  Sequence Analysis                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 "Enterprise Outreach Q1" (ID: 12345)                   │
│                                                             │
│  Steps Overview:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. 📧 Manual Email (2 variants) - Day 0            │   │
│  │ 2. 📞 Call - Day 2 (will be preserved)             │   │
│  │ 3. 📧 Auto Email (3 variants) - Day 4              │   │
│  │ 4. 📧 Auto Email (1 variant) - Day 7               │   │
│  │ 5. ✅ Task - Day 10 (will be preserved)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Capacity Check:                                            │
│  • Email body fields needed: 6                              │
│  • Email body fields available: 10                          │
│  • ✅ Sufficient capacity                                   │
│                                                             │
│  ⚠️ Warnings:                                               │
│  • 2 non-email steps (call, task) will be preserved        │
│    without AI personalization                               │
│                                                             │
│  [Cancel]                        [Clone Sequence →]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Error State

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Cannot Clone Sequence                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This sequence requires more custom fields than configured: │
│                                                             │
│  • Variants found: 15                                       │
│  • Fields available: 10                                     │
│  • Fields needed: 15                                        │
│                                                             │
│  Options:                                                   │
│  1. Configure additional custom fields in Settings          │
│  2. Clone a sequence with fewer variants                    │
│                                                             │
│  [Go to Settings]                    [Try Different ID]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Server Actions

```typescript
// lib/services/sequence-cloning.ts

export async function analyzeSequenceAction(
  sequenceId: number
): Promise<SequenceAnalysis> {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  if (!organizationId) throw new Error("No organization selected");
  return analyzeSequenceForCloning(user.id, organizationId, sequenceId);
}

export async function cloneSequenceAction(
  sequenceId: number,
  options?: {
    name?: string;
    mailboxId?: number;
    promptId?: string;
  }
): Promise<{ campaignId: string; newSequenceId: number }> {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  if (!organizationId) throw new Error("No organization selected");

  // 1. Re-analyze to ensure still valid
  const analysis = await analyzeSequenceForCloning(user.id, organizationId, sequenceId);
  if (!analysis.canClone) {
    throw new Error(analysis.errors.join("; "));
  }

  // 2. Create cloned sequence in Outreach
  const newSequenceId = await createClonedSequence(user.id, analysis, options);

  // 3. Create Outr campaign linked to cloned sequence
  const campaignId = await createCampaignFromClone(user.id, organizationId, analysis, newSequenceId, options);

  return { campaignId, newSequenceId };
}
```

### Workflow Integration

After cloning, the sequence behaves like any Outr campaign:
1. User uploads contacts or uses API
2. AI generates personalized content (subject + emails for each step/variant)
3. Content stored in prospect custom fields
4. Outreach sends emails with custom field merge tags

The contact processing workflow needs updates to handle variant mappings:

```typescript
// workflows/process-contact.ts (modified)

const stepCreateProspect = async ({
  userId,
  organizationId,
  contact,
  generated,
  campaign,
}: {
  userId: string;
  organizationId: string;
  contact: ContactInput;
  generated: GeneratedContent;
  campaign: Campaign;
}): Promise<number> => {
  "use step";

  const mapping = campaign.data.clonedSequenceMapping;
  const customFieldMapping = await getOrganizationCustomFieldMapping(organizationId);

  const customFields: Record<string, string> = {
    [`custom${customFieldMapping.subject}`]: generated.subject,
  };

  if (mapping) {
    // Cloned sequence: assign bodies to specific variant fields
    let bodyIndex = 0;
    for (const step of mapping.stepMappings) {
      if (step.stepType === 'call' || step.stepType === 'task') continue;
      for (const variant of step.variantMappings) {
        if (bodyIndex < generated.emails.length) {
          customFields[`custom${variant.bodyField}`] = generated.emails[bodyIndex];
        }
        bodyIndex++;
      }
    }
  } else {
    // Standard Outr campaign: sequential assignment
    generated.emails.forEach((body, i) => {
      customFields[`custom${customFieldMapping.emailBodies[i]}`] = body;
    });
  }

  return outreachCreateProspect(userId, {
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    customFields,
  });
};
```

---

## API Reference (Outreach)

Based on [Outreach API documentation](https://developers.outreach.io/api/reference/):

### GET /sequences/{id}

Fetch sequence details.

**Response attributes:**
- `name`: string
- `description`: string
- `sequenceType`: "interval" | "date"
- `tags`: string[]
- `enabled`: boolean

### GET /sequenceSteps

Fetch steps for a sequence.

**Query params:**
- `filter[sequence][id]`: Sequence ID
- `include`: sequenceTemplates (to get template associations)

**Response attributes:**
- `stepType`: "auto_email" | "manual_email" | "call" | "task"
- `order`: number (1-indexed position)
- `interval`: number (minutes for interval-based, null for date-based)
- `date`: string (ISO date for date-based sequences)
- `taskNote`: string (for task steps)

### GET /sequenceTemplates

Fetch template associations for sequence steps.

**Query params:**
- `filter[sequenceStep][id]`: Step ID

**Response includes:**
- `relationships.template.data.id`: Template ID

### GET /templates/{id}

Fetch template content.

**Response attributes:**
- `name`: string
- `subject`: string
- `bodyHtml`: string
- `bodyText`: string

---

## Implementation Phases

### Phase 1: Custom Field Configuration
1. Add `data` jsonb column to `organizations` table (migration)
2. Define `OrganizationData` interface with `customFieldMapping`
3. Create settings UI component for field configuration (org settings)
4. Add validation and save server action (admin/owner only)
5. Update existing code to use org-level configured fields (non-breaking, falls back to defaults)

### Phase 2: Sequence Analysis
1. Add new Outreach API functions (getSequence, getSequenceSteps, getTemplate)
2. Build sequence analysis logic
3. Create analysis UI components

### Phase 3: Cloning Implementation
1. Implement clone workflow (create sequence, steps, templates)
2. Store clone mapping in campaign data
3. Update contact processing for variant-aware field assignment

### Phase 4: Polish
1. Error handling and edge cases
2. Loading states and progress indicators
3. Success confirmation with link to new campaign

---

## Open Questions

1. **Subject line variants**: Should each email step variant have its own subject, or share one subject across all variants in the sequence?
   - Current assumption: Single subject field shared across sequence

2. **Preserving original content**: Should we store the original template content for reference/comparison?
   - Could be useful for debugging or showing "before/after"

3. **Sync handling**: If the source sequence changes after cloning, should we detect/warn about drift?
   - Initial implementation: No sync, clone is independent

4. **Multiple subjects per step**: Some sequences use different subjects for A/B variants within the same step. How should we handle this?
   - Option A: All variants share single subject field (current assumption)
   - Option B: Each variant gets subject + body fields (more fields needed)

---

## Related Documents

- [Tech Spec: Outr High Level](./tech-spec-outr-high-level.md)
- [Tech Spec: Installation Flows](./tech-spec-installation-flows.md)

## References

- [Outreach API - Sequence](https://developers.outreach.io/api/reference/tag/Sequence/)
- [Outreach API - Sequence Step](https://developers.outreach.io/api/reference/tag/Sequence-Step/)
- [Outreach API - Sequence Template](https://developers.outreach.io/api/reference/tag/Sequence-Template/)
- [Outreach API - Common Patterns](https://developers.outreach.io/api/common-patterns/)
