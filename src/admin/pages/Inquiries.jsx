import React, { useState, useEffect } from 'react';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      } else {
        console.error('Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (inquiry) => {
    setSelectedInquiry(inquiry);
  };

  const closeModal = () => {
    setSelectedInquiry(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Styles
  const pageStyle = { padding: '30px' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
  const breadcrumbStyle = { fontSize: '0.875rem', color: '#6b7280' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' };
  const thStyle = { textAlign: 'left', padding: '12px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' };
  const tdStyle = { padding: '16px 24px', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#111827' };
  const badgeStyle = { display: 'inline-block', backgroundColor: '#0ea5e9', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', marginTop: '4px' };
  const buttonStyle = { backgroundColor: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' };

  // Modal Styles
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const modalLabelStyle = { fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', display: 'block' };
  const modalValueStyle = { fontSize: '0.9rem', color: '#111827', marginBottom: '16px', display: 'block' };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>All Inquiries</h1>
          <div style={breadcrumbStyle}>Admin / All Inquiries</div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Client Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone Number</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '500' }}>{inquiry.client_name}</div>
                  <div style={badgeStyle}>Received on - {formatDate(inquiry.created_at)}</div>
                </td>
                <td style={tdStyle}>{inquiry.email}</td>
                <td style={tdStyle}>{inquiry.phone}</td>
                <td style={tdStyle}>{inquiry.subject}</td>
                <td style={tdStyle}>
                  <button style={buttonStyle} onClick={() => openModal(inquiry)}>View Message</button>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>No inquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedInquiry && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem' }}>Inquiry Details</h2>

            <label style={modalLabelStyle}>Client Name</label>
            <span style={modalValueStyle}>{selectedInquiry.client_name}</span>

            <label style={modalLabelStyle}>Email</label>
            <span style={modalValueStyle}>{selectedInquiry.email}</span>

            <label style={modalLabelStyle}>Phone</label>
            <span style={modalValueStyle}>{selectedInquiry.phone}</span>

            <label style={modalLabelStyle}>Received Date</label>
            <span style={modalValueStyle}>{formatDate(selectedInquiry.created_at)}</span>

            <label style={modalLabelStyle}>Subject</label>
            <span style={modalValueStyle}>{selectedInquiry.subject}</span>

            <label style={modalLabelStyle}>Message</label>
            <p style={{ ...modalValueStyle, backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
              {selectedInquiry.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={buttonStyle} onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
