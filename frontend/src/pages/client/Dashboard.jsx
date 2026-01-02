export default function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">My Profile</h2>
        <div className="grid grid-cols-2 gap-4">
            <div><span className="font-medium">Email:</span> {user.email}</div>
            <div><span className="font-medium">Role:</span> {user.role}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">My Quotations</h2>
        <p className="text-gray-500">No quotation requests found.</p>
      </div>
    </div>
  );
}
