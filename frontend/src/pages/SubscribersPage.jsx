import SubscriberTable from '../components/SubscriberTable';

function SubscribersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscribers List</h1>
        <button 
          onClick={() => window.location.href = '/'} 
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Change API Configuration
        </button>
      </div>
      <SubscriberTable />
    </div>
  );
}

export default SubscribersPage; 