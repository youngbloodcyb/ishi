# Installation Flows Tech Spec

**Table of Contents**

1. Overview
2. Flow Comparison
3. Flow A: Outreach Marketplace Installation
4. Flow B: Direct Signup (Existing)
5. Implementation Details
6. API Routes
7. Environment Variables
8. Security Considerations
9. Testing Guide

---

# Overview

Outr supports two installation/signup flows:

| Flow | Entry Point | Target User |
|------|-------------|-------------|
| **Flow A** | Outreach Marketplace "Install" button | Outreach users discovering Outr |
| **Flow B** | Direct signup at outr.ai | Users who hear about Outr elsewhere |

Both flows result in:
- A WorkOS user account
- A WorkOS organization (1:1 with user for now)
- Local database records synced from WorkOS
- An Outreach OAuth connection (immediately for Flow A, later for Flow B)

---

# Flow Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLOW A: Outreach Marketplace                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Outreach       Outr               WorkOS            Outreach API           │
│  Marketplace    Backend            API               (User Info)            │
│      │              │                │                    │                 │
│      │ Install      │                │                    │                 │
│      ├─────────────>│                │                    │                 │
│      │              │                │                    │                 │
│      │<─────────────┤ Redirect to Outreach OAuth          │                 │
│      │              │                │                    │                 │
│      │ User approves│                │                    │                 │
│      ├─────────────>│                │                    │                 │
│      │              │                │                    │                 │
│      │              │ Exchange code  │                    │                 │
│      │              ├───────────────>│                    │                 │
│      │              │<───────────────┤ tokens             │                 │
│      │              │                │                    │                 │
│      │              │ GET /users (find current user)      │                 │
│      │              ├────────────────────────────────────>│                 │
│      │              │<────────────────────────────────────┤ user info       │
│      │              │                │                    │                 │
│      │              │ Create org     │                    │                 │
│      │              ├───────────────>│                    │                 │
│      │              │<───────────────┤ org                │                 │
│      │              │                │                    │                 │
│      │              │ Create user    │                    │                 │
│      │              ├───────────────>│                    │                 │
│      │              │<───────────────┤ user               │                 │
│      │              │                │                    │                 │
│      │              │ Create membership                   │                 │
│      │              ├───────────────>│                    │                 │
│      │              │<───────────────┤ membership         │                 │
│      │              │                │                    │                 │
│      │              │ Store in local DB                   │                 │
│      │              │ Send magic link email               │                 │
│      │              │                │                    │                 │
│      │<─────────────┤ Redirect to /onboarding/check-email            │                 │
│      │              │                │                    │                 │
│      │ User clicks magic link in email                    │                 │
│      ├─────────────────────────────────>│                 │                 │
│      │<─────────────────────────────────┤ session         │                 │
│      │              │                │                    │                 │
│      │<─────────────┤ Redirect to dashboard               │                 │
│      │              │                │                    │                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLOW B: Direct Signup (Existing)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User           Outr               WorkOS            Outreach               │
│                 Frontend           AuthKit           OAuth                  │
│    │              │                   │                 │                   │
│    │ Visit outr.ai│                   │                 │                   │
│    ├─────────────>│                   │                 │                   │
│    │              │                   │                 │                   │
│    │<─────────────┤ Redirect to AuthKit                 │                   │
│    │              │                   │                 │                   │
│    │ Sign up/in   │                   │                 │                   │
│    ├─────────────────────────────────>│                 │                   │
│    │<─────────────────────────────────┤ session         │                   │
│    │              │                   │                 │                   │
│    │              │ Dashboard (no Outreach connection)  │                   │
│    │<─────────────┤                   │                 │                   │
│    │              │                   │                 │                   │
│    │ Click "Connect Outreach"         │                 │                   │
│    ├─────────────>│                   │                 │                   │
│    │              │                   │                 │                   │
│    │<─────────────┤ Redirect to Outreach OAuth          │                   │
│    │              │                   │                 │                   │
│    │ Approve      │                   │                 │                   │
│    ├─────────────────────────────────────────────────────>│                 │
│    │<─────────────────────────────────────────────────────┤ code            │
│    │              │                   │                 │                   │
│    │              │ Exchange & store tokens             │                   │
│    │              │                   │                 │                   │
│    │<─────────────┤ Redirect to dashboard               │                   │
│    │              │                   │                 │                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Flow A: Outreach Marketplace Installation

## Step-by-Step

