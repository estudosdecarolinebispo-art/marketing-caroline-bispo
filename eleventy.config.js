import { readdirSync } from "node:fs";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/css/style.css": "style.css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css/legal.css": "legal.css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js/script.js": "script.js" });
  for (const image of readdirSync("src/images", { withFileTypes: true })) {
    if (image.isFile() && !image.name.startsWith(".")) {
      eleventyConfig.addPassthroughCopy({ [`src/images/${image.name}`]: `images/${image.name}` });
    }
  }
  eleventyConfig.addPassthroughCopy({ "src/static/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/static/.nojekyll": ".nojekyll" });
  eleventyConfig.addPassthroughCopy({ "src/static/site.webmanifest": "site.webmanifest" });
  eleventyConfig.addPassthroughCopy({ "src/static/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/static/favicon-16x16.png": "favicon-16x16.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/favicon-32x32.png": "favicon-32x32.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/android-chrome-192x192.png": "android-chrome-192x192.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/android-chrome-512x512.png": "android-chrome-512x512.png" });

  eleventyConfig.ignores.add("src/drafts/**");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk"
  };
}
