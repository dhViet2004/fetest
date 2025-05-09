"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useCart } from '../hooks/useCart'
import { Modal } from 'antd'

const API_URL = 'http://localhost:3001'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [userVouchers, setUserVouchers] = useState([])
  const [voucherError, setVoucherError] = useState('')
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const navigate = useNavigate()
  const { updateCartCount, updateCountImmediately } = useCart()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem giỏ hàng')
      navigate('/login')
      return
    }
    fetchCartItems(user.id)
    fetchVouchers(user.id)
  }, [navigate])

  const fetchCartItems = async (userId) => {
    try {
      console.log('=== Fetching Cart Items ===')
      console.log('User ID:', userId)
      
      const response = await fetch(`${API_URL}/cart?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch cart items')
      }
      const data = await response.json()
      console.log('Raw cart data:', data)
      
      const items = Array.isArray(data) ? data : data.cart || []
      console.log('Processed cart items:', items.map(item => ({
        id: item.id,
        productId: item.productId, // Check if there's a separate productId
        name: item.name,
        size: item.size,
        quantity: item.quantity
      })))
      
      setCartItems(items)
      setSelectedItems(items.map(item => item.id))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching cart items:', error)
      toast.error('Không thể tải giỏ hàng')
      setLoading(false)
    }
  }

  const fetchVouchers = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/vouchers`)
      if (!response.ok) {
        throw new Error('Failed to fetch vouchers')
      }
      const allVouchers = await response.json()
      console.log('All vouchers from API:', allVouchers)
      console.log('Current user ID:', userId)
      
      // Lọc voucher dành riêng cho user
      const userSpecificVouchers = allVouchers.filter(voucher => {
        console.log('\nChecking voucher:', voucher.code)
        
        // Kiểm tra voucher có userIds không
        if (voucher.userIds && voucher.userIds.length > 0) {
          // Nếu có userIds, chỉ hiển thị cho user trong danh sách
          if (!voucher.userIds.includes(userId)) {
            console.log(`${voucher.code}: Filtered out - Not in userIds list`)
            return false
          }
        } else {
          // Nếu không có userIds, hiển thị cho tất cả user
          console.log(`${voucher.code}: Available for all users`)
        }
        
        // Kiểm tra voucher đã hết hạn chưa
        const currentDate = new Date()
        const endDate = new Date(voucher.endDate)
        
        // Reset time part to compare only dates
        currentDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)
        
        console.log(`${voucher.code}: Current date:`, currentDate.toISOString().split('T')[0])
        console.log(`${voucher.code}: End date:`, endDate.toISOString().split('T')[0])
        console.log(`${voucher.code}: Is expired?`, currentDate > endDate)
        
        if (currentDate > endDate) {
          console.log(`${voucher.code}: Filtered out - Expired`)
          return false
        }

        // Kiểm tra voucher đã được sử dụng bởi user này chưa
        if (voucher.usedBy && voucher.usedBy.includes(userId)) {
          console.log(`${voucher.code}: Filtered out - Already used by this user`)
          return false
        }

        console.log(`${voucher.code}: Passed all filters`)
        return true
      })

      console.log('\nFinal filtered vouchers:', userSpecificVouchers)
      setAvailableVouchers(allVouchers)
      setUserVouchers(userSpecificVouchers)
    } catch (error) {
      console.error('Error fetching vouchers:', error)
      toast.error('Không thể tải danh sách voucher')
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      toast.error('Vui lòng đăng nhập để cập nhật giỏ hàng')
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`${API_URL}/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quantity: newQuantity,
          userId: user.id 
        }),
      })

      if (response.ok) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        )
        updateCartCount()
        toast.success('Cập nhật số lượng thành công')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Không thể cập nhật số lượng')
    }
  }

  const handleRemoveItem = async (itemId) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      toast.error('Vui lòng đăng nhập để xóa sản phẩm')
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`${API_URL}/cart/${itemId}?userId=${user.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCartItems(prevItems => {
          const newItems = prevItems.filter(item => item.id !== itemId);
          updateCountImmediately(newItems.length);
          return newItems;
        });
        setSelectedItems(prev => prev.filter(id => id !== itemId));
        toast.success('Xóa sản phẩm thành công')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cartItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

  const subtotal = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((total, item) => {
      console.log('Item price:', item.price)
      console.log('Item quantity:', item.quantity)
      return total + (item.price * item.quantity)
    }, 0)

  console.log('Calculated subtotal:', subtotal)
  console.log('Minimum order for voucher:', appliedVoucher?.minOrder)

  const shipping = selectedItems.length > 0 ? 30000 : 0

  const handleApplyVoucher = async () => {
    try {
      setVoucherError('')
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        toast.error('Vui lòng đăng nhập để sử dụng voucher')
        return
      }

      // First check if the voucher exists
      const response = await fetch(`${API_URL}/vouchers`)
      if (!response.ok) {
        throw new Error('Failed to check voucher')
      }
      
      const allVouchers = await response.json()
      const voucher = allVouchers.find(v => v.code === voucherCode.toUpperCase())

      if (!voucher) {
        setVoucherError('Mã giảm giá không tồn tại')
        toast.error('Mã giảm giá không tồn tại')
        return
      }

      // Kiểm tra voucher có dành riêng cho user này không
      if (voucher.userId && voucher.userId !== user.id) {
        setVoucherError('Bạn không có quyền sử dụng voucher này')
        toast.error('Bạn không có quyền sử dụng voucher này')
        return
      }

      // Check voucher expiration
      const currentDate = new Date()
      const startDate = new Date(voucher.startDate)
      const endDate = new Date(voucher.endDate)

      if (currentDate < startDate) {
        setVoucherError('Mã giảm giá chưa có hiệu lực')
        toast.error('Mã giảm giá chưa có hiệu lực')
        return
      }

      if (currentDate > endDate) {
        setVoucherError('Mã giảm giá đã hết hạn')
        toast.error('Mã giảm giá đã hết hạn')
        return
      }

      // Kiểm tra điều kiện đơn hàng tối thiểu
      const orderTotal = subtotal + shipping; // Tổng tiền đơn hàng bao gồm phí ship
      if (orderTotal < voucher.minOrder) {
        const remaining = voucher.minOrder - orderTotal;
        setVoucherError(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
        toast.error(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để áp dụng mã này. Bạn cần thêm ${formatCurrency(remaining)}`);
        return;
      }

      // Check if voucher has been used
      if (voucher.usedBy && voucher.usedBy.includes(user.id)) {
        setVoucherError('Bạn đã sử dụng mã giảm giá này')
        toast.error('Bạn đã sử dụng mã giảm giá này')
        return
      }

      // If all checks pass, apply the voucher
      setAppliedVoucher(voucher)
      setVoucherError('')
      setDiscount(voucher.type === 'fixed' ? voucher.discount : (orderTotal * voucher.discount) / 100)
      toast.success('Áp dụng mã giảm giá thành công')
    } catch (error) {
      console.error('Error applying voucher:', error)
      setVoucherError('Có lỗi xảy ra khi áp dụng mã giảm giá')
      toast.error('Có lỗi xảy ra khi áp dụng mã giảm giá')
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode('')
    toast.success('Đã xóa mã giảm giá')
  }

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0

    console.log('Calculating discount for voucher:', appliedVoucher)
    console.log('Subtotal:', subtotal)

    if (appliedVoucher.type === 'fixed') {
      // For fixed discount, return the discount amount directly
      return appliedVoucher.discount
    } else {
      // For percentage discount, calculate based on subtotal
      const discount = (subtotal * appliedVoucher.discount) / 100
      console.log('Percentage discount:', discount)
      return Math.round(discount) // Round to avoid floating point issues
    }
  }

  const discount = calculateDiscount()
  const total = subtotal + shipping - discount

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const handleSelectVoucher = (voucher) => {
    setVoucherCode(voucher.code)
    setShowVoucherModal(false)
  }

  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để thanh toán');
      return;
    }

    console.log('=== Checkout Process ===')
    console.log('Selected Items:', selectedItems)
    console.log('Cart Items:', cartItems.map(item => ({
      cartItemId: item.id,
      productId: item.productId,
      name: item.name,
      size: item.size,
      quantity: item.quantity
    })))

    const orderItems = cartItems.filter(item => selectedItems.includes(item.id));
    console.log('Filtered Order Items:', orderItems.map(item => ({
      cartItemId: item.id,
      productId: item.productId,
      name: item.name,
      size: item.size,
      quantity: item.quantity
    })))

    const orderData = {
      userId: user.id,
      items: orderItems.map(item => ({
        ...item,
        cartItemId: item.id,        // Giữ lại ID của item trong giỏ hàng
        id: item.productId          // ID của sản phẩm
      })),
      total: total,
      voucher: appliedVoucher ? appliedVoucher.code : null,
      createdAt: new Date().toISOString()
    };

    console.log('Final Order Data:', {
      userId: orderData.userId,
      items: orderData.items.map(item => ({
        id: item.id,
        cartItemId: item.cartItemId,
        name: item.name,
        size: item.size,
        quantity: item.quantity
      })),
      total: orderData.total
    })

    try {
      // Chuyển đến trang thanh toán với thông tin đơn hàng
      navigate('/checkout', { 
        state: { 
          order: orderData,
          cartItems: orderItems.map(item => ({
            ...item,
            id: item.productId
          }))
        } 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Có lỗi khi đặt hàng, vui lòng thử lại!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="select-all"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={cartItems.length === 0}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cart-checkbox"
              />
              <label htmlFor="select-all" className="text-3xl font-bold cursor-pointer">
                Giỏ hàng của bạn
              </label>
            </div>
            <span className="text-gray-500">{cartItems.length} sản phẩm</span>
          </div>

          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex gap-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={item.imageUrl || "/placeholder.svg"} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                          <p className="text-gray-500">Size: {item.size}</p>
                          <p className="text-blue-600 font-semibold">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button 
                              className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 transition-colors quantity-btn"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <span className="text-xl">-</span>
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button 
                              className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 transition-colors quantity-btn"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="text-xl">+</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                            <button 
                              className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 remove-item-btn"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <span className="text-xl">×</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Giỏ hàng của bạn đang trống</h2>
              <p className="text-gray-500 mb-6">Hãy thêm một vài sản phẩm và quay lại đây nhé!</p>
              <a 
                href="/products" 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 continue-shopping-btn"
              >
                Tiếp tục mua sắm
              </a>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="w-full md:w-80">
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tổng đơn hàng</h2>
                
                {/* Voucher Input */}
                <div className="mb-4">
                  <style>
                    {`
                      .voucher-item {
                        border: 1px solid #f0f0f0;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 12px;
                        transition: all 0.3s ease;
                        position: relative;
                      }
                      .voucher-item:hover {
                        border-color: #40a9ff;
                        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
                        transform: translateY(-2px);
                      }
                      .voucher-item .voucher-code {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1890ff;
                      }
                      .voucher-item .voucher-discount {
                        color: #52c41a;
                        font-weight: 500;
                      }
                      .voucher-item .voucher-min-order {
                        color: #666;
                        font-size: 13px;
                      }
                      .voucher-item .voucher-expiry {
                        color: #999;
                        font-size: 12px;
                        margin-top: 8px;
                      }
                      .voucher-item .voucher-exclusive {
                        color: #1890ff;
                        font-size: 12px;
                        margin-top: 4px;
                      }
                      /* Cart page styles */
                      .cart-checkbox {
                        cursor: pointer;
                      }
                      .cart-checkbox:disabled {
                        cursor: not-allowed;
                      }
                      .quantity-btn {
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .quantity-btn:hover {
                        background-color: #f3f4f6;
                      }
                      .remove-item-btn {
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .remove-item-btn:hover {
                        background-color: #fee2e2;
                      }
                      .continue-shopping-btn {
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .continue-shopping-btn:hover {
                        opacity: 0.9;
                      }
                      .voucher-input {
                        cursor: text;
                      }
                      .voucher-btn {
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .voucher-btn:hover {
                        opacity: 0.9;
                      }
                      .voucher-btn:disabled {
                        cursor: not-allowed;
                      }
                      .checkout-btn {
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .checkout-btn:hover {
                        opacity: 0.9;
                      }
                      .checkout-btn:disabled {
                        cursor: not-allowed;
                      }
                      .voucher-item {
                        cursor: pointer;
                        transition: all 0.3s ease;
                      }
                      .voucher-item:hover {
                        border-color: #40a9ff;
                        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
                        transform: translateY(-2px);
                      }
                      .remove-voucher-btn {
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .remove-voucher-btn:hover {
                        background-color: #fee2e2;
                      }
                    `}
                  </style>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 flex-nowrap overflow-hidden">
                      <input
                        type="text"
                        placeholder="Chọn hoặc nhập mã giảm giá"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value)
                          setVoucherError('')
                        }}
                        className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 voucher-input"
                      />
                      <button
                        onClick={() => setShowVoucherModal(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap flex-shrink-0 voucher-btn"
                      >
                        Chọn voucher
                      </button>
                    </div>
                    <button
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode.trim()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed voucher-btn"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {voucherError && (
                    <div className="mt-2 text-red-500 text-sm">
                      {voucherError}
                    </div>
                  )}
                  {appliedVoucher && (
                    <div className="mt-3 voucher-item">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="voucher-code">{appliedVoucher.code}</div>
                          <div className="voucher-discount mt-1">
                            {appliedVoucher.type === 'percentage'
                              ? `Giảm ${appliedVoucher.discount}%`
                              : `Giảm ${formatCurrency(appliedVoucher.discount)}`}
                          </div>
                          {appliedVoucher.userId && (
                            <div className="voucher-exclusive">
                              Voucher dành riêng cho bạn
                            </div>
                          )}
                        </div>
                        <div className="voucher-min-order">
                          Đơn tối thiểu: {formatCurrency(appliedVoucher.minOrder)}
                        </div>
                      </div>
                      <div className="voucher-expiry">
                        HSD: {new Date(appliedVoucher.endDate).toLocaleDateString('vi-VN')}
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 remove-voucher-btn"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Voucher Modal */}
                <Modal
                  title="Mã giảm giá của bạn"
                  open={showVoucherModal}
                  onCancel={() => setShowVoucherModal(false)}
                  footer={null}
                  width={500}
                  className="voucher-modal"
                  style={{ top: 20 }}
                  styles={{
                    body: {
                      padding: '24px'
                    }
                  }}
                >
                  <style>
                    {`
                      .voucher-modal .ant-modal-content {
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                      }
                      .voucher-modal .ant-modal-header {
                        border-bottom: 2px solid #f0f0f0;
                        padding: 16px 24px;
                      }
                      .voucher-modal .ant-modal-title {
                        font-size: 20px;
                        font-weight: 600;
                      }
                      .voucher-modal .voucher-item {
                        border: 1px solid #f0f0f0;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 12px;
                        transition: all 0.3s ease;
                        cursor: pointer;
                      }
                      .voucher-modal .voucher-item:hover {
                        border-color: #40a9ff;
                        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
                        transform: translateY(-2px);
                      }
                      .voucher-modal .voucher-item .voucher-code {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1890ff;
                      }
                      .voucher-modal .voucher-item .voucher-discount {
                        color: #52c41a;
                        font-weight: 500;
                      }
                      .voucher-modal .voucher-item .voucher-min-order {
                        color: #666;
                        font-size: 13px;
                      }
                      .voucher-modal .voucher-item .voucher-expiry {
                        color: #999;
                        font-size: 12px;
                        margin-top: 8px;
                      }
                      .voucher-modal .voucher-item .voucher-exclusive {
                        color: #1890ff;
                        font-size: 12px;
                        margin-top: 4px;
                      }
                    `}
                  </style>
                  <div className="max-h-96 overflow-y-auto">
                    {userVouchers.length > 0 ? (
                      userVouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className="voucher-item"
                          onClick={() => handleSelectVoucher(voucher)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="voucher-code">{voucher.code}</div>
                              <div className="voucher-discount mt-1">
                                {voucher.type === 'percentage'
                                  ? `Giảm ${voucher.discount}%`
                                  : `Giảm ${formatCurrency(voucher.discount)}`}
                              </div>
                              {voucher.userId && (
                                <div className="voucher-exclusive">
                                  Voucher dành riêng cho bạn
                                </div>
                              )}
                            </div>
                            <div className="voucher-min-order">
                              Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
                            </div>
                          </div>
                          <div className="voucher-expiry">
                            HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Bạn chưa có voucher nào
                      </div>
                    )}
                  </div>
                </Modal>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedVoucher.code})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button 
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed checkout-btn"
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}