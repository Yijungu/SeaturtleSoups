import type { Metadata } from "next";
import "../styles/global.scss";

export const metadata: Metadata = {
  title: "바다거북수프 | 재미있는 심리 게임과 이야기",
  description:
    "바다거북수프는 심리와 추리력을 자극하는 재미있는 이야기 게임입니다. 친구들과 함께 문제를 풀어보세요!",
  keywords: [
    "바다거북수프",
    "심리 게임",
    "추리 게임",
    "바다거북 이야기",
    "바다거북 수프 문제",
  ],
  openGraph: {
    title: "바다거북수프 | 재미있는 심리 게임과 이야기",
    description:
      "바다거북수프는 심리와 추리력을 자극하는 재미있는 이야기 게임입니다. 친구들과 함께 문제를 풀어보세요!",
    url: "https://www.seaturtlesoups.com",
    siteName: "바다거북수프",
    images: [
      {
        url: "/images/turtle.png",
        width: 800,
        height: 600,
        alt: "바다거북 수프 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourTwitterHandle",
    title: "바다거북수프 | 재미있는 심리 게임과 이야기",
    description:
      "바다거북수프는 심리와 추리력을 자극하는 재미있는 이야기 게임입니다.",
    images: ["/images/turtle.png"],
  },
};

type OGImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

// 타입 검사 및 안전한 접근
const selectedOgImage = Array.isArray(metadata.openGraph?.images)
  ? (metadata.openGraph.images[0] as OGImage)
  : (metadata.openGraph?.images as OGImage | undefined);

const ogImageUrl = selectedOgImage?.url ?? "/images/default.png";
const ogImageWidth = selectedOgImage?.width
  ? String(selectedOgImage.width)
  : "800";
const ogImageHeight = selectedOgImage?.height
  ? String(selectedOgImage.height)
  : "600";
const ogImageAlt = selectedOgImage?.alt ?? "Default image description";

interface TwitterMetadata {
  card?: string;
  site?: string;
  title?: string;
  description?: string;
  images?: string[];
}

const twitterData = metadata.twitter as TwitterMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" prefix="og: http://ogp.me/ns#">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <title>{String(metadata.title ?? "Default Title")}</title>
        <meta
          name="description"
          content={String(metadata.description ?? "Default description")}
        />
        <meta
          name="keywords"
          content={
            Array.isArray(metadata.keywords)
              ? metadata.keywords.join(", ")
              : String(metadata.keywords ?? "default, keywords")
          }
        />
        <meta
          property="og:site_name"
          content={String(metadata.openGraph?.siteName ?? "바다거북수프")}
        />
        <meta
          property="og:locale"
          content={String(metadata.openGraph?.locale ?? "ko_KR")}
        />
        <meta
          property="og:title"
          content={String(metadata.openGraph?.title ?? "바다거북수프")}
        />
        <meta
          property="og:description"
          content={String(metadata.openGraph?.description ?? "Description")}
        />
        <meta
          property="og:url"
          content={metadata.openGraph?.url?.toString() ?? ""}
        />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content={ogImageWidth} />
        <meta property="og:image:height" content={ogImageHeight} />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta name="twitter:card" content={twitterData.card ?? "summary"} />
        <meta
          name="twitter:site"
          content={String(metadata.twitter?.site ?? "@defaultHandle")}
        />
        <meta
          name="twitter:title"
          content={String(metadata.twitter?.title ?? "Default Twitter Title")}
        />
        <meta
          name="twitter:description"
          content={String(
            metadata.twitter?.description ?? "Default Twitter Description"
          )}
        />
        <meta name="twitter:image" content={twitterData.images?.[0] ?? ""} />

        {/* AdSense 스크립트 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7324783888267387"
          crossOrigin="anonymous"
        ></script>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: metadata.title,
              url: metadata.openGraph?.url,
              potentialAction: {
                "@type": "SearchAction",
                target: `${metadata.openGraph?.url}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
