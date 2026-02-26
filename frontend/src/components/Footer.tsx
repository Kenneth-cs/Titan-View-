export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 p-6 mt-12">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} 巨头视野 Titan View. 保留所有权利。</p>
        <p className="text-sm mt-2">
          由火山引擎 AI 驱动，思维模型灵感来自顶级企业家。
        </p>
      </div>
    </footer>
  );
}
