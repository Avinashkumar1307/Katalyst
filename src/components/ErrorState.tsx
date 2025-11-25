interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
