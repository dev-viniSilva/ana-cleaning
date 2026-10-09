/**
 * Hero motion asset for the Ana's Care Cleaning site.
 * Photos are read straight from the site's optimized image folder so there is a single source of truth.
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicDir("../img/opt");
