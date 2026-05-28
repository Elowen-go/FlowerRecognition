import { useState } from 'react';

function getConfidenceColor(confidence) {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
}

function getConfidenceTextColor(confidence) {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    if (!children) return null;
    
    return (
        <div className="border-t border-gray-100 pt-4">
            <button 
                className="flex items-center justify-between w-full text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    {title}
                </h3>
                <span className="text-gray-400 text-xs transform transition-transform duration-200 group-hover:text-gray-600">
                    {isOpen ? '收起 ▲' : '展开 ▼'}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                <div className="text-gray-600 leading-relaxed text-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function ResultCard({ result }) {
    if (!result) return null;

    if (!result.success) {
        return (
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">😅</span>
                    <h3 className="text-lg font-semibold text-red-700">识别失败</h3>
                </div>
                <p className="text-red-600">{result.error || '请重试'}</p>
                <p className="text-red-400 text-sm mt-2">请重新上传清晰的图片</p>
            </div>
        );
    }

    const { data } = result;
    const confidence = data.confidence || 0;
    const confidencePercent = Math.round(confidence * 100);

    return (
        <div className="rounded-2xl bg-white shadow-soft-lg overflow-hidden">
            {/* 头部：花名 + 置信度 */}
            <div className="bg-gradient-to-r from-green-50 to-pink-50 p-6">
                <div className="flex items-center gap-4">
                    <span className="text-5xl">🌸</span>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold text-gray-800 truncate">
                            {data.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(confidence)}`}
                                    style={{ width: `${confidencePercent}%` }}
                                />
                            </div>
                            <span className={`text-sm font-bold ${getConfidenceTextColor(confidence)}`}>
                                {confidencePercent}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 space-y-4">
                {/* 基本介绍 - 默认展开 */}
                {data.basic_intro && (
                    <CollapsibleSection title="📖 基本介绍" defaultOpen={true}>
                        {data.basic_intro}
                    </CollapsibleSection>
                )}

                {/* 详细信息 - 默认收起 */}
                {data.detail_intro && (
                    <CollapsibleSection title="📝 详细介绍">
                        <div className="whitespace-pre-line">
                            {data.detail_intro}
                        </div>
                    </CollapsibleSection>
                )}

                {/* 花语 - 如果有的话 */}
                {data.flower_language && (
                    <div className="border-t border-gray-100 pt-4">
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">💐 花语寓意</h3>
                            <p className="text-lg text-rose-700 font-medium leading-relaxed">
                                "{data.flower_language}"
                            </p>
                        </div>
                    </div>
                )}

                {/* 科属信息 - 紧凑展示 */}
                {(data.latin_name || data.family || data.genus) && (
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">🔬 分类信息</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.latin_name && (
                                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 italic">
                                    {data.latin_name}
                                </span>
                            )}
                            {data.family && (
                                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    {data.family}
                                </span>
                            )}
                            {data.genus && (
                                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    {data.genus}
                                </span>
                            )}
                            {data.alias && (
                                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                    别名：{data.alias}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 图片展示 */}
                {data.images && data.images.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">🖼️ 花卉图片</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {data.images.slice(0, 4).map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`${data.name} ${index + 1}`}
                                    className="rounded-xl w-full h-32 object-cover shadow-sm hover:shadow-md transition-shadow"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
