export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"
                style={{ borderColor: '#bbf7d0', borderTopColor: '#22c55e' }}
            />
            <p className="mt-4 text-gray-500 animate-pulse text-lg">正在识别中...</p>
        </div>
    );
}
