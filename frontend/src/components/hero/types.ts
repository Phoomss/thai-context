export type HeroState = "idle" | "opening" | "zooming" | "flash" | "completed";
/** Engine-independent values: the single DOM orchestrator owns these. */
export type Cinema = {
  ambient: number;
  cover: number;
  dolly: number;
  scale: number;
  light: number;
  bloom: number;
};
export const initialCinema = (): Cinema => ({
  ambient: 1,
  cover: 0,
  dolly: 0,
  scale: 1,
  light: 1,
  bloom: 0,
});
