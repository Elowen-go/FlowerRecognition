function formatTime(isoString) {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return new Date(isoString).toLocaleDateString('zh-CN');
}

export default function HistoryList({ history, onSelect, onClear }) {
    return (
        <div className="rounded-2xl bg-white shadow-soft p-5">
            <h3 className="text-base font-semibold text-gray-700 mb-4">📋 识别历史</h3>

            {history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <div className="text-3xl mb-2">🌱</div>
                    <p className="text-sm">暂无识别记录</p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => onSelect(item)}
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg">🌸</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-700 text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400">{formatTime(item.timestamp)}</p>
                                </div>
                                {item.confidence && (
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        {Math.round(item.confidence * 100)}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        className="w-full text-center text-sm text-gray-400 hover:text-red-500 mt-4 pt-3 border-t border-gray-100 transition-colors"
                        onClick={() => {
                            if (confirm('确定清空所有识别历史吗？')) {
                                onClear();
                            }
                        }}
                    >
                        清空历史
                    </button>
                </>
            )}
        </div>
    );
}