### 1. User Clicks "Install" on Outreach Marketplace

Outreach redirects to our OAuth callback URL with no prior authentication.

**Outreach redirects to:**
```
https://outr.ai/api/outreach/install?code=<auth_code>
```

### 2. Exchange Code for Tokens

```typescript
const tokens = await exchangeOutreachCode(code);
// Returns: { accessToken, refreshToken, expiresIn }
```

### 3. Fetch User Info from Outreach API

Using the access token, call Outreach API to get current user:

```typescript
const response = await fetch('https://api.outreach.io/api/v2/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/vnd.api+json',
  },
});
const users = await response.json();
// Find the authenticated user (usually first one or use /users/me if available)
```

**Outreach User Response:**
```json
{
  "data": [{
    "type": "user",
    "id": 12345,
    "attributes": {
      "email": "jane@company.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "name": "Jane Doe"
    }
  }]
}
```

### 4. Check for Existing User

Query our database to see if this email already exists:

```typescript
const existingUser = await db
  .select()
  .from(users)
  .where(eq(users.email, outreachUser.email))
  .limit(1);
```

### 5a. New User: Create WorkOS Organization + User

```typescript
import { workos } from '@/lib/workos';

// Create organization (named after user's company or email domain)
const organization = await workos.organizations.createOrganization({
  name: `${outreachUser.firstName}'s Organization`,
});

// Create user
const workosUser = await workos.userManagement.createUser({
  email: outreachUser.email,
  firstName: outreachUser.firstName,
  lastName: outreachUser.lastName,
  emailVerified: true, // Trust Outreach's verification
});

// Create membership
await workos.userManagement.createOrganizationMembership({
  userId: workosUser.id,
  organizationId: organization.id,
  roleSlug: 'owner',
});
```

### 5b. Existing User: Link Outreach Connection

If user already exists, just add the Outreach connection to their account.

### 6. Sync to Local Database

```typescript
// Insert/update organization
await db.insert(organizations).values({
  id: organization.id,
  name: organization.name,
}).onConflictDoUpdate({
  target: organizations.id,
  set: { name: organization.name, updatedAt: new Date() },
});

// Insert/update user
await db.insert(users).values({
  id: workosUser.id,
  email: workosUser.email,
  firstName: workosUser.firstName,
  lastName: workosUser.lastName,
  selectedOrganizationId: organization.id,
}).onConflictDoUpdate({
  target: users.id,
  set: {
    email: workosUser.email,
    firstName: workosUser.firstName,
    lastName: workosUser.lastName,
    updatedAt: new Date(),
  },
});

// Insert membership
await db.insert(organizationMembers).values({
  userId: workosUser.id,
  organizationId: organization.id,
  role: 'owner',
}).onConflictDoNothing();
```

### 7. Store Outreach Connection

```typescript
await db.insert(outreachConnections).values({
  userId: workosUser.id,
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
  data: {
    outreachUserId: outreachUser.id,
    outreachEmail: outreachUser.email,
    defaultMailboxId: undefined, // Fetch later
    onboardingCompleted: false,
    campaignsCreated: 0,
  },
}).onConflictDoUpdate({
  target: outreachConnections.userId,
  set: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    updatedAt: new Date(),
  },
});
```

### 8. Send Magic Link Email

Send a magic link to the user's email for passwordless authentication:

```typescript
import { workos } from '@/lib/workos';

