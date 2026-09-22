import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
  // `npx sanity deploy` puts the studio on <hostname>.sanity.studio.
  studioHost: process.env.SANITY_STUDIO_HOSTNAME,
  deployment: {
    // The deployed studio pulls Sanity's current release at runtime
    // instead of the version that happened to be installed the day it
    // was deployed. For an editor nobody is paid to maintain, a studio
    // that patches itself is worth more than one pinned to a version
    // that will be two years old before anyone notices.
    //
    // The build needs to reach sanity-cdn.com to resolve that version.
    // `npx sanity build --no-auto-updates` builds without it.
    autoUpdates: true,
  },
});
