import { z } from "zod";

const Game = z.object({
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  url: z.string(),
  logo: z.string(),
  description: z.string(),
  /** Long-form editorial copy rendered on the game page; optional for older entries. */
  about: z.string().optional()
})

export type IGame = z.infer<typeof Game>;
export default Game;
