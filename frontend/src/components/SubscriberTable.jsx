import { useState, useEffect } from 'react'

export default function SubscriberTable() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  })

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

  const sortData = (data, key) => {
    if (!key) return data

    return [...data].sort((a, b) => {
      // Handle nested stats object
      let aValue = key.includes('stats') ? 
        a.stats?.[key.split('.')[1]] || 0 : 
        a[key] || 0
      let bValue = key.includes('stats') ? 
        b.stats?.[key.split('.')[1]] || 0 : 
        b[key] || 0

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })
  }

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (loading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-pink-600">Subscriber Analytics</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          {/* Pink header styling */}
          <thead className="bg-pink-200">
            <tr>
              <th 
                onClick={() => handleSort('email')}
                className="px-6 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300"
              >
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('stats.total_received')}
                className="px-6 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300"
              >
                Posts Received {sortConfig.key === 'stats.total_received' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('stats.open_rate')}
                className="px-6 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300"
              >
                Open Rate {sortConfig.key === 'stats.open_rate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('stats.click_rate')}
                className="px-6 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300"
              >
                Click Rate {sortConfig.key === 'stats.click_rate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('stats.total_clicked')}
                className="px-6 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300"
              >
                Total Clicks {sortConfig.key === 'stats.total_clicked' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('stats.total_unique_clicked')}
                className="px-6 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300"
              >
                Unique Clicks {sortConfig.key === 'stats.total_unique_clicked' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-200">
            {sortData(subscribers, sortConfig.key).map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-pink-50">
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
