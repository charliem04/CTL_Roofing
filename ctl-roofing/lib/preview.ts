/**
 * ════════════════════════════════════════════════════════════════════
 *  PREVIEW MODE — the build that goes on a temporary URL.
 *
 *  This site is a working replica of a real company: real phone
 *  numbers, real address, real photographs of real jobs, real reviews
 *  by named people. That is the point of the pitch, and it is exactly
 *  what makes putting it on a public URL different from putting up a
 *  mockup.
 *
 *  Three things could go wrong, in rough order of how much they would
 *  cost CTL:
 *
 *  1. A stranger finds it and believes it is CTL's website. They ring
 *     the number on it — which is CTL's real number — and CTL's office
 *     answers a call from a site they have never seen. Or they fill in
 *     the form and nobody ever calls them back, because a preview build
 *     has no form key configured. The banner is the answer to this one:
 *     the page says what it is, on every page, without being dismissed.
 *  2. Google indexes it and it competes with ctlpro.com — the same
 *     business name, address and phone on two domains is the textbook
 *     way to confuse a local listing. noindex, nofollow, a robots.txt
 *     that disallows everything, and an X-Robots-Tag header, because
 *     any one of the three can be missed and they cost nothing.
 *  3. It quietly stays up for a year after the conversation ends.
 *     Nothing in code fixes that. Take it down.
 *
 *  Set NEXT_PUBLIC_PREVIEW=1 for that build. Unset — a normal
 *  production build — every one of these is inert.
 * ════════════════════════════════════════════════════════════════════
 */

/** Is this the temporary-URL build? */
export const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

/**
 * Where somebody who landed here by mistake should actually go. Their
 * real site, not ours.
 */
export const REAL_SITE = "https://www.ctlpro.com";
