import { z } from "zod";

const Suggestion = z.object({
  name: z.string(),
  url: z.string(),
})

export type ISuggestion = z.infer<typeof Suggestion>;
export default Suggestion;