import React from 'react'

// • Total Products in Stock
// • Low Stock / Out of Stock Items
// • Pending Receipts
// • Pending Deliveries
// • Internal Transfers Scheduled
export default function page() {
  return (
    <div className='flex'>
      <div className=' h-32 bg-white rounded-lg shadow-md p-4 m-2'>
        <h3 className='text-sm font-medium text-gray-500'>Total Products in Stock</h3>
        <p className='text-2xl font-bold text-gray-900'>1,234</p>
      </div>
      <div className=' h-32 bg-white rounded-lg shadow-md p-4 m-2'>
        <h3 className='text-sm font-medium text-gray-500'>Low Stock / Out of Stock Items</h3>
        <p className='text-2xl font-bold text-gray-900'>56</p>
      </div>
      <div className=' h-32 bg-white rounded-lg shadow-md p-4 m-2'>
        <h3 className='text-sm font-medium text-gray-500'>Pending Receipts</h3>
        <p className='text-2xl font-bold text-gray-900'>12</  p>
      </div>
      <div className=' h-32 bg-white rounded-lg shadow-md p-4 m-2'>
        <h3 className='text-sm font-medium text-gray-500'>Pending Deliveries</h3>
        <p className='text-2xl font-bold text-gray-900'>8</p>
      </div>
      <div className=' h-32 bg-white rounded-lg shadow-md p-4 m-2'>
        <h3 className='text-sm font-medium text-gray-500'>Internal Transfers Scheduled</h3>
        <p className='text-2xl font-bold text-gray-900'>5</p>
      </div>
    </div>
  )
}
