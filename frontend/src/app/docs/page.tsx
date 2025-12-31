import Link from 'next/link';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#030014] text-white p-8">
            <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block">
                ← 돌아가기
            </Link>
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 border-b border-white/10 pb-8">
                    <h1 className="text-4xl font-bold mb-2">Developer Documentation</h1>
                    <p className="text-xl text-gray-400">매칭 코어 시스템 통합 가이드</p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold text-purple-400 mb-4">Core Concepts</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 leading-relaxed">
                                매칭 코어는 <strong>MatchableEntity</strong>라는 추상화된 단위를 사용하여 유저와 팀을 구분하지 않고 매칭합니다.
                                핵심 알고리즘은 <strong>MatchingStrategy</strong> 인터페이스를 구현하여 플러그인 태로 교체할 수 있습니다.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-purple-400 mb-4">API Reference</h2>
                        <div className="glass-card p-6 rounded-xl border border-white/10 bg-[#0a0a0f]">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded font-mono">POST</span>
                                <code className="text-sm">/api/matching/request</code>
                            </div>
                            <p className="text-gray-400 mb-4">새로운 매칭 요청을 대기열에 등록합니다.</p>
                            <pre className="bg-[#050508] p-4 rounded text-sm text-gray-300 overflow-x-auto border border-white/5">
                                {`{
  "requesterId": "uuid",
  "type": "USER_TEAM",
  "filters": {
    "location": [37.5, 127.0],
    "radius": 5000
  }
}`}
                            </pre>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
