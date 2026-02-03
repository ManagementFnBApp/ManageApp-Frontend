export default function ProductPage() {
    return (
        <div className="container mx-auto px-4 py-20">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-8">
                Sản phẩm
            </h1>
            <p className="text-center text-gray-600 text-lg mb-12">
                Khám phá các sản phẩm của ManageApp
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Product cards sẽ được thêm sau */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Sản phẩm 1</h3>
                    <p className="text-gray-600">Mô tả sản phẩm...</p>
                </div>
            </div>
        </div>
    )
}

