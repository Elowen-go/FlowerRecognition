import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import LoadingSpinner from './components/LoadingSpinner';
import { recognizeFlower } from './utils/api';
import { getHistory, addHistory, clearHistory } from './utils/storage';

export default function App() {
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleImageUpload = useCallback(async (compressedBase64, thumbnail) => {
        if (!compressedBase64) {
            setPreviewImage(null);
            return;
        }
        setPreviewImage(`data:image/jpeg;base64,${compressedBase64}`);
        setIsLoading(true);
        setResult(null);
        try {
            const res = await recognizeFlower(compressedBase64);
            if (res.success) {
                const newHistory = addHistory({
                    name: res.data.name,
                    confidence: res.data.confidence,
                    thumbnail: thumbnail || '',
                    resultData: res,  // 保存完整的识别结果（包含百科简介）
                });
                setHistory(newHistory);
            }
            setResult(res);
        } catch {
            setResult({
                success: false,
                error: '网络请求失败，请检查后端服务是否启动'
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleHistorySelect = useCallback((item) => {
        if (item.resultData) {
            setResult(item.resultData);
        } else {
            setResult({
                success: true,
                data: {
                    name: item.name,
                    confidence: item.confidence,
                }
            });
        }
    }, []);

    const handleClearHistory = useCallback(() => {
        clearHistory();
        setHistory([]);
    }, []);

    return (
        <div className="min-h-screen">
            <Header count={history.length} />
            <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <UploadArea
                            onImageSelect={handleImageUpload}
                            preview={previewImage}
                            disabled={isLoading}
                        />
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <ResultCard result={result} />
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24">
                            <HistoryList
                                history={history}
                                onSelect={handleHistorySelect}
                                onClear={handleClearHistory}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
