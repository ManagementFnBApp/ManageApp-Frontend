import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const problems = [
    "Sự kém hiệu quả trong quản lý tài chính và vận hành của các doanh nghiệp F&B vừa và nhỏ",
    "Thiếu các hệ thống quản lý bán hàng thông minh, đa chức năng với chi phí hợp lý",
    "Hạn chế trong việc theo dõi doanh thu và thiếu các công cụ phân tích chuyên sâu",
    "Hoạt động chia sẻ kiến thức trong hệ sinh thái F&B còn rời rạc và thiếu cấu trúc",
    "Rủi ro về tính toàn vẹn dữ liệu và bảo mật thông tin trong các giải pháp hiện có",
  ];
  const solutions = [
    "Quản lý bán hàng và tài chính tích hợp",
    "Tổng hợp doanh thu và bảng điều khiển phân tích trực quan",
    "Đồng bộ dữ liệu giữa thế giới số và thực tế",
    "Lưu trữ an toàn dữ liệu tài chính và thông tin cá nhân",
    "Hỗ trợ ra quyết định dựa trên dữ liệu thời gian thực",
    "Báo cáo hiệu suất theo sản phẩm, chi nhánh và thời gian",
  ];
  const values = [
    {
      title: "Tập trung khách hàng",
      description: "Khách hàng là trung tâm của mọi quyết định",
    },
    {
      title: "Đổi mới không ngừng",
      description: "Luôn tìm kiếm cách làm tốt hơn",
    },
    {
      title: "Hợp tác cùng phát triển",
      description: "Thành công của khách hàng là thành công của chúng tôi",
    },
    {
      title: "Đơn giản hóa",
      description: "Làm cho mọi thứ trở nên dễ dàng hơn",
    },
  ];
  return (
    <div className="pt-20">
      {/* HERO */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/image2.jpg"
            alt="Business Management Background"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/70 to-white/30"></div>
        </div>
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
            Về LumioViet
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Sứ mệnh của chúng tôi là hỗ trợ các doanh nghiệp khởi nghiệp F&B tại
            Việt Nam phát triển thông minh và dựa trên dữ liệu thông qua nền
            tảng quản lý bán hàng tích hợp và phân tích thời gian thực.
          </p>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Các vấn đề hiện nay
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Những thách thức cốt lõi mà doanh nghiệp F&B vừa và nhỏ đang phải
            đối mặt.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {problems.map((p, i) => (
              <div
                key={i}
                className={`
        p-8 border border-gray-100 rounded-2xl 
        hover:shadow-xl transition-all duration-300 
        text-left bg-blue-100
        ${i === problems.length - 1 ? "md:col-span-2 md:max-w-xl md:mx-auto" : ""}
      `}
              >
                <div className="text-blue-600 font-semibold mb-3">0{i + 1}</div>
                <p className="text-gray-700 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Giải pháp của chúng tôi
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            Một nền tảng toàn diện giúp doanh nghiệp F&B vận hành hiệu quả và
            phát triển bền vững.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <p className="text-gray-700 font-medium leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Tầm nhìn của chúng tôi
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Trở thành nền tảng quản lý bán hàng thông minh hàng đầu cho doanh
            nghiệp F&B tại Việt Nam, xây dựng một hệ sinh thái kinh doanh dựa
            trên dữ liệu và đổi mới sáng tạo, nơi các doanh nhân có thể phát
            triển bền vững và mở rộng quy mô một cách tự tin.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">
            Giá trị cốt lõi
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  {v.title}
                </h3>
                <p className="text-gray-600 text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-blue-500 to-blue-700 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Cùng nhau phát triển</h2>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Dùng thử miễn phí
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
