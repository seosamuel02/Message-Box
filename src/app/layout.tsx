import './globals.css'
export const metadata = { title: 'Message Board', description: 'Simple Web3 DApp' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
