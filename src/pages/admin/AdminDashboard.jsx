export default function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin control panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Priests</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="text-4xl">⛪</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Bookings</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">-</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#b87d3e] hover:bg-[#b87d3e]/5 transition-all text-left">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-800">Manage Accounts</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage user accounts</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#b87d3e] hover:bg-[#b87d3e]/5 transition-all text-left">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-800">View Bookings</h3>
              <p className="text-sm text-gray-600 mt-1">Manage service bookings</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#b87d3e] hover:bg-[#b87d3e]/5 transition-all text-left">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-800">View Donations</h3>
              <p className="text-sm text-gray-600 mt-1">Track donations</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="text-gray-500 text-center py-8">
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}

