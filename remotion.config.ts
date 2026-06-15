import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Higher quality output for crisp text/charts on social.
Config.setConcurrency(null);
