'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abiJson from '@/lib/contractABI.json'
import { contractAddress } from '@/lib/constants'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [account, setAccount] = useState('')

  const connectAndLoad = async () => {
    if (!window.ethereum) return alert('🦊 MetaMask가 필요합니다!')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const addr = await signer.getAddress()
    setAccount(addr)

    const contract = new ethers.Contract(contractAddress, abiJson.abi, signer)
    const data = await contract.getMessages()
    setMessages(data.map((m: any) => `${m.sender.slice(0, 6)}...: ${m.text}`))
  }

  const postMessage = async () => {
    if (!window.ethereum) return
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abiJson.abi, signer)
    const tx = await contract.postMessage(input)
    await tx.wait()
    setInput('')
    connectAndLoad()
  }

  useEffect(() => {
    connectAndLoad()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">📜 Message Board DApp</h1>
        <p className="text-center text-gray-600 mb-6">92113669 서동민</p>

        <div className="text-sm mb-4 text-gray-500">
          연결된 계정: {account ? account.slice(0, 10) + '...' : '지갑 연결 필요'}
        </div>

        <input
          className="border w-full p-2 rounded mb-3"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={postMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          메시지 등록
        </button>

        <div className="mt-6">
          <h2 className="font-semibold mb-2">게시된 메시지</h2>
          <ul className="space-y-1">
            {messages.map((m, i) => (
              <li key={i} className="border-b pb-1 text-sm text-gray-700">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
