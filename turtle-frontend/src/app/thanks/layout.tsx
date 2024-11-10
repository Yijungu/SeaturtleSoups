// layout.tsx
import React from "react";
import Head from "next/head"; // Head 모듈을 임포트합니다.
import "../../styles/global.scss";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        {/* AdSense 스크립트 추가 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7324783888267387"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <main>{children}</main>
    </>
  );
};

export default Layout;
