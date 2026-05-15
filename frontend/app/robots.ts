import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/score/", "/api/"],
      },
    ],
    sitemap: "https://mcqpalagu.in/sitemap.xml",
  };
}
