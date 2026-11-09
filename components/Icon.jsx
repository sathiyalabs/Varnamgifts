const paths = {
  gift: "M3 8h18v4H3zM5 12v9h14v-9M12 8v13m0-13H8.5A2.5 2.5 0 1 1 11 5.5L12 8Zm0 0h3.5A2.5 2.5 0 1 0 13 5.5L12 8Z",
  search: "M20 20l-4.2-4.2M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M18 6 6 18",
  down: "m6 9 6 6 6-6",
  left: "m14 6-6 6 6 6",
  right: "m10 6 6 6-6 6",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  chat: "M4 20l1.2-4A8.5 8.5 0 1 1 8 19l-4 1Zm5-12c-.7.3-.8 1.5-.2 2.5 1.1 1.9 3 3.4 4.9 3.7.9.2 2-.4 2.1-1.2l-2-1-1 .9a5 5 0 0 1-2.4-2.4l.7-.9-1-2.1Z",
};
export default function Icon({ name, size = 20 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
