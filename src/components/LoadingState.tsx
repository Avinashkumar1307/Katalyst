export default function LoadingState() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading your meetings...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Fetching data from Google Calendar
        </p>
      </div>
    </main>
  );
}
