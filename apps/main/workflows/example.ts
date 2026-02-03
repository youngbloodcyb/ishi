/**
 * Example Vercel Workflow
 *
 * This file demonstrates the workflow directive patterns used in Vercel Workflows.
 * Workflows enable durable, long-running processes that can survive restarts.
 *
 * Key patterns:
 * - "use workflow" - Marks a function as a workflow entry point
 * - "use step" - Marks a function as a durable step (will retry on failure)
 */

export interface ExampleWorkflowParams {
  itemId: string;
  userId: string;
}

export interface ExampleWorkflowResult {
  success: boolean;
  processedAt: string;
}

/**
 * Example workflow that processes an item.
 * Replace this with your actual workflow logic.
 */
export async function workflowExample(
  params: ExampleWorkflowParams
): Promise<ExampleWorkflowResult> {
  "use workflow";

  const { itemId, userId } = params;

  // Step 1: Validate input
  await stepValidate(itemId, userId);

  // Step 2: Process the item
  const result = await stepProcess(itemId);

  // Step 3: Notify completion
  await stepNotify(userId, result);

  return {
    success: true,
    processedAt: new Date().toISOString(),
  };
}

const stepValidate = async (itemId: string, userId: string): Promise<void> => {
  "use step";

  if (!itemId || !userId) {
    throw new Error("Missing required parameters");
  }

  // Add your validation logic here
  console.log(`Validating item ${itemId} for user ${userId}`);
};

const stepProcess = async (itemId: string): Promise<string> => {
  "use step";

  // Add your processing logic here
  console.log(`Processing item ${itemId}`);

  return `Processed: ${itemId}`;
};

const stepNotify = async (userId: string, result: string): Promise<void> => {
  "use step";

  // Add your notification logic here
  console.log(`Notifying user ${userId}: ${result}`);
};
