import ApiConfigForm from '../components/ApiConfigForm';

function ConfigPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-4">
        <ApiConfigForm />
      </div>
    </div>
  );
}

export default ConfigPage; 