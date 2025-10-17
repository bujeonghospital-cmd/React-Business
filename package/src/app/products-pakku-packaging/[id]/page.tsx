"use client";
import ScaledCanvas from "../../../components/ScaledCanvas";
import React, { useState } from "react";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  Plus,
  Minus,
  Share2,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// ข้อมูลสินค้า (ควรเป็นข้อมูลจริงจาก API หรือ database)
const productsData = [
  {
    id: "1",
    sku: "FIC800000",
    name: "ชามกระดาษ 8oz ลายบลู #1",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "540",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.8,
    reviews: 324,
    stock: 150,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู ผลิตจากวัสดุคุณภาพสูงที่มีความแข็งแรงและสามารถเก็บรักษาได้นาน พิมพ์สีสันสวยงาม เหมาะสำหรับใช้บรรจุอาหารต่างๆ ปลอดภัยต่อสุขภาพ ทนความร้อนได้ดี",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "12 pt",
      สี: "ฟ้าพิมพ์ลายสวยงาม",
      พิมพ์: "ดิจิตอลพิมพ์ 4 สี",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "2",
    sku: "FIC800001",
    name: "ชามกระดาษ 8oz ลายบลู #2",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "550",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.9,
    reviews: 512,
    stock: 200,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู รุ่นพิเศษ ออกแบบมาเพื่อให้สวยงามและใช้งานได้ดี เหมาะสำหรับร้านอาหาร คาเฟ่ หรือใช้ในงานเลี้ยงต่างๆ",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "14 pt",
      สี: "ฟ้าเข้มพิมพ์ลายพิเศษ",
      พิมพ์: "ออฟเซ็ทพิมพ์ 4 สี",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "3",
    sku: "FIC800002",
    name: "ชามกระดาษ 8oz ลายบลู #3",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "560",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษเล็ก",
    rating: 4.7,
    reviews: 287,
    stock: 300,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู ดีไซน์สวยงาม ใช้งานสะดวก มีหลายสีให้เลือก เหมาะสำหรับทุกโอกาส",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "12 pt",
      สี: "ฟ้า/ขาว",
      พิมพ์: "สกรีนพิมพ์ 2-4 สี",
      ปริมาณ: "2000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "4",
    sku: "FIC800003",
    name: "ชามกระดาษ 8oz ลายบลู #4",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "570",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.6,
    reviews: 198,
    stock: 120,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู คุณภาพพรีเมียม ผลิตจากวัสดุที่ได้มาตรฐาน ปลอดภัย ไร้สารพิษ",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "13 pt",
      สี: "ฟ้าพาสเทล",
      พิมพ์: "ดิจิตอลพิมพ์ Full Color",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "5",
    sku: "FIC800004",
    name: "ชามกระดาษ 8oz ลายบลู #5",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "580",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.8,
    reviews: 445,
    stock: 180,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู สวยงาม ทนทาน ใช้งานได้ดีเยี่ยม เหมาะสำหรับธุรกิจร้านอาหาร",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "12 pt",
      สี: "ฟ้าเข้ม",
      พิมพ์: "ออฟเซ็ท 4 สี",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "6",
    sku: "FIC800005",
    name: "ชามกระดาษ 8oz ลายบลู #6",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "590",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.9,
    reviews: 623,
    stock: 250,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู ออกแบบพิเศษ ใช้วัสดุที่มีคุณภาพสูงสุด ปลอดภัยต่อผู้บริโภค",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "14 pt",
      สี: "ฟ้าสด",
      พิมพ์: "ดิจิตอล UV Printing",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "7",
    sku: "FIC800006",
    name: "ชามกระดาษ 8oz ลายบลู #7",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "600",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.7,
    reviews: 356,
    stock: 140,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู คุณภาพเกรดพรีเมียม ทนทาน สวยงาม ใช้งานได้หลากหลาย",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "13 pt",
      สี: "ฟ้าอ่อน",
      พิมพ์: "Flexo Printing",
      ปริมาณ: "1500 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "8",
    sku: "FIC800007",
    name: "ชามกระดาษ 8oz ลายบลู #8",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "610",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.8,
    reviews: 478,
    stock: 190,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู ผลิตภัณฑ์คุณภาพ ได้รับการรับรองมาตรฐานสากล เหมาะสำหรับใช้ในงานทุกประเภท",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "12 pt",
      สี: "ฟ้าน้ำทะเล",
      พิมพ์: "ดิจิตอล 6 สี",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
  {
    id: "9",
    sku: "FIC800008",
    name: "ชามกระดาษ 8oz ลายบลู #9",
    description: "ชามกระดาษคุณภาพสูง",
    shortDesc: "อีนเตอร์ดิอลสำสุด",
    price: "620",
    image: "/images/pakku-packaging/item_detail/dev_592.png",
    category: "บรรจุภัณฑ์กระดาษ",
    rating: 4.9,
    reviews: 589,
    stock: 220,
    fullDescription:
      "ชามกระดาษ 8oz ลายบลู รุ่นท็อปเซลเลอร์ ใช้วัสดุคุณภาพสูง ออกแบบสวยงาม ใช้งานได้ยาวนาน",
    specifications: {
      ขนาด: "8 oz (237 ml)",
      วัสดุ: "กระดาษเคลือบ PE Food Grade",
      ความหนา: "14 pt",
      สี: "ฟ้าไล่โทน",
      พิมพ์: "UV Offset Printing",
      ปริมาณ: "1000 ชิ้นต่อกล่อง",
    },
    images: [
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
      "/images/pakku-packaging/item_detail/dev_592.png",
    ],
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // หาสินค้าจาก ID
  const product = productsData.find((p) => p.id === params.id);

  if (!product) {
    return (
      <ScaledCanvas>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              ไม่พบสินค้า
            </h1>
            <Link
              href="/products-pakku-packaging"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับไปหน้ารายการสินค้า
            </Link>
          </div>
        </div>
      </ScaledCanvas>
    );
  }

  const handleAddToCart = () => {
    alert(`เพิ่ม ${product.name} จำนวน ${quantity} ชิ้นลงตะกร้า`);
    setQuantity(1);
  };

  // สินค้าที่เกี่ยวข้อง (สินค้าอื่นๆ ที่ไม่ใช่สินค้าปัจจุบัน)
  const relatedProducts = productsData
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <ScaledCanvas>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white shadow-md">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link
                href="/products-pakku-packaging"
                className="flex items-center gap-2 text-slate-700 transition-colors hover:text-emerald-600"
              >
                <ArrowLeft size={24} />
                <span className="font-semibold">กลับ</span>
              </Link>
              <h1 className="text-xl font-bold text-slate-800">
                รายละเอียดสินค้า
              </h1>
              <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700">
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="flex h-96 items-center justify-center overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white p-4 shadow transition-all hover:shadow-lg ${
                      selectedImageIndex === idx
                        ? "ring-2 ring-emerald-600"
                        : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - รูปที่ ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category & Rating */}
              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                  {product.category}
                </span>
                <div className="mt-2 text-sm text-slate-500">{product.sku}</div>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">
                  {product.name}
                </h1>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-slate-600">
                    {product.rating} • {product.reviews} รีวิว
                  </span>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="border-b border-slate-200 pb-6">
                <div className="mb-4 flex items-end gap-4">
                  <span className="text-5xl font-bold text-emerald-600">
                    ฿{product.price}
                  </span>
                  <span className="text-lg text-slate-500 line-through">
                    ฿{parseInt(product.price) + 50}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-700">
                    มีสต็อก: {product.stock} ชิ้น
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  รายละเอียดสินค้า
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {product.fullDescription}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  ข้อมูลจำเพาะ
                </h3>
                <div className="space-y-3 rounded-lg bg-white p-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between border-b border-slate-100 pb-3"
                      >
                        <span className="font-medium text-slate-600">
                          {key}:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">จำนวน:</span>
                  <div className="flex items-center overflow-hidden rounded-lg border border-slate-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-slate-100"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 border-l border-r border-slate-300 py-2 text-center"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-slate-100"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-4 text-lg font-bold text-white transition-colors hover:bg-emerald-700"
                  >
                    <ShoppingCart size={24} />
                    เพิ่มลงตะกร้า
                  </button>
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`rounded-lg border-2 px-6 py-4 font-semibold transition-colors ${
                      liked
                        ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                        : "border-slate-300 text-slate-700 hover:border-emerald-600"
                    }`}
                  >
                    <Heart size={24} fill={liked ? "currentColor" : "none"} />
                  </button>
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-300 py-3 font-semibold text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-600">
                  <Share2 size={20} />
                  แชร์สินค้า
                </button>
              </div>

              {/* Delivery Info */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-3 font-bold text-blue-900">
                  ข้อมูลการจัดส่ง
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>✓ จัดส่งฟรีสำหรับสั่งซื้อ 2,000 บาท ขึ้นไป</p>
                  <p>✓ ส่งถึง Bangkok ภายใน 1-2 วัน</p>
                  <p>✓ ส่งต่างจังหวัด ภายใน 3-5 วัน</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h3 className="mb-8 text-3xl font-bold text-slate-900">
              สินค้าที่เกี่ยวข้อง
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products-pakku-packaging/${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="aspect-square w-full overflow-hidden bg-white">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-3 p-6">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                      {p.category}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < Math.floor(p.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        ({p.rating})
                      </span>
                    </div>
                    <span className="block text-2xl font-bold text-emerald-600">
                      ฿{p.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScaledCanvas>
  );
}