// Send magic link email
await workos.userManagement.sendMagicAuthCode({
  email: outreachUser.email,
});
```

### 9. Redirect to "Check Your Email" Page

```typescript
redirect('/onboarding/check-email');
```

The user will:
1. See a "Check your email" page with instructions
2. Click the magic link in their email
3. Be authenticated and redirected to the dashboard

---

# Flow B: Direct Signup (Existing)

This flow already exists in the codebase. Users:

1. Visit outr.ai
2. Are redirected to WorkOS AuthKit for signup/login
3. Land on dashboard with "Connect Outreach" prompt
4. Click to initiate Outreach OAuth
5. Approve and get redirected back
6. Outreach connection is stored

**No changes needed for this flow.**

---

# Implementation Details

## New Files to Create

### `/app/api/outreach/install/route.ts`

Main entry point for Outreach marketplace installation.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exchangeOutreachCode } from '@/lib/outreach-auth';
import { workos } from '@/lib/workos';
import { db } from '@/lib/db';
import { users, organizations, organizationMembers, outreachConnections } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Outreach OAuth error:', error);
    return NextResponse.redirect(new URL('/onboarding/error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/onboarding/error?reason=no_code', request.url));
  }

  try {
    // Step 1: Exchange code for tokens
    const tokens = await exchangeOutreachCode(code);

    // Step 2: Get user info from Outreach
    const outreachUser = await fetchOutreachCurrentUser(tokens.accessToken);

    // Step 3: Check for existing Outreach connection (duplicate detection)
    const [existingConnection] = await db
      .select()
      .from(outreachConnections)
      .where(
        sql`${outreachConnections.data}->>'outreachUserId' = ${outreachUser.id.toString()}`
      )
      .limit(1);

    const isTransfer = !!existingConnection;

    // Step 4: Check for existing user by email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, outreachUser.email))
      .limit(1);

    let workosUserId: string;
    let workosOrgId: string;
    let isNewUser = false;

    if (existingUser) {
      // Existing user - just link/update Outreach connection
      workosUserId = existingUser.id;
      workosOrgId = existingUser.selectedOrganizationId!;
    } else {
      // New user - create in WorkOS
      isNewUser = true;
      const { userId, orgId } = await createWorkosUserAndOrg(outreachUser);
      workosUserId = userId;
      workosOrgId = orgId;

      // Sync to local DB
      await syncUserToLocalDb(workosUserId, workosOrgId, outreachUser);
    }

    // Step 5: Store/transfer Outreach connection
    await storeOutreachConnection(workosUserId, tokens, outreachUser);

    // Step 6: Send magic link email
    await workos.userManagement.sendMagicAuthCode({
      email: outreachUser.email,
    });

    // Step 7: Redirect to check-email page with context
    const checkEmailUrl = new URL('/onboarding/check-email', request.url);
    checkEmailUrl.searchParams.set('email', outreachUser.email);
    if (isTransfer) {
      checkEmailUrl.searchParams.set('transferred', 'true');
    }
    if (isNewUser) {
      checkEmailUrl.searchParams.set('new', 'true');
    }

    return NextResponse.redirect(checkEmailUrl);

  } catch (error) {
    console.error('Installation error:', error);
    return NextResponse.redirect(new URL('/onboarding/error', request.url));
  }
}

async function fetchOutreachCurrentUser(accessToken: string) {
  const response = await fetch('https://api.outreach.io/api/v2/users', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Outreach user: ${response.status}`);
  }

  const data = await response.json();
  // The authenticated user should be in the response
  // May need to filter by checking tokens or use a different endpoint
  const user = data.data[0];

  return {
    id: parseInt(user.id),
    email: user.attributes.email,
    firstName: user.attributes.firstName || '',
    lastName: user.attributes.lastName || '',
  };
}

async function createWorkosUserAndOrg(outreachUser: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  // Create organization
  const org = await workos.organizations.createOrganization({
    name: outreachUser.firstName
      ? `${outreachUser.firstName}'s Organization`
      : `Organization`,
  });

  // Create user with email verified (we trust Outreach)
  const user = await workos.userManagement.createUser({
    email: outreachUser.email,
    firstName: outreachUser.firstName,
    lastName: outreachUser.lastName,
    emailVerified: true,
  });

  // Create membership
  await workos.userManagement.createOrganizationMembership({
    userId: user.id,
    organizationId: org.id,
    roleSlug: 'member', // or 'admin' based on your role setup
  });

  return { userId: user.id, orgId: org.id };
}

async function syncUserToLocalDb(
  userId: string,
  orgId: string,
  outreachUser: { email: string; firstName: string; lastName: string }
) {
  // Sync organization
  await db.insert(organizations).values({
    id: orgId,
    name: `${outreachUser.firstName}'s Organization`,
  }).onConflictDoNothing();

  // Sync user
  await db.insert(users).values({
    id: userId,
    email: outreachUser.email,
    firstName: outreachUser.firstName,
    lastName: outreachUser.lastName,
    selectedOrganizationId: orgId,
  }).onConflictDoNothing();

  // Sync membership
  await db.insert(organizationMembers).values({
    userId,
    organizationId: orgId,
    role: 'owner',
  }).onConflictDoNothing();
}

