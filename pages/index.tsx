import Head from 'next/head';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), { ssr: false });

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Huahuacuna Frontend</title>
      </Head>
      <App />
    </>
  );
}
