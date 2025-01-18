import { useState, useEffect } from 'react'

export default function SubscriberTable() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/subscribers/')
        const data = await response.json()
        setSubscribers(data.data || [])
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch subscribers')
        setLoading(false)
      }
    }

    fetchSubscribers()
  }, [])

  if (loading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subscriber Analytics</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts Received</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Clicks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Clicks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{subscriber.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subscriber.stats?.total_received || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(subscriber.stats?.open_rate || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(subscriber.stats?.click_rate || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{subscriber.stats?.total_clicked || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subscriber.stats?.total_unique_clicked || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