async function storeOutreachConnection(
  userId: string,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number },
  outreachUser: { id: number; email: string }
) {
  // Delete any existing connection for this Outreach user (transfer scenario)
  await db.delete(outreachConnections).where(
    sql`${outreachConnections.data}->>'outreachUserId' = ${outreachUser.id.toString()}`
  );

  // Insert new connection (or update if user already had a different Outreach account)
  await db.insert(outreachConnections).values({
    userId,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    data: {
      outreachUserId: outreachUser.id,
      outreachEmail: outreachUser.email,
      onboardingCompleted: false,
      campaignsCreated: 0,
    },
  }).onConflictDoUpdate({
    target: outreachConnections.userId,
    set: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      data: {
        outreachUserId: outreachUser.id,
        outreachEmail: outreachUser.email,
        onboardingCompleted: false,
        campaignsCreated: 0,
      },
      updatedAt: new Date(),
    },
  });
}
```

### `/app/onboarding/check-email/page.tsx`

Success page shown after installation, prompting user to check their email.

```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EnvelopeSimple, CheckCircle, Warning } from '@phosphor-icons/react/dist/ssr';

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string; transferred?: string; new?: string };
}) {
  const email = searchParams.email || 'your email';
  const isTransfer = searchParams.transferred === 'true';
  const isNewUser = searchParams.new === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <EnvelopeSimple className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Click the link in your email to sign in to Outr.
            The link will expire in 10 minutes.
          </p>

          {isNewUser && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-300">
                  Account created successfully!
                </p>
                <p className="text-green-700 dark:text-green-400">
                  Your Outreach account has been connected.
                </p>
              </div>
            </div>
          )}

          {isTransfer && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Warning className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  Outreach connection transferred
                </p>
                <p className="text-yellow-700 dark:text-yellow-400">
                  This Outreach account was previously connected to another Outr user.
                  It has been transferred to your account.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button className="text-blue-600 hover:underline">
                resend the link
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### `/app/onboarding/error/page.tsx`

Error page for failed installations.

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default function InstallErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const messages: Record<string, string> = {
    no_code: 'No authorization code received from Outreach.',
    default: 'Something went wrong during installation. Please try again.',
  };

  const message = messages[searchParams.reason || 'default'] || messages.default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <WarningCircle className="h-5 w-5" />
            Installation Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{message}</p>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
            <Link href="/connect-outreach">
              <Button>Try Again</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

# Routes

All routes are defined in `apps/main/lib/routes.ts`.

## Onboarding Pages

| Route | Purpose |
|-------|---------|
| `/onboarding/onboarding/check-email` | Magic link confirmation (after marketplace install) |
| `/onboarding/welcome` | Welcome screen (first login, both flows) |
| `/onboarding/connect-outreach` | Connect Outreach OAuth (direct signup flow) |
| `/onboarding/mailbox` | Select default sending mailbox |
| `/onboarding/error` | Error handling for failed installations |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/outreach/install` | GET | Outreach marketplace OAuth callback (new users) |
| `/api/outreach/callback` | GET | Existing flow for "Connect Outreach" button |

---

# Environment Variables

Add/update the following:

```bash
# Outreach OAuth (existing)
OUTREACH_CLIENT_ID=your_client_id
OUTREACH_CLIENT_SECRET=your_client_secret
OUTREACH_REDIRECT_URI=https://outr.ai/api/outreach/callback

# NEW: Separate redirect URI for marketplace installs
OUTREACH_INSTALL_REDIRECT_URI=https://outr.ai/api/outreach/install

# WorkOS (existing)
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
```

**Note:** You may need to register two redirect URIs with Outreach:
1. `/api/outreach/callback` - for existing users connecting Outreach
2. `/api/outreach/install` - for marketplace installations

---

# Security Considerations

## 1. CSRF Protection

The Outreach OAuth flow supports a `state` parameter. Use it:

```typescript
const state = crypto.randomUUID();
// Store in cookie or session
const authUrl = await getOutreachAuthUrl(state);
```

On callback, verify the state matches.

## 2. Token Storage

- Access tokens and refresh tokens are stored encrypted in the database
- Consider adding encryption at rest for sensitive fields

## 3. Email Verification

- We mark users as `emailVerified: true` because Outreach has already verified them
- This is a reasonable trust assumption for marketplace installs

## 4. Existing User Detection

- Check by email to prevent duplicate accounts
- If email exists but user installed from marketplace, link the Outreach connection

---

# Testing Guide

## Flow A: Marketplace Installation

### Happy Path

1. [ ] Navigate to Outreach marketplace (or simulate OAuth redirect)
2. [ ] Click "Install" on Outr app
3. [ ] Approve OAuth permissions
4. [ ] Verify redirect to `/api/outreach/install`
5. [ ] Verify WorkOS organization created
6. [ ] Verify WorkOS user created
7. [ ] Verify local DB records created (users, organizations, organization_members)
8. [ ] Verify outreach_connections record created
9. [ ] Verify user is logged in and lands on dashboard
10. [ ] Verify dashboard shows Outreach connected (no "Connect Outreach" prompt)

### Existing User Scenario

1. [ ] Create account via direct signup (Flow B)
2. [ ] Do NOT connect Outreach
3. [ ] Simulate marketplace install with same email
4. [ ] Verify no duplicate user created
5. [ ] Verify Outreach connection added to existing user
6. [ ] Verify user can access dashboard with Outreach features

### Error Scenarios

1. [ ] User denies OAuth permissions → redirect to error page
2. [ ] Invalid/expired code → redirect to error page
3. [ ] Outreach API failure → redirect to error page with retry option

## Flow B: Direct Signup (Existing)

No changes needed - verify existing tests still pass.

---

# Design Decisions

## 1. Authentication After Installation (Magic Link)

**Decision:** Do NOT create sessions programmatically. Instead, use WorkOS magic link authentication.

**Flow:**
1. After Outreach OAuth completes and WorkOS user is created
2. Automatically send a magic link to the user's email
3. Show a "Check your email" UI page
4. User clicks magic link → authenticated session created → redirect to dashboard

**Why not invitations?** Invitations require the user to set up their account (choose password, etc.). Magic links are frictionless since we already have their verified email from Outreach.

**Implementation:**
```typescript
// After creating WorkOS user, send magic link
await workos.userManagement.sendMagicAuthCode({
  email: outreachUser.email,
});

// Redirect to "check your email" page
return NextResponse.redirect(new URL('/onboarding/check-email', request.url));
```

**References:**
- [WorkOS Create User](https://workos.com/docs/reference/authkit/user/create)
- [WorkOS Send Invitation](https://workos.com/docs/reference/authkit/invitation/send)

---

## 2. Fetching Current Outreach User

**Decision:** Use `GET /users` endpoint and identify the authenticated user.

The Outreach API returns users the authenticated token has access to. For a newly installed app, this should return the installing user's information.

**Implementation:**
```typescript
async function fetchOutreachCurrentUser(accessToken: string) {
  // First, try to get user list - the authenticated user should be accessible
  const response = await fetch('https://api.outreach.io/api/v2/users', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Outreach user: ${response.status}`);
  }

  const data = await response.json();

  // The first user in the response should be the authenticated user
  // Alternative: filter by email if we can decode the token
  const user = data.data[0];

  return {
    id: parseInt(user.id),
    email: user.attributes.email,
    firstName: user.attributes.firstName || '',
    lastName: user.attributes.lastName || '',
  };
}
```

**Reference:** [Outreach User API](https://developers.outreach.io/api/reference/tag/User/#tag/User/paths/~1users~1{id}/get)

---

## 3. Organization Naming

**Decision:** Use user's first name: `"{FirstName}'s Organization"`

- Default: "Jane's Organization"
- Fallback (no first name): "My Organization"
- Editable later in Outr dashboard settings

---

## 4. Duplicate Outreach Connections

**Decision:** Transfer the connection to the new user, with warning messaging.

**Scenario:** User A has Outreach account X connected. User B installs from marketplace with the same Outreach account X.

**Behavior:**
1. Detect existing connection for this Outreach user ID
2. Show warning: "This Outreach account is currently connected to another Outr user. Continuing will transfer the connection."
3. If user confirms, transfer the connection (update `userId` on the `outreach_connections` record)
4. Previous user loses Outreach access in Outr (they see "Connect Outreach" prompt again)

**Implementation:**
```typescript
// Check for existing Outreach connection by Outreach user ID
const existingConnection = await db
  .select()
  .from(outreachConnections)
  .where(
    sql`${outreachConnections.data}->>'outreachUserId' = ${outreachUser.id.toString()}`
  )
  .limit(1);

if (existingConnection.length > 0 && existingConnection[0].userId !== workosUserId) {
  // Connection exists for different user - will be transferred
  // Store flag to show warning on next page
}
```

**UI Flow:**
- For marketplace installs: Show transfer warning on the "check your email" page
- For "Connect Outreach" button: Show confirmation dialog before proceeding
