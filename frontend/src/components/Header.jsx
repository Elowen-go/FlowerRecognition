export default function Header({ count }) {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-rose-500 bg-clip-text text-transparent select-none">
                    🌸 美丽花卉识别
                </h1>
                <span className="text-sm text-gray-500">
                    已识别 {count} 次
                </span>
            </div>
        </header>
    );
}
