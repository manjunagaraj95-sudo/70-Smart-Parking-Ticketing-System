
import React, { useState, useEffect } from 'react';
// Assume a logo is available or use text
// import Logo from './logo.svg';

// --- RBAC Configuration ---
const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    VEHICLE_OWNER: 'Vehicle Owner',
};

const USER_PERMISSIONS = {
    [ROLES.ADMIN]: {
        canViewDashboard: true,
        canViewTickets: true,
        canCreateTicket: true,
        canEditTicket: true,
        canApproveReject: true,
        canViewAuditLogs: true,
        canExportData: true,
    },
    [ROLES.MANAGER]: {
        canViewDashboard: true,
        canViewTickets: true,
        canCreateTicket: true,
        canEditTicket: true,
        canApproveReject: true,
        canViewAuditLogs: true,
        canExportData: false,
    },
    [ROLES.VEHICLE_OWNER]: {
        canViewDashboard: false, // Or a simplified version
        canViewTickets: true, // Own tickets
        canCreateTicket: false,
        canEditTicket: false,
        canApproveReject: false,
        canViewAuditLogs: false,
        canPayFine: true,
    },
};

// --- Mock Data ---
const MOCK_TICKETS = [
    {
        id: 'PT-00123',
        offense: 'Expired Meter',
        vehiclePlate: 'XYZ 789',
        location: 'Main St & Oak Ave',
        timestamp: '2023-10-26T10:30:00Z',
        amount: 50.00,
        status: 'Pending',
        officerId: 'OFF-001',
        evidencePhotos: ['https://via.placeholder.com/150/0000FF/FFFFFF?text=Photo1', 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Photo2'],
        workflowHistory: [
            { stage: 'Issued', status: 'Completed', date: '2023-10-26', actor: 'Officer Smith', slaStatus: 'Met' },
            { stage: 'Pending Review', status: 'Current', date: null, actor: null, slaStatus: 'At Risk' },
            { stage: 'Payment Due', status: 'Upcoming', date: null, actor: null, slaStatus: null },
            { stage: 'Resolved', status: 'Upcoming', date: null, actor: null, slaStatus: null },
        ],
        auditLog: [
            { timestamp: '2023-10-26T10:30:00Z', actor: 'Officer Smith', action: 'Ticket Issued', details: 'Offense: Expired Meter' },
            { timestamp: '2023-10-26T10:35:00Z', actor: 'System', action: 'Photos Attached', details: '2 evidence photos uploaded' },
        ],
        paymentInfo: null,
    },
    {
        id: 'PT-00124',
        offense: 'Illegal Parking',
        vehiclePlate: 'ABC 123',
        location: 'Park Ave Garage',
        timestamp: '2023-10-25T14:15:00Z',
        amount: 75.00,
        status: 'Approved',
        officerId: 'OFF-002',
        evidencePhotos: ['https://via.placeholder.com/150/FF0000/FFFFFF?text=Photo3'],
        workflowHistory: [
            { stage: 'Issued', status: 'Completed', date: '2023-10-25', actor: 'Officer Johnson', slaStatus: 'Met' },
            { stage: 'Pending Review', status: 'Completed', date: '2023-10-26', actor: 'Manager Lee', slaStatus: 'Met' },
            { stage: 'Payment Due', status: 'Current', date: null, actor: null, slaStatus: 'Met' },
            { stage: 'Resolved', status: 'Upcoming', date: null, actor: null, slaStatus: null },
        ],
        auditLog: [
            { timestamp: '2023-10-25T14:15:00Z', actor: 'Officer Johnson', action: 'Ticket Issued', details: 'Offense: Illegal Parking' },
            { timestamp: '2023-10-26T09:00:00Z', actor: 'Manager Lee', action: 'Ticket Approved', details: 'Reviewed evidence, approved fine.' },
        ],
        paymentInfo: null,
    },
    {
        id: 'PT-00125',
        offense: 'No Permit',
        vehiclePlate: 'DEF 456',
        location: 'University Campus',
        timestamp: '2023-10-24T09:00:00Z',
        amount: 100.00,
        status: 'In Progress',
        officerId: 'OFF-003',
        evidencePhotos: [],
        workflowHistory: [
            { stage: 'Issued', status: 'Completed', date: '2023-10-24', actor: 'Officer Davis', slaStatus: 'Met' },
            { stage: 'Pending Review', status: 'Current', date: null, actor: null, slaStatus: 'Breached' },
            { stage: 'Payment Due', status: 'Upcoming', date: null, actor: null, slaStatus: null },
            { stage: 'Resolved', status: 'Upcoming', date: null, actor: null, slaStatus: null },
        ],
        auditLog: [
            { timestamp: '2023-10-24T09:00:00Z', actor: 'Officer Davis', action: 'Ticket Issued', details: 'Offense: No Permit' },
        ],
        paymentInfo: null,
    },
    {
        id: 'PT-00126',
        offense: 'Double Parking',
        vehiclePlate: 'GHI 012',
        location: 'Downtown District',
        timestamp: '2023-10-23T11:00:00Z',
        amount: 120.00,
        status: 'Rejected',
        officerId: 'OFF-001',
        evidencePhotos: ['https://via.placeholder.com/150/008000/FFFFFF?text=Photo4'],
        workflowHistory: [
            { stage: 'Issued', status: 'Completed', date: '2023-10-23', actor: 'Officer Smith', slaStatus: 'Met' },
            { stage: 'Pending Review', status: 'Completed', date: '2023-10-24', actor: 'Manager Lee', slaStatus: 'Met' },
            { stage: 'Rejected', status: 'Completed', date: '2023-10-24', actor: 'Manager Lee', slaStatus: 'Met' },
            { stage: 'Resolved', status: 'Current', date: null, actor: null, slaStatus: null },
        ],
        auditLog: [
            { timestamp: '2023-10-23T11:00:00Z', actor: 'Officer Smith', action: 'Ticket Issued', details: 'Offense: Double Parking' },
            { timestamp: '2023-10-24T10:00:00Z', actor: 'Manager Lee', action: 'Ticket Rejected', details: 'Insufficient evidence.' },
        ],
        paymentInfo: null,
    },
];

const MOCK_KPIS = [
    { id: 'total-tickets', label: 'Total Tickets Issued', value: 1250, trend: '+5%', isPositive: true },
    { id: 'outstanding-fines', label: 'Outstanding Fines', value: '$85,200', trend: '-2%', isPositive: false },
    { id: 'appeals-in-review', label: 'Appeals in Review', value: 15, trend: '+1', isPositive: false },
    { id: 'payments-processed', label: 'Payments Processed (Today)', value: 88, trend: '+12%', isPositive: true },
];

const MOCK_USERS = {
    'Admin': { name: 'Alice Admin', role: ROLES.ADMIN },
    'Manager': { name: 'Bob Manager', role: ROLES.MANAGER },
    'Owner': { name: 'Charlie Owner', role: ROLES.VEHICLE_OWNER, vehiclePlate: 'ABC 123' },
};

// --- Reusable Components ---

const StatusBadge = ({ status }) => {
    const statusClass = status.toLowerCase().replace(/\s/g, '-');
    return (
        <span className={`status-badge status-${statusClass}`}>
            {status}
        </span>
    );
};

const Header = ({ user, setView, globalSearchTerm, setGlobalSearchTerm }) => (
    <header className="app-header">
        <div className="app-header-brand" onClick={() => setView({ screen: 'DASHBOARD' })} style={{ cursor: 'pointer' }}>
            {/* <img src={Logo} alt="Smart Parking Logo" /> */}
            Smart Parking
        </div>
        <div className="global-search">
            <input
                type="text"
                placeholder="Search tickets, vehicles, officers..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
            />
        </div>
        <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <span>{user?.name || 'Guest'}</span>
            <StatusBadge status={user?.role || 'Guest'} />
        </div>
    </header>
);

const KPICard = ({ kpi }) => (
    <div className="kpi-card">
        <div>
            <div className="kpi-card-value">{kpi?.value}</div>
            <div className="kpi-card-label">{kpi?.label}</div>
        </div>
        <div className={`kpi-card-trend ${kpi?.isPositive ? '' : 'negative'}`}>
            <span className={`icon ${kpi?.isPositive ? 'icon-arrow-up' : 'icon-arrow-down'}`}></span>
            {kpi?.trend}
        </div>
    </div>
);

const TicketCard = ({ ticket, onClick }) => (
    <div className="card" onClick={() => onClick(ticket?.id)}>
        <div className="ticket-card-content">
            <div className="ticket-card-header">
                <div className="ticket-id">#{ticket?.id}</div>
                <StatusBadge status={ticket?.status} />
            </div>
            <div className="ticket-details">
                <strong>Offense:</strong> {ticket?.offense}
            </div>
            <div className="ticket-details">
                <strong>Vehicle:</strong> {ticket?.vehiclePlate}
            </div>
            <div className="ticket-details">
                <strong>Location:</strong> {ticket?.location}
            </div>
            <div className="ticket-details text-right">
                <span style={{ color: 'var(--text-secondary)' }}>Amount:</span> <span className="ticket-amount">${ticket?.amount?.toFixed(2)}</span>
            </div>
        </div>
    </div>
);

const ChartPlaceholder = ({ title, type }) => (
    <div className="chart-container">
        <span>{title} ({type} Chart)</span>
    </div>
);

const MilestoneTracker = ({ workflowHistory }) => (
    <div className="panel-section">
        <h3 className="panel-title">Workflow Progress</h3>
        <div className="milestone-tracker">
            {workflowHistory?.map((stage, index) => (
                <div key={stage?.stage} className="milestone-stage">
                    <div className={`milestone-circle ${stage?.status === 'Completed' ? 'completed' : ''} ${stage?.status === 'Current' ? 'current' : ''}`}>
                        {stage?.status === 'Completed' && <span className="icon icon-check" style={{ color: 'white' }}></span>}
                    </div>
                    <span className={`milestone-label ${stage?.status === 'Current' ? 'current' : ''}`}>{stage?.stage}</span>
                    {stage?.slaStatus === 'Breached' && (
                        <span className="milestone-sla-breach">SLA Breached</span>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ActivityFeed = ({ auditLog }) => (
    <div className="panel-section">
        <h3 className="panel-title">News/Audit Feed</h3>
        <div className="activity-feed-items">
            {auditLog?.length > 0 ? (
                auditLog.map((log, index) => (
                    <div key={index} className="activity-feed-item">
                        <div className="activity-feed-icon"><span className="icon icon-info"></span></div>
                        <div className="activity-feed-content">
                            <div className="activity-feed-meta">
                                {new Date(log?.timestamp).toLocaleString()} by <strong>{log?.actor}</strong>
                            </div>
                            <div className="activity-feed-text">
                                <strong>{log?.action}:</strong> {log?.details}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ color: 'var(--text-placeholder)' }}>No recent activities.</p>
            )}
        </div>
    </div>
);

const RelatedRecords = () => (
    <div className="panel-section">
        <h3 className="panel-title">Related Records</h3>
        <p style={{ color: 'var(--text-placeholder)' }}>No related records found.</p>
        {/* Placeholder for actual related records, e.g., Vehicle history, Officer activity */}
    </div>
);

const DocumentPreview = ({ photos }) => (
    <div className="panel-section">
        <h3 className="panel-title">Evidence & Documents</h3>
        {photos?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                {photos.map((photo, index) => (
                    <img
                        key={index}
                        src={photo}
                        alt={`Evidence ${index + 1}`}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                ))}
            </div>
        ) : (
            <p style={{ color: 'var(--text-placeholder)' }}>No evidence photos available.</p>
        )}
    </div>
);

const TicketForm = ({ ticket, onSave, onCancel, isNew, userRole }) => {
    const [formData, setFormData] = useState(ticket || {
        offense: '',
        vehiclePlate: '',
        location: '',
        amount: 0,
        officerId: isNew ? MOCK_USERS[userRole]?.id || 'OFF-UNKNOWN' : ticket?.officerId, // Auto-populated
        evidencePhotos: [],
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isNew && ticket) {
            setFormData(ticket);
        }
    }, [isNew, ticket]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileUpload = (e) => {
        // Mock file upload
        const files = Array.from(e.target.files);
        // In a real app, you'd upload these and get URLs
        const newPhotos = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            evidencePhotos: [...(prev?.evidencePhotos || []), ...newPhotos]
        }));
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.offense) newErrors.offense = 'Offense is mandatory.';
        if (!formData.vehiclePlate) newErrors.vehiclePlate = 'Vehicle plate is mandatory.';
        if (!formData.location) newErrors.location = 'Location is mandatory.';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be positive.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="panel-section p-lg" style={{ width: '100%', maxWidth: '700px', margin: 'var(--spacing-xl) auto' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)' }}>{isNew ? 'Create New Ticket' : `Edit Ticket #${ticket?.id}`}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="offense">Offense Type <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        id="offense"
                        name="offense"
                        value={formData?.offense || ''}
                        onChange={handleChange}
                        required
                    />
                    {errors?.offense && <p className="form-error">{errors.offense}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="vehiclePlate">Vehicle Plate <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        id="vehiclePlate"
                        name="vehiclePlate"
                        value={formData?.vehiclePlate || ''}
                        onChange={handleChange}
                        required
                    />
                    {errors?.vehiclePlate && <p className="form-error">{errors.vehiclePlate}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="location">Location <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData?.location || ''}
                        onChange={handleChange}
                        required
                    />
                    {errors?.location && <p className="form-error">{errors.location}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Fine Amount ($) <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData?.amount || 0}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                    {errors?.amount && <p className="form-error">{errors.amount}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="officerId">Issuing Officer (Auto-populated)</label>
                    <input
                        type="text"
                        id="officerId"
                        name="officerId"
                        value={formData?.officerId || ''}
                        readOnly
                        style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="evidencePhotos">Evidence Photos</label>
                    <input
                        type="file"
                        id="evidencePhotos"
                        name="evidencePhotos"
                        multiple
                        onChange={handleFileUpload}
                        accept="image/*"
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                        {formData?.evidencePhotos?.map((photo, index) => (
                            <img key={index} src={photo} alt={`Evidence ${index + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit">{isNew ? 'Create Ticket' : 'Save Changes'}</button>
                    <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};


// --- Main Application Component ---
function App() {
    const [userRole, setUserRole] = useState(ROLES.ADMIN); // Default role for demo
    const [user, setUser] = useState(MOCK_USERS[userRole]);
    const [tickets, setTickets] = useState(MOCK_TICKETS);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');

    // Centralized Routing State
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} }); // screen: DASHBOARD | TICKET_DETAIL | CREATE_TICKET | EDIT_TICKET

    useEffect(() => {
        setUser(MOCK_USERS[userRole]);
    }, [userRole]);

    // Handlers
    const handleViewTicketDetail = (ticketId) => {
        setView({ screen: 'TICKET_DETAIL', params: { id: ticketId } });
    };

    const handleCreateTicket = () => {
        setView({ screen: 'CREATE_TICKET' });
    };

    const handleEditTicket = (ticketId) => {
        setView({ screen: 'EDIT_TICKET', params: { id: ticketId } });
    };

    const handleSaveTicket = (newTicketData) => {
        if (view.screen === 'CREATE_TICKET') {
            const newId = `PT-${String(tickets.length + 1).padStart(5, '0')}`;
            const timestamp = new Date().toISOString();
            const newTicket = {
                ...newTicketData,
                id: newId,
                timestamp: timestamp,
                status: 'Pending',
                workflowHistory: [
                    { stage: 'Issued', status: 'Completed', date: timestamp.split('T')[0], actor: newTicketData.officerId, slaStatus: 'Met' },
                    { stage: 'Pending Review', status: 'Current', date: null, actor: null, slaStatus: 'At Risk' },
                    { stage: 'Payment Due', status: 'Upcoming', date: null, actor: null, slaStatus: null },
                    { stage: 'Resolved', status: 'Upcoming', date: null, actor: null, slaStatus: null },
                ],
                auditLog: [
                    { timestamp: timestamp, actor: MOCK_USERS[userRole]?.name, action: 'Ticket Created', details: `New ticket ${newId} issued for ${newTicketData.vehiclePlate}` },
                ],
            };
            setTickets(prevTickets => [...prevTickets, newTicket]);
        } else if (view.screen === 'EDIT_TICKET') {
            setTickets(prevTickets => prevTickets.map(t =>
                t.id === newTicketData.id ? {
                    ...newTicketData,
                    auditLog: [...(newTicketData?.auditLog || []), { timestamp: new Date().toISOString(), actor: MOCK_USERS[userRole]?.name, action: 'Ticket Updated', details: 'Ticket details modified.' }]
                } : t
            ));
        }
        setView({ screen: 'DASHBOARD' });
    };

    const handleApproveRejectTicket = (ticketId, action) => {
        setTickets(prevTickets => prevTickets.map(ticket => {
            if (ticket.id === ticketId) {
                const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
                const currentWorkflow = ticket?.workflowHistory?.map(stage => ({ ...stage })); // Immutable copy
                const pendingReviewStage = currentWorkflow?.find(s => s?.stage === 'Pending Review');
                if (pendingReviewStage) {
                    pendingReviewStage.status = 'Completed';
                    pendingReviewStage.date = new Date().toISOString().split('T')[0];
                    pendingReviewStage.actor = MOCK_USERS[userRole]?.name;
                }
                const nextStage = newStatus === 'Approved' ? 'Payment Due' : 'Rejected';
                const nextStageIndex = currentWorkflow?.findIndex(s => s?.stage === nextStage);
                if (nextStageIndex !== -1) {
                    currentWorkflow[nextStageIndex].status = 'Current';
                } else if (newStatus === 'Rejected') {
                    // Add rejected stage if not present
                    currentWorkflow.push({ stage: 'Rejected', status: 'Current', date: new Date().toISOString().split('T')[0], actor: MOCK_USERS[userRole]?.name, slaStatus: 'Met' });
                }

                return {
                    ...ticket,
                    status: newStatus,
                    workflowHistory: currentWorkflow,
                    auditLog: [
                        ...(ticket?.auditLog || []),
                        { timestamp: new Date().toISOString(), actor: MOCK_USERS[userRole]?.name, action: `Ticket ${newStatus}`, details: `Ticket was ${newStatus.toLowerCase()}.` },
                    ],
                };
            }
            return ticket;
        }));
        setView({ screen: 'TICKET_DETAIL', params: { id: ticketId } }); // Stay on detail view
    };

    // Filter tickets based on global search (simple case-insensitive match)
    const filteredTickets = tickets.filter(ticket =>
        ticket?.id?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        ticket?.offense?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        ticket?.vehiclePlate?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        ticket?.location?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        ticket?.status?.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );

    // Render logic based on `view` state
    const renderScreen = () => {
        const permissions = USER_PERMISSIONS[userRole];

        switch (view.screen) {
            case 'DASHBOARD':
                if (!permissions?.canViewDashboard && userRole !== ROLES.VEHICLE_OWNER) { // Vehicle owners get a custom dashboard later
                    return <h2 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Access Denied: You do not have permission to view the dashboard.</h2>;
                }
                return (
                    <>
                        <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Dashboard</h1>

                        {userRole === ROLES.ADMIN || userRole === ROLES.MANAGER ? (
                            <>
                                <div className="dashboard-grid mb-xl">
                                    {MOCK_KPIS.map(kpi => (
                                        <KPICard key={kpi?.id} kpi={kpi} />
                                    ))}
                                </div>
                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Overview Charts</h2>
                                    <div className="dashboard-grid">
                                        <ChartPlaceholder title="Tickets by Status" type="Donut" />
                                        <ChartPlaceholder title="Fines Collected (Monthly)" type="Line" />
                                        <ChartPlaceholder title="Tickets Issued (Daily)" type="Bar" />
                                        <ChartPlaceholder title="SLA Compliance" type="Gauge" />
                                    </div>
                                </div>
                            </>
                        ) : null}

                        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            Recent Parking Tickets
                            {permissions?.canCreateTicket && (
                                <button onClick={handleCreateTicket}>+ Create New Ticket</button>
                            )}
                        </h2>
                        {filteredTickets.length > 0 ? (
                            <div className="tickets-grid">
                                {filteredTickets
                                    .filter(ticket => userRole === ROLES.VEHICLE_OWNER ? ticket?.vehiclePlate === user?.vehiclePlate : true) // Filter for owner's tickets
                                    .map(ticket => (
                                        <TicketCard
                                            key={ticket?.id}
                                            ticket={ticket}
                                            onClick={handleViewTicketDetail}
                                        />
                                ))}
                            </div>
                        ) : (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xxl)', boxShadow: 'var(--shadow-md)' }}>
                                <h3 style={{ color: 'var(--text-placeholder)' }}>No Tickets Found</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>It looks like there are no parking tickets matching your criteria.</p>
                                {permissions?.canCreateTicket && (
                                    <button onClick={handleCreateTicket} style={{ marginTop: 'var(--spacing-md)' }}>Issue First Ticket</button>
                                )}
                            </div>
                        )}
                    </>
                );

            case 'TICKET_DETAIL':
                const ticket = tickets.find(t => t.id === view.params?.id);
                if (!ticket) return <h2 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Ticket Not Found</h2>;

                const isOwnerOfTicket = userRole === ROLES.VEHICLE_OWNER && ticket.vehiclePlate === user?.vehiclePlate;
                if (!permissions?.canViewTickets && !isOwnerOfTicket) {
                    return <h2 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Access Denied: You do not have permission to view this ticket.</h2>;
                }

                return (
                    <>
                        <div className="breadcrumbs">
                            <a href="#" onClick={() => setView({ screen: 'DASHBOARD' })}>Dashboard</a>
                            <span>/</span>
                            <span>Ticket #{ticket?.id}</span>
                        </div>
                        <div className="detail-view-header">
                            <h1>Ticket #{ticket?.id}</h1>
                            <StatusBadge status={ticket?.status} />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                            {permissions?.canEditTicket && (
                                <button onClick={() => handleEditTicket(ticket?.id)}>
                                    <span className="icon icon-edit"></span> Edit Ticket
                                </button>
                            )}
                            {(permissions?.canApproveReject && ticket?.status === 'Pending') && (
                                <>
                                    <button onClick={() => handleApproveRejectTicket(ticket?.id, 'approve')} style={{ backgroundColor: 'var(--status-approved-border)' }}>
                                        Approve
                                    </button>
                                    <button onClick={() => handleApproveRejectTicket(ticket?.id, 'reject')} style={{ backgroundColor: 'var(--status-rejected-border)' }}>
                                        Reject
                                    </button>
                                </>
                            )}
                            {(permissions?.canPayFine && ticket?.status === 'Approved' && !ticket?.paymentInfo) && (
                                <button onClick={() => alert('Proceed to Payment Gateway for Ticket ' + ticket?.id)}>
                                    Pay Fine
                                </button>
                            )}
                        </div>

                        <div className="record-summary-layout">
                            <div className="summary-main-panel">
                                <div className="panel-section">
                                    <h3 className="panel-title">Ticket Summary</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Offense</strong>
                                            <span>{ticket?.offense}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Vehicle Plate</strong>
                                            <span>{ticket?.vehiclePlate}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Location</strong>
                                            <span>{ticket?.location}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Date Issued</strong>
                                            <span>{new Date(ticket?.timestamp || '').toLocaleString()}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Fine Amount</strong>
                                            <span>${ticket?.amount?.toFixed(2)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <strong>Issuing Officer</strong>
                                            <span>{ticket?.officerId}</span>
                                        </div>
                                    </div>
                                </div>

                                <MilestoneTracker workflowHistory={ticket?.workflowHistory} />
                                <DocumentPreview photos={ticket?.evidencePhotos} />
                            </div>

                            <div className="summary-side-panel">
                                {permissions?.canViewAuditLogs && (
                                    <ActivityFeed auditLog={ticket?.auditLog} />
                                )}
                                <RelatedRecords />
                            </div>
                        </div>
                    </>
                );

            case 'CREATE_TICKET':
                if (!permissions?.canCreateTicket) {
                    return <h2 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Access Denied: You do not have permission to create tickets.</h2>;
                }
                return (
                    <>
                        <div className="breadcrumbs">
                            <a href="#" onClick={() => setView({ screen: 'DASHBOARD' })}>Dashboard</a>
                            <span>/</span>
                            <span>Create Ticket</span>
                        </div>
                        <TicketForm
                            isNew={true}
                            onSave={handleSaveTicket}
                            onCancel={() => setView({ screen: 'DASHBOARD' })}
                            userRole={userRole}
                        />
                    </>
                );

            case 'EDIT_TICKET':
                if (!permissions?.canEditTicket) {
                    return <h2 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Access Denied: You do not have permission to edit tickets.</h2>;
                }
                const ticketToEdit = tickets.find(t => t.id === view.params?.id);
                if (!ticketToEdit) return <h2 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Ticket Not Found for Editing</h2>;
                return (
                    <>
                        <div className="breadcrumbs">
                            <a href="#" onClick={() => setView({ screen: 'DASHBOARD' })}>Dashboard</a>
                            <span>/</span>
                            <a href="#" onClick={() => setView({ screen: 'TICKET_DETAIL', params: { id: ticketToEdit.id } })}>Ticket #{ticketToEdit.id}</a>
                            <span>/</span>
                            <span>Edit</span>
                        </div>
                        <TicketForm
                            isNew={false}
                            ticket={ticketToEdit}
                            onSave={handleSaveTicket}
                            onCancel={() => setView({ screen: 'TICKET_DETAIL', params: { id: ticketToEdit.id } })}
                            userRole={userRole}
                        />
                    </>
                );

            default:
                return <h1 style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Welcome to Smart Parking!</h1>;
        }
    };

    return (
        <div className="app-container">
            <Header
                user={user}
                setView={setView}
                globalSearchTerm={globalSearchTerm}
                setGlobalSearchTerm={setGlobalSearchTerm}
            />
            <main className="main-content">
                {renderScreen()}
            </main>
        </div>
    );
}

export default App;