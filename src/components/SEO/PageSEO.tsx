"use client";

import Head from "next/head";

interface PageSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
}

/**
 * Page SEO Component
 * ใช้สำหรับแต่ละหน้าที่ต้องการ override SEO
 *
 * @example
 * ```tsx
 * <PageSEO
 *   title="เกี่ยวกับเรา"
 *   description="เรื่องราวของ BJH Bangkok"
 *   canonical="/about"
 * />
 * ```
 */
export default function PageSEO(props: PageSEOProps) {
  const { title, description, canonical, keywords, openGraph } = props;

  return (
    <Head>
      {title && <title>{title} | BJH Bangkok</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && (
        <link rel="canonical" href={`https://app.bjhbangkok.com${canonical}`} />
      )}

      {/* Open Graph */}
      {openGraph?.title && (
        <meta property="og:title" content={openGraph.title} />
      )}
      {openGraph?.description && (
        <meta property="og:description" content={openGraph.description} />
      )}
      {openGraph?.url && <meta property="og:url" content={openGraph.url} />}
      {openGraph?.type && <meta property="og:type" content={openGraph.type} />}
      {openGraph?.images?.[0] && (
        <>
          <meta property="og:image" content={openGraph.images[0].url} />
          {openGraph.images[0].width && (
            <meta
              property="og:image:width"
              content={String(openGraph.images[0].width)}
            />
          )}
          {openGraph.images[0].height && (
            <meta
              property="og:image:height"
              content={String(openGraph.images[0].height)}
            />
          )}
          {openGraph.images[0].alt && (
            <meta property="og:image:alt" content={openGraph.images[0].alt} />
          )}
        </>
      )}
    </Head>
  );
}
