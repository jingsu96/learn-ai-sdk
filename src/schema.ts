import z from "zod";

export const schema = z.object({
  coach: z.object({
    title: z.string().describe("The title of the step-by-step guide"),
    description: z
      .string()
      .describe("Brief overview of what will be accomplished"),
    estimated_time: z
      .string()
      .optional()
      .describe("Estimated time to complete all steps"),
    steps: z.array(
      z.object({
        step_number: z.number().describe("The sequential number of this step"),
        name: z.string().describe("The name/title of the step"),
        action: z.string().describe("The specific action to take in this step"),
        details: z
          .string()
          .optional()
          .describe("Additional details or explanations"),
        tips: z
          .string()
          .optional()
          .describe("Helpful tips or warnings for this step"),
        expected_outcome: z
          .string()
          .optional()
          .describe("What should be achieved by completing this step"),
      }),
    ),
    checkpoints: z.array(
      z.object({
        milestone: z.string().describe("The milestone being checked"),
        verification: z
          .string()
          .describe("How to verify this milestone is complete"),
        troubleshooting: z
          .string()
          .optional()
          .describe("Common issues and solutions"),
      }),
    ),
    materials_needed: z
      .array(z.string())
      .optional()
      .describe("List of materials or tools required"),
    prerequisites: z
      .array(z.string())
      .optional()
      .describe("What the user should know or have before starting"),
  }),
});

export const fileSchema = z.object({
  fileMeta: z.object({
    size: z.number(),
    type: z.string(),
    totalPage: z.number(),
  }),
  fileDescription: z.string(),
});
