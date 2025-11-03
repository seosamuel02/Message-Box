'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abiJson from '@/lib/contractABI.json'
import { contractAddress } from '@/lib/constants'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)

  const connectAndLoad = async () => {
    if (!window.ethereum) return alert('🦊 MetaMask를 설치해주세요!')

    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      setAccount(addr)

      const contract = new ethers.Contract(contractAddress, abiJson.abi, signer)
      const data = await contract.getMessages()
      const count = await contract.getMessageCount()
      setMessageCount(Number(count))
      setMessages(data.reverse())
    } catch (error) {
      console.error(error)
      alert('연결 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const postMessage = async () => {
    if (!input.trim()) return alert('메시지를 입력해주세요!')
    if (!window.ethereum) return

    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abiJson.abi, signer)
      const tx = await contract.postMessage(input)
      await tx.wait()
      setInput('')
      await connectAndLoad()
    } catch (error) {
      console.error(error)
      alert('메시지 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString('ko-KR')
  }

  useEffect(() => {
    connectAndLoad()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📜 Message Board DApp
            </h1>
          </div>
          <p className="text-lg text-gray-700 font-medium">92113669 서동민</p>
          <p className="text-sm text-gray-500 mt-1">Sepolia Testnet</p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
            <p className="text-sm text-gray-600 mb-1">Total Messages</p>
            <p className="text-3xl font-bold text-blue-600">{messageCount}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
            <p className="text-sm text-gray-600 mb-1">Connected Account</p>
            <p className="text-sm font-mono text-purple-600 truncate">
              {account ? formatAddress(account) : 'Not Connected'}
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">✍️ Write a Message</h2>
          <div className="space-y-4">
            <textarea
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
              placeholder="Share your thoughts on the blockchain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              disabled={loading}
            />
            <button
              onClick={postMessage}
              disabled={loading || !input.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Processing...' : '📤 Post Message'}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💬 Messages
            <span className="text-sm font-normal text-gray-500">({messages.length})</span>
          </h2>

          {loading && messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📭</p>
              <p>No messages yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {m.sender.slice(2, 4).toUpperCase()}
                      </div>
                      <span className="font-mono text-sm text-gray-600">
                        {formatAddress(m.sender)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(m.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800 ml-10 break-words">{m.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 inline-block">
            <p className="text-xs text-gray-600 mb-2">Contract Address</p>
            <code className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
              {contractAddress}
            </code>
          </div>
        </div>
      </div>
    </main>
  )
}
