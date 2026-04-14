'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiGrid, FiList, FiSearch, FiTrash2, FiEdit3 } from 'react-icons/fi' 

const SERVICE_TYPES = [
  "Custom Furniture",
  "Kitchen Cabinetry",
  "Restoration",
  "Masjid Woodwork",
  "Special Projects",
  "Others"
];

interface Customer {
  recordID: string
  name: string
  phone: string
  address?: string
  attention_person?: string
  serviceType: string
  transactionHistory: string
  created_at?: string
}

interface CustomerOrder {
  id: string
  customer_id: string
  order_title?: string
  document_date: string
  cpo_no?: string
  invoice_no?: string
  receipt_no?: string
  amount_paid: number
  payment_date?: string
  total_amount: number
  balance: number
  notes?: string
  bank_account_name?: string
  bank_account_no?: string
  bank_name?: string
  created_at?: string
}

interface CustomerOrderItem {
  id: string
  order_id: string
  item_no?: number
  description: string
  details?: string
  qty: number
  unit_price: number
  line_total: number
  created_at?: string
}

interface CustomerPayment {
  id: string
  order_id: string
  payment_date: string
  amount: number
  payment_method?: string
  reference_no?: string
  notes?: string
  receipt_no?: string
  invoice_no?: string
  created_at?: string
}

interface OrderItemForm {
  item_no: number
  description: string
  details: string
  qty: number
  unit_price: number
  line_total: number
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table') // Default to table for CRM
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])

const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<CustomerOrder[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [orderForm, setOrderForm] = useState({
  order_title: '',
  document_date: '',
  cpo_no: '',
  invoice_no: '',
  receipt_no: '',
  amount_paid: '',
  payment_date: '',
  notes: '',
  bank_account_name: 'Hamid Technology Solution',
  bank_account_no: '01032010046679',
  bank_name: 'Bank Islam Malaysia',
})

const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
const [payments, setPayments] = useState<CustomerPayment[]>([])
const [showPaymentModal, setShowPaymentModal] = useState(false)
const [editingPayment, setEditingPayment] = useState<CustomerPayment | null>(null)
const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null)
const [paymentForm, setPaymentForm] = useState({
  payment_date: '',
  amount: '',
  payment_method: '',
  reference_no: '',
  notes: '',
  receipt_no: '',
  invoice_no: '',
})

const [orderItems, setOrderItems] = useState<OrderItemForm[]>([
  {
    item_no: 1,
    description: '',
    details: '',
    qty: 1,
    unit_price: 0,
    line_total: 0,
  },
])

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('All')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const [form, setForm] = useState({
  name: '',
  phone: '',
  address: '',
  attention_person: '',
  serviceType: 'Custom Furniture',
  transactionHistory: ''
})
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/admin/login')
      else {
        fetchCustomers()
        setLoading(false)
      }
    })
  }, [router])

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from('customerRecord').select('*').order('name', { ascending: true })
    if (data) setCustomers(data)
  }

const fetchOrdersByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('customer_orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer orders:', error.message)
    return
  }

  if (data) {
    setSelectedCustomerOrders(data)
  }
}

const fetchOrderItemsByOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('customer_order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('item_no', { ascending: true })

  if (error) {
    console.error('Error fetching order items:', error.message)
    return []
  }

  return data || []
}

const handleEditOrder = async (order: CustomerOrder) => {
  const items = await fetchOrderItemsByOrder(order.id)

  setEditingOrder(order)

  setOrderForm({
    order_title: order.order_title || '',
    document_date: order.document_date || '',
    cpo_no: order.cpo_no || '',
    invoice_no: order.invoice_no || '',
    receipt_no: order.receipt_no || '',
    amount_paid: String(order.amount_paid ?? ''),
    payment_date: order.payment_date || '',
    notes: order.notes || '',
    bank_account_name: order.bank_account_name || 'Hamid Technology Solution',
    bank_account_no: order.bank_account_no || '01032010046679',
    bank_name: order.bank_name || 'Bank Islam Malaysia',
  })

  setOrderItems(
    items.length > 0
      ? items.map((item, index) => ({
          item_no: index + 1,
          description: item.description || '',
          details: item.details || '',
          qty: Number(item.qty) || 1,
          unit_price: Number(item.unit_price) || 0,
          line_total: Number(item.line_total) || 0,
        }))
      : [
          {
            item_no: 1,
            description: '',
            details: '',
            qty: 1,
            unit_price: 0,
            line_total: 0,
          },
        ]
  )

  setShowCreateOrderModal(true)
}

const fetchPaymentsByOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('customer_payments')
    .select('*')
    .eq('order_id', orderId)
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error.message)
    return
  }

  setPayments(data || [])
}

const recalculateOrderPaymentSummary = async (orderId: string) => {
  const { data: paymentRows, error: paymentError } = await supabase
    .from('customer_payments')
    .select('amount')
    .eq('order_id', orderId)

  if (paymentError) throw paymentError

  const totalPaid = (paymentRows || []).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  )

  const { data: orderRow, error: orderError } = await supabase
    .from('customer_orders')
    .select('total_amount')
    .eq('id', orderId)
    .single()

  if (orderError) throw orderError

  const totalAmount = Number(orderRow.total_amount || 0)
  const balance = totalAmount - totalPaid

  const { error: updateError } = await supabase
    .from('customer_orders')
    .update({
      amount_paid: totalPaid,
      balance,
    })
    .eq('id', orderId)

  if (updateError) throw updateError
}

const handleOpenCustomerDetails = async (customer: Customer) => {
  setSelectedCustomer(customer)
  await fetchOrdersByCustomer(customer.recordID)
  setShowOrderModal(true)
}

const handleOpenPayments = async (order: CustomerOrder) => {
  setSelectedOrder(order)
  await fetchPaymentsByOrder(order.id)
  setShowPaymentModal(true)
}

const addOrderItemRow = () => {
  setOrderItems(prev => [
    ...prev,
    {
      item_no: prev.length + 1,
      description: '',
      details: '',
      qty: 1,
      unit_price: 0,
      line_total: 0,
    },
  ])
}

