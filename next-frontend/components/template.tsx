import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
const inter = Inter({ subsets: ['latin'] })
import type { AppProps } from 'next/app'


export default ( { children }: React.PropsWithChildren<{}> ) => {
    return (
        <>
      <Head>
        <title>Dapp - Decentralized University</title>
        <meta name="description" content="Decentralized University Dapp" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
            { children }
        </div>

        {/* <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div> */}
      </main>
    </>
    )
}