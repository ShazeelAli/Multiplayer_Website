import "styles/global.css";
import Head from "next/head";
export default function App({ Component, pageProps }) {
  return (
    <div style={{ height: "100vh" }}>
      <Head>
        <title>Henry Games</title>
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta name="description" content="Fun Family Party Games" />
        <meta
          name="keywords"
          content="HTML, CSS, JavaScript, NextJS, Games, Party, Family, Worker"
        />
        <meta name="author" content="Shazeel Ali" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}
