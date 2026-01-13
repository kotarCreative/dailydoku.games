import { z } from "zod";

const Game = z.object({
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  url: z.string(),
  logo: z.string(),
  description: z.string()
})

export type IGame = z.infer<typeof Game>;
export default Game;
