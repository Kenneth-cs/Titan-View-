import { NewsItem, PLATFORM_LABEL } from '@/lib/api';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  news: NewsItem[];
  loading?: boolean;
}

export default function SectionCard({ icon, title, subtitle, desc, news, loading }: Props) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-xs text-blue-600 font-medium mb-2">{subtitle}</p>
      <p className="text-xs text-gray-400 mb-3">{desc}</p>

      <div className="flex-grow space-y-2 border-t pt-3">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-4 bg-gray-100 rounded w-full" />
            ))}
          </div>
        )}

        {!loading && news.length === 0 && (
          <p className="text-xs text-gray-400 italic">暂无数据，运行爬虫后自动填充</p>
        )}

        {!loading && news.map((item) => (
          <div key={item.id} className="group">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-700 hover:text-blue-700 hover:underline leading-relaxed line-clamp-2 block"
              title={item.title}
            >
              {item.title} <span className="text-gray-300 group-hover:text-blue-400">↗</span>
            </a>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">
                {PLATFORM_LABEL[item.source_platform] || item.source_platform}
              </span>
              {item.publish_time && (
                <span className="text-xs text-gray-300">
                  {new Date(item.publish_time).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
