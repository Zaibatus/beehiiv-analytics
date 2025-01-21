import React, { useState, useEffect, useRef } from 'react'

export default function SubscriberTable() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  })
  
  // New filter states
  const [filters, setFilters] = useState({
    status: 'all',
    sourceChannel: 'all'
  })

  // Add after other state declarations
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    status: true,
    source_channel: true,
    posts: true,
    opens: true,
    clicks: true,
    total_clicks: true,
    unique_clicks: true
  });

  // Add column configuration object
  const columnConfig = {
    email: { label: 'Email', key: 'email', width: '20%' },
    status: { label: 'Status', key: 'status', width: '10%' },
    source_channel: { label: 'Source / Channel', key: 'utm_data', width: '20%' },
    posts: { label: 'Posts', key: 'stats.total_received', width: '10%' },
    opens: { label: 'Open Rate', key: 'stats.open_rate', width: '10%' },
    clicks: { label: 'Click Rate', key: 'stats.click_rate', width: '10%' },
    total_clicks: { label: 'Total Clicks', key: 'stats.total_clicked', width: '10%' },
    unique_clicks: { label: 'Unique Clicks', key: 'stats.total_unique_clicked', width: '10%' },
    days_to_unsubscribe: { label: 'Days to Unsubscribe', key: 'days_to_unsubscribe', width: '10%' }
  };

  // Add toggle function
  const toggleColumn = (columnId) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  // Add this inside the component, after other state declarations
  const dropdownRef = useRef(null);

  // Add this useEffect to handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsColumnMenuOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (isColumnMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColumnMenuOpen]);

  const [stats, setStats] = useState({
    total_subscribers: 0,
    active_subscribers: 0,
    percent_clicked_once: 0,
    subscribers_clicked: 0
  });

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/subscribers/')
        const data = await response.json()
        console.log("Fetched subscribers data:", data)
        setSubscribers(data.subscribers || [])
        
        // Calculate active subscribers
        const activeCount = data.subscribers.filter(sub => sub.status === 'active').length;
        
        setStats({
          total_subscribers: data.total_subscribers || 0,
          active_subscribers: activeCount,
          percent_clicked_once: data.percent_clicked_once || 0,
          subscribers_clicked: Math.round((data.percent_clicked_once * data.total_subscribers) / 100)
        })
        setLoading(false)
      } catch (err) {
        console.error('Error fetching subscribers:', err)
        setError('Failed to fetch subscribers')
        setLoading(false)
      }
    }

    fetchSubscribers()
  }, [])

  const sortData = (data, key) => {
    if (!key) return data

    return [...data].sort((a, b) => {
      let aValue, bValue

      if (key === 'utm_data') {
        aValue = `${a.utm_source || ''}/${a.utm_channel || ''}`
        bValue = `${b.utm_source || ''}/${b.utm_channel || ''}`
      } else if (key.includes('stats')) {
        aValue = a.stats?.[key.split('.')[1]] || 0
        bValue = b.stats?.[key.split('.')[1]] || 0
      } else {
        aValue = a[key] || ''
        bValue = b[key] || ''
      }

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

  const getUtmInfo = (subscriber) => {
    const source = subscriber.utm_source || '-'
    const channel = subscriber.utm_channel || '-'
    return `${source} / ${channel}`
  }

  const getStatusBadge = (status) => {
    const isActive = status === 'active'
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'active' : 'inactive'}
      </span>
    )
  }

  // Get unique source/channel combinations
  const getUniqueSourceChannels = (data) => {
    const combinations = new Set(data.map(sub => 
      `${sub.utm_source || '-'}/${sub.utm_channel || '-'}`
    ))
    return ['all', ...Array.from(combinations)]
  }

  // Filter function
  const filterSubscribers = (data) => {
    return data.filter(subscriber => {
      // Status filter
      if (filters.status !== 'all') {
        const isActive = subscriber.status === 'active'
        const filterIsActive = filters.status === 'active'
        if (isActive !== filterIsActive) {
          return false
        }
      }

      // Source/Channel filter
      if (filters.sourceChannel !== 'all') {
        const subSourceChannel = `${subscriber.utm_source || '-'}/${subscriber.utm_channel || '-'}`
        if (subSourceChannel !== filters.sourceChannel) {
          return false
        }
      }

      return true
    })
  }

  if (loading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-pink-600">Subscriber Analytics</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-pink-100">
          <h3 className="text-sm font-medium text-gray-500">Total Subscribers</h3>
          <p className="text-2xl font-bold text-pink-600">{stats.total_subscribers}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-pink-100">
          <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
          <p className="text-2xl font-bold text-pink-600">{stats.active_subscribers}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-pink-100">
          <h3 className="text-sm font-medium text-gray-500">Subscribers Who Clicked</h3>
          <p className="text-2xl font-bold text-pink-600">
            {stats.subscribers_clicked} 
            <span className="text-sm text-pink-400 ml-1">
              ({stats.percent_clicked_once.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4 bg-pink-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-pink-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
              className="w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-4 py-2 bg-white text-left text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Source/Channel Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-pink-700 mb-1">Source / Channel</label>
            <select
              value={filters.sourceChannel}
              onChange={(e) => setFilters(prev => ({...prev, sourceChannel: e.target.value}))}
              className="w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-4 py-2 bg-white text-left text-sm"
            >
              {getUniqueSourceChannels(subscribers).map(combo => (
                <option key={combo} value={combo}>{combo}</option>
              ))}
            </select>
          </div>

          {/* Column Visibility Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-pink-700 mb-1">Visible Columns</label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 px-4 py-2 bg-white text-left text-sm flex justify-between items-center"
              >
                Customize Columns
                <span className="ml-2">↓</span>
              </button>
              
              {isColumnMenuOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-pink-100">
                  <div className="p-2 space-y-1">
                    {Object.entries(columnConfig).map(([id, config]) => (
                      <label key={id} className="flex items-center p-2 hover:bg-pink-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns[id]}
                          onChange={() => toggleColumn(id)}
                          className="rounded border-pink-300 text-pink-600 focus:ring-pink-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{config.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Updated table container */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-fixed bg-white">
          <thead className="bg-pink-200">
            <tr>
              {Object.entries(columnConfig).map(([id, config]) => 
                visibleColumns[id] && (
                  <th 
                    key={id}
                    onClick={() => handleSort(config.key)}
                    className={`${config.width} px-4 py-3 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider cursor-pointer hover:bg-pink-300`}
                  >
                    {config.label} {sortConfig.key === config.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-200">
            {sortData(filterSubscribers(subscribers), sortConfig.key).map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-pink-50">
                {visibleColumns.email && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{subscriber.email}</td>
                )}
                {visibleColumns.status && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{getStatusBadge(subscriber.status)}</td>
                )}
                {visibleColumns.source_channel && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{getUtmInfo(subscriber)}</td>
                )}
                {visibleColumns.posts && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{subscriber.stats?.total_received || 0}</td>
                )}
                {visibleColumns.opens && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{(subscriber.stats?.open_rate || 0).toFixed(1)}%</td>
                )}
                {visibleColumns.clicks && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{(subscriber.stats?.click_rate || 0).toFixed(1)}%</td>
                )}
                {visibleColumns.total_clicks && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{subscriber.stats?.total_clicked || 0}</td>
                )}
                {visibleColumns.unique_clicks && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{subscriber.stats?.total_unique_clicked || 0}</td>
                )}
                {visibleColumns.days_to_unsubscribe && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{subscriber.days_to_unsubscribe ? `${subscriber.days_to_unsubscribe} days` : '-'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