const removeOrderItemRow = (index: number) => {
  const updated = orderItems
    .filter((_, i) => i !== index)
    .map((item, idx) => ({
      ...item,
      item_no: idx + 1,
    }))

  setOrderItems(
    updated.length > 0
      ? updated
      : [
          {
            item_no: 1,
            description: '',
            details: '',
            qty: 1,
            unit_price: 0,
            line_total: 0,
          },
        ]
  )
}

const updateOrderItem = (
  index: number,
  field: 'description' | 'details' | 'qty' | 'unit_price',
  value: string | number
) => {
  const updated = [...orderItems]
  const currentItem = { ...updated[index], [field]: value }

  const qty = Number(currentItem.qty) || 0
  const unitPrice = Number(currentItem.unit_price) || 0

  currentItem.line_total = qty * unitPrice
  updated[index] = currentItem

  setOrderItems(updated)
}


const resetOrderForm = () => {
  setEditingOrder(null)

  setOrderForm({
    order_title: '',
    document_date: '',
    cpo_no: '',
    invoice_no: '',
    receipt_no: '',
    amount_paid: '',
    payment_date: '',
    notes: '',
    bank_account_name: 'Hamid Technology Solution',
    bank_account_no: '01032010046679',
    bank_name: 'Bank Islam Malaysia',
  })

  setOrderItems([
    {
      item_no: 1,
      description: '',
      details: '',
      qty: 1,
      unit_price: 0,
      line_total: 0,
    },
  ])
}



  

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatMoney = (value?: number) => {
  return Number(value || 0).toFixed(2)
}

