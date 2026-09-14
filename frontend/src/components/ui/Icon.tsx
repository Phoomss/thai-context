import type { CSSProperties } from "react";
const paths = {
  search: "M21 21l-5-5M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13",
  volume: "M11 4 6 8H3v8h3l5 4V4m4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  pause: "M8 5v14M16 5v14",
  play: "m8 4 12 8-12 8V4Z",
  share: "M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8",
  copy: "M8 8h12v12H8V8M16 8V3H3v13h5",
  book: "M12 5v15M12 5C8 2 5 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-2-10 1",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  close: "m6 6 12 12M6 18 18 6",
  compare: "M8 3v18M16 3v18M3 8h10M11 16h10",
  source: "M5 3h10l4 4v14H5V3m10 0v5h4M8 12h8M8 16h6",
};
export default function Icon({ name, style }: { name: keyof typeof paths; style?: CSSProperties }) {
  return <svg style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
