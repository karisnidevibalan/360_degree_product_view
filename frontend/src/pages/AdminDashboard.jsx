import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiEye, FiDownload, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import { getTextColorForBackground } from '../utils/colorUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadAnalytics();

    // Set up real-time polling every 60 seconds
    const intervalId = setInterval(() => {
      loadAnalytics();
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      const normalized = data && typeof data === 'object' && 'data' in data ? data.data : data;
      setAnalytics(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('AdminDashboard: Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Local tiny fallback image to avoid external placeholder DNS failures
  const createFallbackImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 50, 50);
      ctx.strokeStyle = '#d1d5db';
      ctx.strokeRect(0, 0, 50, 50);
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 10px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Product', 25, 25);
      return canvas.toDataURL();
    } catch {
      return 'data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
    }
  };

  // Prepare safe chart datasets
  const salesByMonth = Array.isArray(analytics?.salesByMonth)
    ? analytics.salesByMonth.map(item => ({
        month: item.month || '',
        sales: Number(item.sales || 0),
        orders: Number(item.orders || 0),
        growth: Number(item.growth || 0)
      }))
    : [];

  const salesByCategory = Array.isArray(analytics?.salesByCategory)
    ? analytics.salesByCategory.map(item => ({
        name: item.name || 'Unknown',
        value: Number(item.value != null ? item.value : item.sales || 0),
        sales: Number(item.sales || 0),
        orders: Number(item.orders || 0),
        percentage: Number(item.percentage || 0)
      }))
    : [];

  const downloadExcelReport = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const summaryData = [
        ['Analytics Report - Generated on', new Date().toISOString()],
        [''],
        ['Summary Statistics'],
        ['Metric', 'Value'],
        ['Total Products', analytics?.totalProducts || 0],
        ['Total Orders', analytics?.totalOrders || 0],
        ['Total Users', analytics?.totalUsers || 0],
        ['Total Revenue', analytics?.totalRevenue || 0],
        ['Average Order Value', analytics?.totalRevenue && analytics?.totalOrders
          ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2)
          : 0
        ],
        ['Products per User', analytics?.totalProducts && analytics?.totalUsers
          ? (analytics.totalProducts / analytics.totalUsers).toFixed(2)
          : 0
        ]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      if (analytics?.salesByMonth && analytics.salesByMonth.length > 0) {
        const salesData = analytics.salesByMonth.map(item => ({
          'Month': item.month,
          'Sales ($)': item.sales,
          'Orders': item.orders || 0,
          'Growth (%)': item.growth || 0
        }));
        const salesSheet = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(workbook, salesSheet, 'Monthly Sales');
      }

      if (analytics?.recentOrders && analytics.recentOrders.length > 0) {
        const ordersData = analytics.recentOrders.map(order => ({
          'Order ID': order.id,
          'Customer Name': order.userName,
          'Customer Email': order.userEmail || 'N/A',
          'Order Date': formatDate(order.date),
          'Total Amount ($)': order.total,
          'Status': order.status,
          'Items Count': order.itemsCount || 'N/A',
          'Payment Method': order.paymentMethod || 'N/A'
        }));
        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Recent Orders');
      }

      if (analytics?.topProducts && analytics.topProducts.length > 0) {
        const productsData = analytics.topProducts.map((product, index) => ({
          'Rank': index + 1,
          'Product ID': product.id,
          'Product Name': product.name,
          'Price ($)': product.price,
          'Rating': product.rating,
          'Total Sales': product.totalSales || 'N/A',
          'Stock Quantity': product.stock || 'N/A',
          'Category': product.category || 'N/A'
        }));
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');
      }

      if (analytics?.salesByCategory && analytics.salesByCategory.length > 0) {
        const categoryData = analytics.salesByCategory.map(category => ({
          'Category': category.name,
          'Sales ($)': category.sales,
          'Percentage (%)': category.percentage,
          'Orders': category.orders || 0
        }));
        const categorySheet = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Sales by Category');
      }

      if (analytics?.userStats && analytics.userStats.length > 0) {
        const usersData = analytics.userStats.map(user => ({
          'User ID': user.id,
          'Name': user.name,
          'Email': user.email,
          'Role': user.role || 'user',
          'Join Date': formatDate(user.joinDate),
          'Total Orders': user.totalOrders || 0,
          'Total Spent ($)': user.totalSpent || 0,
          'Status': user.status || 'Active'
        }));
        const usersSheet = XLSX.utils.json_to_sheet(usersData);
        XLSX.utils.book_append_sheet(workbook, usersSheet, 'Top Users');
      }

      // Add user metrics summary
      if (analytics?.userMetrics) {
        const userMetricsData = [
          ['User Metrics Summary'],
          [''],
          ['Metric', 'Value'],
          ['Total Users', analytics.totalUsers || 0],
          ['Admin Users', analytics.userMetrics.adminCount || 0],
          ['Regular Users', analytics.userMetrics.regularUserCount || 0],
          ['New Users This Month', analytics.userMetrics.newUsersThisMonth || 0],
          ['Average Orders Per User', analytics.userMetrics.averageOrdersPerUser || 0]
        ];
        const userMetricsSheet = XLSX.utils.aoa_to_sheet(userMetricsData);
        XLSX.utils.book_append_sheet(workbook, userMetricsSheet, 'User Metrics');
      }

      const fileName = `admin-analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      alert('Analytics report downloaded successfully!');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  const downloadSalesDataCSV = () => {
    try {
      if (!analytics?.salesByMonth || analytics.salesByMonth.length === 0) {
        alert('No sales data available to download.');
        return;
      }

      const csvContent = [
        ['Month', 'Sales ($)', 'Orders', 'Growth (%)'],
        ...analytics.salesByMonth.map(item => [
          item.month,
          item.sales,
          item.orders || 0,
          item.growth || 0
        ])
      ];

      const csvString = csvContent.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ 
          color: '#4b5563',
          fontSize: '1rem',
          fontWeight: '500',
        }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid #e5e7eb',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
              background: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid #4f46e5',
            }}>
              <FiBarChart2 size={28} color="#4f46e5" />
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.75rem',
          }}>Unable to load analytics data</h3>
          <p style={{
            color: '#6b7280',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}>
            We encountered an issue while loading your dashboard data. 
            Please check your connection and try again.
          </p>
          <button 
            onClick={loadAnalytics}
            style={{
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4338ca';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FiRefreshCw size={18} className="refresh-icon" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Color palette with improved contrast
  const cardColors = [
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  ];
  
  // Text colors with better contrast
  const textColors = {
    primary: '#1f2937',    // Dark gray for primary text
    secondary: '#4b5563',  // Medium gray for secondary text
    light: '#6b7280',      // Light gray for subtle text
    white: '#ffffff',      // White text for dark backgrounds
    error: '#dc2626'       // Red for error states
  };

  // Get text color based on background color
  const getTextColor = (bgColor) => {
    return getTextColorForBackground(bgColor);
  };

  return (
    <div className="container" style={{ 
      padding: '2rem 0',
      backgroundColor: '#e5e7eb',
      minHeight: '100vh',
      color: textColors.primary
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 style={{ 
          margin: 0,
          color: '#1f2937',
          fontWeight: '800',
          fontSize: '2rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>
          Admin Dashboard
        </h1>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <button 
            onClick={downloadExcelReport} 
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              color: textColors.white,
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <FiDownload size={18} />
            <span>Download Report</span>
          </button>
          
          <button 
            onClick={loadAnalytics} 
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              color: textColors.white,
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <FiRefreshCw size={18} className="refresh-icon" />
            <span>Refresh</span>
          </button>
          
          <div style={{
            fontSize: '0.875rem',
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              color: '#e5e7eb',
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
              animation: 'pulse 2s infinite'
            }}></div>
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <StatCard
          icon={FiPackage}
          value={analytics.totalProducts || 0}
          label="Total Products"
          link="/admin/products"
          linkText="View Products"
          bgColor={cardColors[0]}
          iconColor="#ffffff"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            opacity: 0.9,
          }}>
            <FiTrendingUp size={16} />
            <span>+12% from last month</span>
          </div>
        </StatCard>

        <StatCard
          icon={FiShoppingCart}
          value={analytics.totalOrders || 0}
          label="Total Orders"
          link="/admin/orders"
          linkText="View Orders"
          bgColor={cardColors[1]}
          iconColor="#ffffff"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            opacity: 0.9,
          }}>
            <FiTrendingUp size={16} />
            <span>+8% from last month</span>
          </div>
        </StatCard>

        <StatCard
          icon={FiUsers}
          value={analytics.totalUsers || 0}
          label="Total Users"
          link="/admin/users"
          linkText="View Users"
          bgColor={cardColors[2]}
          iconColor="#ffffff"
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            opacity: 0.9,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}></span>
              <span>{analytics.userMetrics?.adminCount || 0} admins</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}></span>
              <span>{analytics.userMetrics?.regularUserCount || 0} users</span>
            </div>
          </div>
        </StatCard>

        <StatCard
          icon={FiDollarSign}
          value={formatPrice(analytics.totalRevenue || 0)}
          label="Total Revenue"
          bgColor={cardColors[3]}
          iconColor="#ffffff"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.75rem',
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}>
            <FiTrendingUp size={16} />
            <span>{analytics.revenueGrowth ? `+${analytics.revenueGrowth}%` : '+8%'} this month</span>
          </div>
        </StatCard>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Sales Chart */}
        <div style={{
          background: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          color: textColors.primary,
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColors.primary,
            }}>Sales Analysis</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setChartType('line')}
                style={{
                  background: chartType === 'line' ? '#4f46e5' : 'transparent',
                  color: chartType === 'line' ? '#ffffff' : textColors.secondary,
                  border: '1px solid',
                  borderColor: chartType === 'line' ? '#4f46e5' : '#e5e7eb',
                  borderRadius: '6px',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                style={{
                  background: chartType === 'bar' ? '#4f46e5' : 'transparent',
                  color: chartType === 'bar' ? '#ffffff' : textColors.secondary,
                  border: '1px solid',
                  borderColor: chartType === 'bar' ? '#4f46e5' : '#e5e7eb',
                  borderRadius: '6px',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Bar
              </button>
              <button 
                onClick={downloadSalesDataCSV}
                style={{
                  background: 'transparent',
                  color: textColors.secondary,
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <FiDownload size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Sales Analysis</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setChartType('line')}
                  className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Bar
                </button>
                <button onClick={downloadSalesDataCSV} className="btn btn-sm btn-success">
                  <FiDownload />
                </button>
              </div>
            </div>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {salesByMonth.length > 0 ? (
              <div style={{
                height: '300px',
                width: '100%',
                position: 'relative',
              }}>
                {chartType === 'line' ? (
                  <Line
                    data={{
                      labels: salesByMonth.map(item => item.month),
                      datasets: [
                        {
                          label: 'Sales Revenue',
                          data: salesByMonth.map(item => item.sales),
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          tension: 0.1,
                          fill: true,
                        },
                        salesByMonth[0] && salesByMonth[0].orders !== undefined ? {
                          label: 'Total Orders',
                          data: salesByMonth.map(item => item.orders),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.1,
                          fill: true,
                        } : null,
                      ].filter(Boolean),
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.datasetIndex === 0) {
                                label += formatPrice(context.parsed.y);
                              } else {
                                label += context.parsed.y;
                              }
                              return label;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        }
                      }
                    }}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: salesByMonth.map(item => item.month),
                      datasets: [
                        {
                          label: 'Sales Revenue',
                          data: salesByMonth.map(item => item.sales),
                          backgroundColor: '#2563eb',
                          borderColor: '#2563eb',
                          borderWidth: 1,
                        },
                        salesByMonth[0] && salesByMonth[0].orders !== undefined ? {
                          label: 'Total Orders',
                          data: salesByMonth.map(item => item.orders),
                          backgroundColor: '#10b981',
                          borderColor: '#10b981',
                          borderWidth: 1,
                        } : null,
                      ].filter(Boolean),
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.datasetIndex === 0) {
                                label += formatPrice(context.parsed.y);
                              } else {
                                label += context.parsed.y;
                              }
                              return label;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        }
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(243, 244, 246, 0.7)',
                borderRadius: '8px',
                border: '1px dashed #e5e7eb',
              }}>
                <FiTrendingUp size={48} color={textColors.light} style={{ marginBottom: '1rem', opacity: 0.7 }} />
                <p style={{ 
                  color: textColors.secondary,
                  margin: 0,
                  fontSize: '0.9375rem',
                  textAlign: 'center',
                  maxWidth: '300px',
                  lineHeight: '1.5',
                }}>
                  No sales data available for charting. Data will appear here once available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div style={{
          background: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          color: textColors.primary,
        }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600',
              color: textColors.primary,
            }}>Sales by Category</h3>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {salesByCategory.length > 0 ? (
              <div style={{
                height: '300px',
                width: '100%',
                position: 'relative',
              }}>
                <Pie
                  data={{
                    labels: salesByCategory.map(item => `${item.name} (${item.percentage}%)`),
                    datasets: [
                      {
                        data: salesByCategory.map(item => item.value),
                        backgroundColor: [
                          '#2563eb',
                          '#10b981',
                          '#f59e0b',
                          '#ef4444',
                          '#8b5cf6',
                          '#06b6d4',
                        ],
                        borderColor: [
                          '#1e40af',
                          '#047857',
                          '#d97706',
                          '#dc2626',
                          '#7c3aed',
                          '#0891b2',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 20,
                          padding: 15,
                        }
                      },
                    tooltip: {
                        callbacks: {
                          label: function(context) {
                            return formatPrice(context.parsed);
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(243, 244, 246, 0.7)',
                borderRadius: '8px',
                border: '1px dashed #e5e7eb',
              }}>
                <FiBarChart2 size={48} color={textColors.light} style={{ marginBottom: '1rem', opacity: 0.7 }} />
                <p style={{ 
                  color: textColors.secondary,
                  margin: 0,
                  fontSize: '0.9375rem',
                  textAlign: 'center',
                  maxWidth: '300px',
                  lineHeight: '1.5',
                }}>
                  No category data available. Data will appear here once available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="btn btn-sm btn-secondary">
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {!analytics.recentOrders || analytics.recentOrders.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem 0' }}>
                No recent orders
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        Order #{order.id}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {order.userName} • {formatDate(order.date)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {formatPrice(order.total)}
                      </div>
                      <span className={`badge badge-${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Top Rated Products</h3>
              <Link to="/admin/products" className="btn btn-sm btn-secondary">
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {!analytics.topProducts || analytics.topProducts.length === 0 ? (
              <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem 0' }}>
                No products found
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)'
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}
                    >
                      {index + 1}
                    </div>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: 'var(--border-radius)'
                      }}
                      onError={(e) => {
                        if (!e.target.src.startsWith('data:')) {
                          e.target.src = createFallbackImage();
                        }
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {formatPrice(product.price)} • ⭐ {product.rating}
                        {product.totalSales && (
                          <span> • {product.totalSales} sold</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Statistics Section */}
      {analytics.userStats && analytics.userStats.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Top Users by Spending</h3>
              <Link to="/admin/users" className="btn btn-sm btn-secondary">
                View All Users
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.userStats.slice(0, 5).map((user, index) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--border-radius)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: user.role === 'admin' ? 'var(--danger)' : 'var(--primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {user.name}
                        {user.role === 'admin' && (
                          <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {formatPrice(user.totalSpent || 0)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {user.totalOrders || 0} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
