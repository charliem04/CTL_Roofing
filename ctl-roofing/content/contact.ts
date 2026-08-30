import type { CtaCopy, PageMeta, Photo } from "./types";

export const contactPage = {
  meta: {
    title: "Contact — Book A Free Roof & Property Assessment",
    description:
      "Call, text or book a free roof and property assessment with CTL Pro Construction. Office and around-the-clock storm line, Lafayette showroom address and hours.",
    path: "/contact/",
  } satisfies PageMeta,

  heading: "Talk to us",
  lede: "Three ways in, and they all end the same place: someone from CTL standing on your roof telling you what is actually going on with it.",

  photo: {
    src: "/ctl/office.jpg",
    alt: "The CTL office in Lafayette, with staff at their desks",
    width: 1000,
    height: 1333,
  } satisfies Photo,

  booking: {
    heading: "Pick your own time",
    lede: "The assessment slots are on the calendar. Choose one and we'll confirm by text — no phone tag.",
  },

  cta: {
    heading: "Water coming in right now?",
    body: "The storm line is answered around the clock. Everything else on this page can wait until morning; that cannot.",
  } satisfies CtaCopy,
};