const openPrintWindow = (title: string, html: string) => {
  const printWindow = window.open('', '_blank', 'width=1000,height=900')

  if (!printWindow) {
    alert('Please allow popups to generate the document.')
    return
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 28px;
            color: #111;
            font-size: 13px;
            line-height: 1.45;
          }
          .doc-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
            letter-spacing: 1px;
          }
          .header-block {
            text-align: left;
            margin-bottom: 20px;
          }
          .company-name {
            font-weight: bold;
            font-size: 15px;
          }
          .row-flex {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 18px;
          }
          .col {
            flex: 1;
          }
          .label {
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 16px;
          }
          th, td {
            border: 1px solid #222;
            padding: 8px;
            vertical-align: top;
          }
          th {
            background: #f4f4f4;
            text-align: left;
          }
          .totals {
            width: 320px;
            margin-left: auto;
            margin-top: 14px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ddd;
            padding: 6px 0;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            gap: 40px;
          }
          .signature-box {
            flex: 1;
            text-align: center;
          }
          .signature-line {
            margin-top: 36px;
            border-top: 1px solid #222;
            padding-top: 6px;
          }
          .bank-box {
            margin-top: 20px;
          }
          .small {
            font-size: 12px;
          }
          @media print {
            body {
              padding: 18px;
            }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

const getCompanyHeaderHtml = () => `
  <div class="header-block">
    <div class="company-name">HAMID TECHNOLOGY SOLUTION (001799902-U)</div>
    <div>(Hamid Tukang Kayu Group of Companies)</div>
    <div>No 5, Jalan Pinggiran Putra 3/5, Desa Pinggiran Putra</div>
    <div>43650 Bangi Selangor</div>
    <div>Tel : 03-89209431</div>
    <div>Email : hamidtechsolution@gmail.com</div>
    <div>Website : www.hamidtukangkayu.com</div>
  </div>
`
const getStampHtml = () => `
  <div style="margin-top: 20px; text-align: right;">
    <img
      src="/stamp-signature-hts.png"
      alt="Hamid Tukang Kayu Stamp"
      style="width: 140px; height: auto; object-fit: contain;"
    />
  </div>
`
const getItemsTableHtml = (items: CustomerOrderItem[]) => `
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">No</th>
        <th>Description</th>
        <th style="width: 70px;">Qty</th>
        <th style="width: 120px;">Unit Price (RM)</th>
        <th style="width: 120px;">Total (RM)</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, index) => `
        <tr>
          <td>${index + 1}.</td>
          <td>
            <div><strong>${item.description || '-'}</strong></div>
            <div class="small">${(item.details || '').replace(/\n/g, '<br/>')}</div>
          </td>
          <td>${item.qty || 0}</td>
          <td>${formatMoney(item.unit_price)}</td>
          <td>${formatMoney(item.line_total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`

const buildCpoHtml = (
  customer: Customer,
  order: CustomerOrder,
  items: CustomerOrderItem[]
) => `
  <div class="doc-title">CUSTOMER PURCHASE ORDER</div>
  ${getCompanyHeaderHtml()}

  <div class="row-flex">
    <div class="col">
      <div><strong>${customer.name || '-'}</strong></div>
      <div>${(customer.address || '-').replace(/\n/g, '<br/>')}</div>
      <div>Attn : ${customer.attention_person || '-'}</div>
      <div>Hp : ${customer.phone || '-'}</div>
    </div>
    <div class="col" style="max-width: 260px;">
      <div><span class="label">CPO NO :</span> ${order.cpo_no || '-'}</div>
      <div><span class="label">Date :</span> ${formatDisplayDate(order.document_date)}</div>
    </div>
  </div>

  ${getItemsTableHtml(items)}

  <div class="totals">
    <div><span>Total Amount</span><span>${formatMoney(order.total_amount)}</span></div>
    <div><span>Amount paid dated ${formatDisplayDate(order.payment_date)}</span><span>${formatMoney(order.amount_paid)}</span></div>
    <div><span>Balance</span><span>${formatMoney(order.balance)}</span></div>
  </div>

  <div style="margin-top: 24px;">Thank you,</div>
  <div> </div>
  
  <div class="signature-row" style="
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 60px;
">

  <!-- LEFT: COMPANY -->
  <div style="width: 45%; text-align: center;">

    <!-- STAMP -->
    <div style="height: 90px; display: flex; justify-content: center; align-items: flex-end;">
      <img
        src="http://localhost:3000/stamp-signature-hts.png"
        style="width: 120px; opacity: 0.8; transform: rotate(-8deg);"
      />
    </div>

    <!-- LINE -->
    <div style="border-top: 1px solid #222; width: 220px; margin: 0 auto 6px auto;"></div>

    <!-- TEXT -->
    <div style="text-align: center;">
      <div>A Rashid Abdul Hamid</div>
      <div>Siti Aidah Abdullah</div>
      <div>Hamid Technology Solution</div>
      <div>019-3890090 / 016-2819826</div>
    </div>
  </div>

  <!-- RIGHT: CUSTOMER -->
  <div style="width: 45%; text-align: center;">

    <!-- empty space to match stamp height -->
    <div style="height: 90px;"></div>

    <!-- LINE -->
    <div style="border-top: 1px solid #222; width: 220px; margin: 0 auto 6px auto;"></div>

    <!-- TEXT -->
    <div style="text-align: center;">
      ${customer.attention_person || 'Customer Signature'}
    </div>

  </div>

</div>

  
    
    

    
`

const buildInvoiceHtml = (
  customer: Customer,
  order: CustomerOrder,
  items: CustomerOrderItem[]
) => `
  <div class="doc-title">INVOICE</div>
  ${getCompanyHeaderHtml()}

  <div class="row-flex">
    <div class="col">
      <div><strong>${customer.name || '-'}</strong></div>
      <div>${(customer.address || '-').replace(/\n/g, '<br/>')}</div>
      <div>Attn : ${customer.attention_person || '-'}</div>
      <div>Hp : ${customer.phone || '-'}</div>
    </div>
    <div class="col" style="max-width: 260px;">
      <div><span class="label">INV NO :</span> ${order.invoice_no || '-'}</div>
      <div><span class="label">Date :</span> ${formatDisplayDate(order.document_date)}</div>
    </div>
  </div>

  ${getItemsTableHtml(items)}

  <div class="totals">
    <div><span>Total Amount</span><span>${formatMoney(order.total_amount)}</span></div>
    <div><span>Amount paid</span><span>${formatMoney(order.amount_paid)}</span></div>
    <div><span>Balance</span><span>${formatMoney(order.balance)}</span></div>
  </div>

  <div class="signature-row" style="
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 60px;
  ">

    <!-- LEFT: COMPANY SIGNATURE -->
    <div style="width: 45%; text-align: center;">
      <div style="text-align: left; margin-bottom: 8px;">Thank you,</div>

      <div style="height: 80px; display: flex; justify-content: center; align-items: flex-end;">
        <img
          src="http://localhost:3000/stamp-signature-hts.png"
          style="width: 120px; opacity: 0.8; transform: rotate(-8deg);"
        />
      </div>

      <div style="border-top: 1px solid #222; width: 220px; margin: 0 auto 6px auto;"></div>

      <div style="text-align: center;">
        <div>A Rashid Abdul Hamid</div>
        <div>Siti Aidah Abdullah</div>
        <div>Hamid Technology Solution</div>
        <div>019-3890090 / 016-2819826</div>
      </div>
    </div>

    <!-- RIGHT: PAYABLE TO -->
    <div style="width: 45%; text-align: left;">
      <div class="bank-box">
        <div><strong>Payable to :-</strong></div>
        <div>${order.bank_account_name || 'Hamid Technology Solution'}</div>
        <div>A/C No : ${order.bank_account_no || '-'}</div>
        <div>${order.bank_name || '-'}</div>
      </div>
    </div>

  </div>
`

const buildReceiptHtml = (
  customer: Customer,
  order: CustomerOrder,
  items: CustomerOrderItem[]
) => `
  <div class="doc-title">RECEIPT</div>
  ${getCompanyHeaderHtml()}

  <div class="row-flex">
    <div class="col">
      <div><strong>${customer.name || '-'}</strong></div>
      <div>${(customer.address || '-').replace(/\n/g, '<br/>')}</div>
      <div>Attn : ${customer.attention_person || '-'}</div>
      <div>Hp : ${customer.phone || '-'}</div>
    </div>
    <div class="col" style="max-width: 260px;">
      <div><span class="label">RECEIPT NO :</span> ${order.receipt_no || '-'}</div>
      <div><span class="label">Date :</span> ${formatDisplayDate(order.document_date)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;">No</th>
        <th>Description</th>
        <th style="width: 140px;">Total (RM)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1.</td>
        <td>
          <div><strong>Total Payment dated ${formatDisplayDate(order.payment_date)}</strong></div>
          <div style="margin-top:8px;"><strong>For</strong></div>
          <div>
            ${items.map(item => `${item.qty} unit ${item.description}`).join(' & ')}
          </div>
          <div class="small" style="margin-top:8px;">
            ${items.map(item => item.details || '').filter(Boolean).join('<br/>')}
          </div>
        </td>
        <td>${formatMoney(order.amount_paid || order.total_amount)}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 24px;">Thank you,</div>

  <div class="signature-row" style="margin-top: 40px;">

  <div style="text-align: left; width: 250px;">

    <!-- SMALL STAMP SPACE -->
    <div style="height: 60px; display: flex; align-items: flex-end;">
      <img
        src="http://localhost:3000/stamp-signature-hts.png"
        style="width: 90px; opacity: 0.8; transform: rotate(-8deg);"
      />
    </div>

    <!-- SMALL SIGNATURE LINE -->
    <div style="border-top: 1px solid #222; width: 180px; margin-bottom: 6px;"></div>

    <!-- TEXT -->
    <div style="font-size: 12px;">
      <div>A Rashid Abdul Hamid</div>
      <div>Siti Aidah Abdullah</div>
      <div>Hamid Technology Solution</div>
      <div>019-3890090 / 016-2819826</div>
    </div>

  </div>

</div>
`

const handleGenerateCpo = async (order: CustomerOrder) => {
  if (!selectedCustomer) return

  const items = await fetchOrderItemsByOrder(order.id)
  const html = buildCpoHtml(selectedCustomer, order, items)
  openPrintWindow(`CPO-${order.cpo_no || order.id}`, html)
}

const handleGenerateInvoice = async (order: CustomerOrder) => {
  if (!selectedCustomer) return

  const items = await fetchOrderItemsByOrder(order.id)
  const html = buildInvoiceHtml(selectedCustomer, order, items)
  openPrintWindow(`Invoice-${order.invoice_no || order.id}`, html)
}

const handleGenerateReceipt = async (order: CustomerOrder) => {
  if (!selectedCustomer) return

  const items = await fetchOrderItemsByOrder(order.id)
  const html = buildReceiptHtml(selectedCustomer, order, items)
  openPrintWindow(`Receipt-${order.receipt_no || order.id}`, html)
}

const buildPaymentInvoiceHtml = (
  customer: Customer,
  order: CustomerOrder,
  payment: CustomerPayment
) => `
  <div class="doc-title">INVOICE</div>
  ${getCompanyHeaderHtml()}

  <div class="row-flex">
    <div class="col">
      <div><strong>${customer.name || '-'}</strong></div>
      <div>${(customer.address || '-').replace(/\n/g, '<br/>')}</div>
      <div>Attn : ${customer.attention_person || '-'}</div>
      <div>Hp : ${customer.phone || '-'}</div>
    </div>
    <div class="col" style="max-width: 260px;">
      <div><span class="label">INV NO :</span> ${payment.invoice_no || '-'}</div>
      <div><span class="label">Date :</span> ${formatDisplayDate(payment.payment_date)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;">No</th>
        <th>Description</th>
        <th style="width: 140px;">Amount (RM)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1.</td>
        <td>
          <div><strong>Payment for order ${order.order_title || order.cpo_no || order.id}</strong></div>
          <div class="small">${payment.notes || '-'}</div>
        </td>
        <td>${formatMoney(payment.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div><span>Invoice Amount</span><span>${formatMoney(payment.amount)}</span></div>
  </div>

  <div class="signature-row" style="
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 60px;
  ">
    <div style="width: 45%; text-align: center;">
      <div style="text-align: left; margin-bottom: 8px;">Thank you,</div>
      <div style="height: 80px; display: flex; justify-content: center; align-items: flex-end;">
        <img
          src="http://localhost:3000/stamp-signature-hts.png"
          style="width: 120px; opacity: 0.8; transform: rotate(-8deg);"
        />
      </div>
      <div style="border-top: 1px solid #222; width: 220px; margin: 0 auto 6px auto;"></div>
      <div style="text-align: center;">
        <div>A Rashid Abdul Hamid</div>
        <div>Siti Aidah Abdullah</div>
        <div>Hamid Technology Solution</div>
        <div>019-3890090 / 016-2819826</div>
      </div>
    </div>

    <div style="width: 45%; text-align: left;">
      <div class="bank-box">
        <div><strong>Payable to :-</strong></div>
        <div>${order.bank_account_name || 'Hamid Technology Solution'}</div>
        <div>A/C No : ${order.bank_account_no || '-'}</div>
        <div>${order.bank_name || '-'}</div>
      </div>
    </div>
  </div>
`

const buildPaymentReceiptHtml = (
  customer: Customer,
  order: CustomerOrder,
  payment: CustomerPayment
) => `
  <div class="doc-title">RECEIPT</div>
  ${getCompanyHeaderHtml()}

  <div class="row-flex">
    <div class="col">
      <div><strong>${customer.name || '-'}</strong></div>
      <div>${(customer.address || '-').replace(/\n/g, '<br/>')}</div>
      <div>Attn : ${customer.attention_person || '-'}</div>
      <div>Hp : ${customer.phone || '-'}</div>
    </div>
    <div class="col" style="max-width: 260px;">
      <div><span class="label">RECEIPT NO :</span> ${payment.receipt_no || '-'}</div>
      <div><span class="label">Date :</span> ${formatDisplayDate(payment.payment_date)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;">No</th>
        <th>Description</th>
        <th style="width: 140px;">Total (RM)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1.</td>
        <td>
          <div><strong>Payment received for order ${order.order_title || order.cpo_no || order.id}</strong></div>
          <div style="margin-top:8px;"><strong>Method:</strong> ${payment.payment_method || '-'}</div>
          <div><strong>Reference:</strong> ${payment.reference_no || '-'}</div>
          <div class="small" style="margin-top:8px;">${payment.notes || '-'}</div>
        </td>
        <td>${formatMoney(payment.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 24px;">Thank you,</div>

  <div class="signature-row" style="margin-top: 40px;">
    <div style="text-align: left; width: 250px;">
      <div style="height: 60px; display: flex; align-items: flex-end;">
        <img
          src="http://localhost:3000/stamp-signature-hts.png"
          style="width: 90px; opacity: 0.8; transform: rotate(-8deg);"
        />
      </div>
      <div style="border-top: 1px solid #222; width: 180px; margin-bottom: 6px;"></div>
      <div style="font-size: 12px;">
        <div>A Rashid Abdul Hamid</div>
        <div>Siti Aidah Abdullah</div>
        <div>Hamid Technology Solution</div>
        <div>019-3890090 / 016-2819826</div>
      </div>
    </div>
  </div>
`

const handleGeneratePaymentInvoice = async (payment: CustomerPayment) => {
  if (!selectedCustomer || !selectedOrder) return
  const html = buildPaymentInvoiceHtml(selectedCustomer, selectedOrder, payment)
  openPrintWindow(`Invoice-${payment.invoice_no || payment.id}`, html)
}

const handleGeneratePaymentReceipt = async (payment: CustomerPayment) => {
  if (!selectedCustomer || !selectedOrder) return
  const html = buildPaymentReceiptHtml(selectedCustomer, selectedOrder, payment)
  openPrintWindow(`Receipt-${payment.receipt_no || payment.id}`, html)
}
  
  const resetForm = () => {
  setForm({
    name: '',
    phone: '',
    address: '',
    attention_person: '',
    serviceType: 'Custom Furniture',
    transactionHistory: ''
  })
  setErrors([])
}

const openEditModal = (customer: Customer) => {
  setEditingCustomer(customer)
  setForm({
    name: customer.name,
    phone: customer.phone,
    address: customer.address || '',
    attention_person: customer.attention_person || '',
    serviceType: customer.serviceType,
    transactionHistory: customer.transactionHistory
  })
  setErrors([])
}

const handleUpdateCustomer = async () => {
  if (!editingCustomer) return

  setIsProcessing(true)
  try {
    const { error } = await supabase
      .from('customerRecord')
      .update({
        name: form.name,
        phone: form.phone,
        address: form.address,
        attention_person: form.attention_person,
        serviceType: form.serviceType,
        transactionHistory: form.transactionHistory
      })
      .eq('recordID', editingCustomer.recordID)

    if (error) throw error

    alert('Customer record updated!')
    setEditingCustomer(null)
    fetchCustomers()
    resetForm()
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}

const handleAddCustomer = async () => {
  const newErrors: string[] = []

  if (!form.name.trim()) newErrors.push('name')
  if (!form.phone.trim()) newErrors.push('phone')
  if (!form.address.trim()) newErrors.push('address')
  if (!form.transactionHistory.trim()) newErrors.push('history')

  if (newErrors.length > 0) {
    setErrors(newErrors)
    return
  }

  setIsProcessing(true)
  try {
    const { error } = await supabase.from('customerRecord').insert([form])
    if (error) throw error

    resetForm()
    fetchCustomers()
    setShowSuccessModal(true)
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}

const handleCreateOrder = async () => {
  if (!selectedCustomer) return

  const validItems = orderItems.filter(
    item => item.description.trim() && Number(item.qty) > 0
  )

  if (validItems.length === 0) {
    alert('Please add at least one valid order item.')
    return
  }

  if (!orderForm.document_date) {
    alert('Please select a document date.')
    return
  }

  setIsProcessing(true)

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('customer_orders')
      .insert([
        {
          customer_id: selectedCustomer.recordID,
          order_title: orderForm.order_title,
          document_date: orderForm.document_date,
          cpo_no: orderForm.cpo_no || null,
          invoice_no: orderForm.invoice_no || null,
          receipt_no: orderForm.receipt_no || null,
          amount_paid: amountPaidNumber,
          payment_date: orderForm.payment_date || null,
          total_amount: totalAmount,
          balance: balanceAmount,
          notes: orderForm.notes || null,
          bank_account_name: orderForm.bank_account_name || null,
          bank_account_no: orderForm.bank_account_no || null,
          bank_name: orderForm.bank_name || null,
        },
      ])
      .select()
      .single()

    if (orderError) throw orderError

    const itemsPayload = validItems.map((item, index) => ({
      order_id: orderData.id,
      item_no: index + 1,
      description: item.description,
      details: item.details || null,
      qty: Number(item.qty),
      unit_price: Number(item.unit_price) || 0,
      line_total: Number(item.line_total) || 0,
    }))

    const { error: itemsError } = await supabase
      .from('customer_order_items')
      .insert(itemsPayload)

    if (itemsError) throw itemsError

    await fetchOrdersByCustomer(selectedCustomer.recordID)
    resetOrderForm()
    setShowCreateOrderModal(false)
    alert('Order created successfully!')
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}


const handleUpdateOrder = async () => {
  if (!selectedCustomer || !editingOrder) return

  const validItems = orderItems.filter(
    item => item.description.trim() && Number(item.qty) > 0
  )

  if (validItems.length === 0) {
    alert('Please add at least one valid order item.')
    return
  }

  if (!orderForm.document_date) {
    alert('Please select a document date.')
    return
  }

  setIsProcessing(true)

  try {
    const { error: updateOrderError } = await supabase
      .from('customer_orders')
      .update({
        order_title: orderForm.order_title || null,
        document_date: orderForm.document_date,
        cpo_no: orderForm.cpo_no || null,
        invoice_no: orderForm.invoice_no || null,
        receipt_no: orderForm.receipt_no || null,
        amount_paid: amountPaidNumber,
        payment_date: orderForm.payment_date || null,
        total_amount: totalAmount,
        balance: balanceAmount,
        notes: orderForm.notes || null,
        bank_account_name: orderForm.bank_account_name || null,
        bank_account_no: orderForm.bank_account_no || null,
        bank_name: orderForm.bank_name || null,
      })
      .eq('id', editingOrder.id)

    if (updateOrderError) throw updateOrderError

    const { error: deleteItemsError } = await supabase
      .from('customer_order_items')
      .delete()
      .eq('order_id', editingOrder.id)

    if (deleteItemsError) throw deleteItemsError

    const itemsPayload = validItems.map((item, index) => ({
      order_id: editingOrder.id,
      item_no: index + 1,
      description: item.description,
      details: item.details || null,
      qty: Number(item.qty),
      unit_price: Number(item.unit_price) || 0,
      line_total: Number(item.line_total) || 0,
    }))

    const { error: insertItemsError } = await supabase
      .from('customer_order_items')
      .insert(itemsPayload)

    if (insertItemsError) throw insertItemsError

    await fetchOrdersByCustomer(selectedCustomer.recordID)
    resetOrderForm()
    setShowCreateOrderModal(false)
    alert('Order updated successfully!')
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}

const handleDeleteOrder = async (order: CustomerOrder) => {
  const confirmed = window.confirm(
    `Delete order "${order.order_title || order.cpo_no || order.id}"?\n\nThis will also remove related items and payment records.`
  )

  if (!confirmed) return

  setIsProcessing(true)

  try {
    // Optional manual cleanup first, in case cascade is not enabled
    const { error: deleteItemsError } = await supabase
      .from('customer_order_items')
      .delete()
      .eq('order_id', order.id)

    if (deleteItemsError) throw deleteItemsError

    const { error: deletePaymentsError } = await supabase
      .from('customer_payments')
      .delete()
      .eq('order_id', order.id)

    if (deletePaymentsError) throw deletePaymentsError

    const { error: deleteOrderError } = await supabase
      .from('customer_orders')
      .delete()
      .eq('id', order.id)

    if (deleteOrderError) throw deleteOrderError

    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null)
      setPayments([])
      setShowPaymentModal(false)
      resetPaymentForm()
    }

    if (editingOrder?.id === order.id) {
      resetOrderForm()
      setShowCreateOrderModal(false)
    }

    if (selectedCustomer) {
      await fetchOrdersByCustomer(selectedCustomer.recordID)
    }

    alert('Order deleted successfully!')
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}


const resetPaymentForm = () => {
  setEditingPayment(null)
  setPaymentForm({
    payment_date: '',
    amount: '',
    payment_method: '',
    reference_no: '',
    notes: '',
    receipt_no: '',
    invoice_no: '',
  })
}

const handleCreatePayment = async () => {
  if (!selectedOrder) return

  const amount = Number(paymentForm.amount) || 0

  if (!paymentForm.payment_date) {
    alert('Please select a payment date.')
    return
  }

  if (amount <= 0) {
    alert('Please enter a valid payment amount.')
    return
  }

  setIsProcessing(true)

  try {
    const { error } = await supabase
      .from('customer_payments')
      .insert([
        {
          order_id: selectedOrder.id,
          payment_date: paymentForm.payment_date,
          amount,
          payment_method: paymentForm.payment_method || null,
          reference_no: paymentForm.reference_no || null,
          notes: paymentForm.notes || null,
          receipt_no: paymentForm.receipt_no || null,
          invoice_no: paymentForm.invoice_no || null,
        },
      ])

    if (error) throw error

    await recalculateOrderPaymentSummary(selectedOrder.id)
    await fetchPaymentsByOrder(selectedOrder.id)

    if (selectedCustomer) {
      await fetchOrdersByCustomer(selectedCustomer.recordID)
    }

    resetPaymentForm()
    alert('Payment added successfully!')
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}

const handleEditPayment = (payment: CustomerPayment) => {
  setEditingPayment(payment)
  setPaymentForm({
    payment_date: payment.payment_date || '',
    amount: String(payment.amount ?? ''),
    payment_method: payment.payment_method || '',
    reference_no: payment.reference_no || '',
    notes: payment.notes || '',
    receipt_no: payment.receipt_no || '',
    invoice_no: payment.invoice_no || '',
  })
}

const handleUpdatePayment = async () => {
  if (!selectedOrder || !editingPayment) return

  const amount = Number(paymentForm.amount) || 0

  if (!paymentForm.payment_date) {
    alert('Please select a payment date.')
    return
  }

  if (amount <= 0) {
    alert('Please enter a valid payment amount.')
    return
  }

  setIsProcessing(true)

  try {
    const { error } = await supabase
      .from('customer_payments')
      .update({
        payment_date: paymentForm.payment_date,
        amount,
        payment_method: paymentForm.payment_method || null,
        reference_no: paymentForm.reference_no || null,
        notes: paymentForm.notes || null,
        receipt_no: paymentForm.receipt_no || null,
        invoice_no: paymentForm.invoice_no || null,
      })
      .eq('id', editingPayment.id)

    if (error) throw error

    await recalculateOrderPaymentSummary(selectedOrder.id)
    await fetchPaymentsByOrder(selectedOrder.id)

    if (selectedCustomer) {
      await fetchOrdersByCustomer(selectedCustomer.recordID)
    }

    resetPaymentForm()
    alert('Payment updated successfully!')
  } catch (err: any) {
    alert(err.message)
  } finally {
    setIsProcessing(false)
  }
}

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesService = selectedService === 'All' || c.serviceType === selectedService;
    return matchesSearch && matchesService;
  });

const totalAmount = orderItems.reduce(
  (sum, item) => sum + (Number(item.line_total) || 0),
  0
)

const amountPaidNumber = Number(orderForm.amount_paid) || 0
const balanceAmount = totalAmount - amountPaidNumber

  if (loading) return <div className="p-10 text-center font-bold">Loading CRM...</div>

  return (
    <div className="flex min-h-screen bg-[#f5efe6]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        
        {/* SUCCESS MODAL - Matches Product Style */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-amber-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowSuccessModal(false); setActiveTab('view'); }} className="bg-amber-700 text-white font-bold py-3 rounded-xl hover:bg-amber-800 transition-all">View CRM List</button>
                <button onClick={() => setShowSuccessModal(false)} className="text-gray-500 font-semibold py-2">Add Another</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL POPUP - Matches Product Style */}
        {editingCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full relative border border-amber-100 shadow-2xl">
              <button onClick={() => setEditingCustomer(null)} className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl">&times;</button>
              <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b pb-4 uppercase tracking-tighter italic">Update Customer Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Customer Name</label>
              <input
                className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
              <input
                className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
              <textarea
                className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Attention Person</label>
              <input
                className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
                value={form.attention_person}
                onChange={e => setForm({ ...form, attention_person: e.target.value })}
              />
            </div>
          </div>

                <div className="space-y-6">
                  <div><label className="text-xs font-bold text-amber-800 uppercase block mb-2">Service Type</label>
                  <select className="w-full border p-3 border-gray-900 rounded-xl bg-white outline-none" value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})}>
                    {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select></div>
                  
                  <div><label className="text-xs font-bold text-amber-800 uppercase block mb-2">Transaction/Project History</label>
                  <textarea className="w-full border p-3 border-gray-900 rounded-xl h-32 mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.transactionHistory} onChange={e => setForm({...form, transactionHistory: e.target.value})} /></div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                <button onClick={() => setEditingCustomer(null)} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                <button onClick={handleUpdateCustomer} disabled={isProcessing} className={`px-12 py-3 rounded-xl font-bold text-white shadow-lg ${isProcessing ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800 transition-all'}`}>Save Updates</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls - Exactly like Product Management */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 tracking-tight">Customer Management</h1>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-amber-100">
            <button onClick={() => setActiveTab('view')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'view' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>View All</button>
            <button onClick={() => setActiveTab('add')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'add' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>Add New</button>
          </div>
        </div>

        {/* --- VIEW ALL TAB --- */}
        {activeTab === 'view' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center w-full">
              <select className="h-12 px-4 border border-amber-100 rounded-xl bg-white text-amber-900 font-semibold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm min-w-[180px]" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="All">All Services</option>
                {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <div className="relative flex-1 w-full">
                <input type="text" placeholder="Search customer name or phone..." className="w-full h-12 pl-4 pr-4 bg-white border border-amber-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-amber-50 border-b border-amber-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Customer Name</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Phone</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Primary Service</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => (
                      <tr key={c.recordID} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-sm text-[#3d2b1f]">{c.name}</td>
                        <td className="p-4 text-sm text-gray-600 font-medium">{c.phone}</td>
                        <td className="p-4 font-bold text-amber-700 text-sm">{c.serviceType}</td>
                        <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleOpenCustomerDetails(c)}
                            className="text-amber-700 font-bold text-xs hover:underline"
                          >
                            Orders
                          </button>

                          <button
                            onClick={() => openEditModal(c)}
                            className="text-blue-600 font-bold text-xs hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
{showOrderModal && selectedCustomer && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl p-8 max-w-5xl w-full relative border border-amber-100 shadow-2xl">
      <button
        onClick={() => setShowOrderModal(false)}
        className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl"
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold text-amber-900 mb-4 border-b pb-4 uppercase tracking-tighter italic">
        {selectedCustomer.name} - Customer Orders
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><span className="font-bold text-gray-700">Phone:</span> {selectedCustomer.phone || '-'}</p>
          <p><span className="font-bold text-gray-700">Address:</span> {selectedCustomer.address || '-'}</p>
        </div>
        <div>
          <p><span className="font-bold text-gray-700">Attention Person:</span> {selectedCustomer.attention_person || '-'}</p>
          <p><span className="font-bold text-gray-700">Primary Service:</span> {selectedCustomer.serviceType || '-'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-amber-800">Order History</h3>
        <button
          onClick={() => setShowCreateOrderModal(true)}
          className="px-5 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition"
        >
          + Create New Order
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-amber-50 border-b border-amber-100">
           
          <tr>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Date</th>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">CPO No</th>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Invoice No</th>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Receipt No</th>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Total</th>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Balance</th>
            <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest text-center">Documents</th>
          </tr>
            
          </thead>
          <tbody>
            {selectedCustomerOrders.length > 0 ? (
              selectedCustomerOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-700">{order.document_date || '-'}</td>
                  <td className="p-4 text-sm text-gray-700">{order.cpo_no || '-'}</td>
                  <td className="p-4 text-sm text-gray-700">{order.invoice_no || '-'}</td>
                  <td className="p-4 text-sm text-gray-700">{order.receipt_no || '-'}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800">RM {Number(order.total_amount || 0).toFixed(2)}</td>
                  <td className="p-4 text-sm font-semibold text-red-600">RM {Number(order.balance || 0).toFixed(2)}</td>
                  <td className="p-4 text-center">
  <div className="flex flex-col gap-2">
    <button
      onClick={() => handleOpenPayments(order)}
      className="px-3 py-1 rounded-lg bg-gray-700 text-white text-xs font-bold hover:bg-gray-800"
    >
      Payments
    </button>

    <button
      onClick={() => handleEditOrder(order)}
      className="px-3 py-1 rounded-lg bg-slate-600 text-white text-xs font-bold hover:bg-slate-700"
    >
      Edit
    </button>

    <button
      onClick={() => handleDeleteOrder(order)}
      className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
    >
      Delete
    </button>

    <button
      onClick={() => handleGenerateCpo(order)}
      className="px-3 py-1 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-800"
    >
      CPO
    </button>

    <button
      onClick={() => handleGenerateInvoice(order)}
      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
    >
      Invoice
    </button>

    <button
      onClick={() => handleGenerateReceipt(order)}
      className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700"
    >
      Receipt
    </button>
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found for this customer yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{showCreateOrderModal && selectedCustomer && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl p-8 max-w-6xl w-full relative border border-amber-100 shadow-2xl">
      <button
        onClick={() => {
          setShowCreateOrderModal(false)
          resetOrderForm()
        }}
        className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl"
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b pb-4 uppercase tracking-tighter italic">
  {editingOrder ? 'Update Order' : 'Create New Order'}
</h2>

      <div className="mb-6 text-sm text-gray-700">
        <p><span className="font-bold">Customer:</span> {selectedCustomer.name}</p>
        <p><span className="font-bold">Phone:</span> {selectedCustomer.phone || '-'}</p>
        <p><span className="font-bold">Address:</span> {selectedCustomer.address || '-'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Order Title</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.order_title}
            onChange={e => setOrderForm({ ...orderForm, order_title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Document Date</label>
          <input
            type="date"
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.document_date}
            onChange={e => setOrderForm({ ...orderForm, document_date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Payment Date</label>
          <input
            type="date"
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.payment_date}
            onChange={e => setOrderForm({ ...orderForm, payment_date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">CPO No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.cpo_no}
            onChange={e => setOrderForm({ ...orderForm, cpo_no: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Invoice No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.invoice_no}
            onChange={e => setOrderForm({ ...orderForm, invoice_no: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Receipt No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.receipt_no}
            onChange={e => setOrderForm({ ...orderForm, receipt_no: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Amount Paid</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.amount_paid}
            onChange={e => setOrderForm({ ...orderForm, amount_paid: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Bank Account Name</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.bank_account_name}
            onChange={e => setOrderForm({ ...orderForm, bank_account_name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Bank Account No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.bank_account_no}
            onChange={e => setOrderForm({ ...orderForm, bank_account_no: e.target.value })}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs font-bold text-gray-400 uppercase">Bank Name</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.bank_name}
            onChange={e => setOrderForm({ ...orderForm, bank_name: e.target.value })}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs font-bold text-gray-400 uppercase">Notes</label>
          <textarea
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={orderForm.notes}
            onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-amber-800">Order Items</h3>
        <button
          type="button"
          onClick={addOrderItemRow}
          className="px-4 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-4">
        {orderItems.map((item, index) => (
          <div key={index} className="border border-amber-100 rounded-2xl p-4 bg-amber-50/40">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <input
                  className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none"
                  value={item.description}
                  onChange={e => updateOrderItem(index, 'description', e.target.value)}
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Details</label>
                <textarea
                  className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none"
                  value={item.details}
                  onChange={e => updateOrderItem(index, 'details', e.target.value)}
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Qty</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none"
                  value={item.qty}
                  onChange={e => updateOrderItem(index, 'qty', Number(e.target.value))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none"
                  value={item.unit_price}
                  onChange={e => updateOrderItem(index, 'unit_price', Number(e.target.value))}
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Total</label>
                <input
                  className="w-full border p-3 border-gray-300 bg-gray-100 rounded-xl mt-1 outline-none"
                  value={Number(item.line_total || 0).toFixed(2)}
                  readOnly
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => removeOrderItemRow(index)}
                  className="w-full px-3 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
                >
                  X
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1 text-sm">
          <p><span className="font-bold">Total Amount:</span> RM {totalAmount.toFixed(2)}</p>
          <p><span className="font-bold">Amount Paid:</span> RM {amountPaidNumber.toFixed(2)}</p>
          <p><span className="font-bold">Balance:</span> RM {balanceAmount.toFixed(2)}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCreateOrderModal(false)
              resetOrderForm()
            }}
            className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={editingOrder ? handleUpdateOrder : handleCreateOrder}
            disabled={isProcessing}
            className={`px-10 py-3 rounded-xl font-bold text-white ${
              isProcessing ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800'
            }`}
          >
            {isProcessing ? 'Saving...' : editingOrder ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showPaymentModal && selectedOrder && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl p-8 max-w-5xl w-full relative border border-amber-100 shadow-2xl">
      <button
        onClick={() => {
          setShowPaymentModal(false)
          resetPaymentForm()
        }}
        className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl"
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b pb-4 uppercase tracking-tighter italic">
        Payment Records
      </h2>

      <div className="mb-6 text-sm text-gray-700">
        <p><span className="font-bold">Order:</span> {selectedOrder.order_title || selectedOrder.cpo_no || '-'}</p>
        <p><span className="font-bold">Total Amount:</span> RM {Number(selectedOrder.total_amount || 0).toFixed(2)}</p>
        <p><span className="font-bold">Total Paid:</span> RM {Number(selectedOrder.amount_paid || 0).toFixed(2)}</p>
        <p><span className="font-bold">Balance:</span> RM {Number(selectedOrder.balance || 0).toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Payment Date</label>
          <input
            type="date"
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.payment_date}
            onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.amount}
            onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Payment Method</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.payment_method}
            onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Reference No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.reference_no}
            onChange={e => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Receipt No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.receipt_no}
            onChange={e => setPaymentForm({ ...paymentForm, receipt_no: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Invoice No</label>
          <input
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.invoice_no}
            onChange={e => setPaymentForm({ ...paymentForm, invoice_no: e.target.value })}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs font-bold text-gray-400 uppercase">Notes</label>
          <textarea
            className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500"
            value={paymentForm.notes}
            onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={resetPaymentForm}
          className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
        >
          Reset
        </button>
        <button
          onClick={editingPayment ? handleUpdatePayment : handleCreatePayment}
          disabled={isProcessing}
          className={`px-8 py-3 rounded-xl font-bold text-white ${
            isProcessing ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800'
          }`}
        >
          {isProcessing ? 'Saving...' : editingPayment ? 'Update Payment' : 'Add Payment'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-amber-50 border-b border-amber-100">
            <tr>
              <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Date</th>
              <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Amount</th>
              <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Method</th>
              <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Receipt No</th>
              <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Invoice No</th>
              <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map(payment => (
                <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-700">{payment.payment_date || '-'}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800">RM {Number(payment.amount || 0).toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-700">{payment.payment_method || '-'}</td>
                  <td className="p-4 text-sm text-gray-700">{payment.receipt_no || '-'}</td>
                  <td className="p-4 text-sm text-gray-700">{payment.invoice_no || '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="px-3 py-1 rounded-lg bg-slate-600 text-white text-xs font-bold hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleGeneratePaymentInvoice(payment)}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                      >
                        Invoice
                      </button>
                      <button
                        onClick={() => handleGeneratePaymentReceipt(payment)}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700"
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No payment records found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}



        {/* --- ADD CUSTOMER TAB - Exactly like Add Product --- */}
        {activeTab === 'add' && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-amber-100 max-w-5xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-amber-900 underline underline-offset-8 decoration-amber-200 uppercase tracking-tighter italic">Register New Customer</h2>
             {errors.length > 0 && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold">⚠️ Please fill up the required fields highlighted in red.</div>}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Customer Full Name</label>
                <input
                  className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${
                    errors.includes('name') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'
                  }`}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                <input
                  className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${
                    errors.includes('phone') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'
                  }`}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Address</label>
                <textarea
                  className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${
                    errors.includes('address') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'
                  }`}
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Attention Person</label>
                <input
                  className="w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors focus:ring-2 focus:ring-amber-500"
                  value={form.attention_person}
                  onChange={e => setForm({ ...form, attention_person: e.target.value })}
                />
              </div>
            </div>
                
                <div className="space-y-4">
                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Primary Service Requested</label>
                  <select className="w-full border border-gray-900 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500 mt-1" value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})}>
                    {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select></div>

                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Project/Transaction History</label>
                  <textarea className={`w-full border p-3 rounded-xl h-32 mt-1 outline-none border-gray-900 transition-colors ${errors.includes('history') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} placeholder="Provide details of products ordered or services rendered..." value={form.transactionHistory} onChange={e => setForm({...form, transactionHistory: e.target.value})} /></div>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                <button onClick={resetForm} className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 border border-gray-200">Reset Form</button>
                <button onClick={handleAddCustomer} disabled={isProcessing} className={`px-12 py-4 rounded-xl font-bold text-white shadow-xl ${isProcessing ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800 transition-all'}`}>
                  {isProcessing ? 'Processing...' : 'Register Customer'}
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}