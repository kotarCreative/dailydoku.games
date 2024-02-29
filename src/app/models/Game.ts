import { z } from "zod";

const Game = z.object({
  uuid: z.string(),
  name: z.string(),
  type: z.string(),
  url: z.string(),
  backgroundImage: z.string(),
  description: z.string()
})

export type IGame = z.infer<typeof Game>;
export default Game;
