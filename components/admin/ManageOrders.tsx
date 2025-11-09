import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner, Modal, Card, Badge, Form, Alert, Toast } from "react-bootstrap";
import axios from "axios";

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // تعديل الطلب
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState({
        _id: "",
        selectedCategory: "",
        link: "",
        quantity: "",
        totalCost: "",
        status: "",
        username: "",
        serviceTitle: "",
        order_number: ""
    });

    // حالات التحميل
    const [updatingAll, setUpdatingAll] = useState(false);
    const [updatingOrders, setUpdatingOrders] = useState({});

    const showNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleShowEditModal = (order) => {
        setEditingOrder({
            _id: order._id,
            selectedCategory: order.selectedCategory,
            link: order.link,
            quantity: order.quantity,
            totalCost: order.totalCost,
            status: order.status,
            username: order.username,
            serviceTitle: order.serviceTitle,
            order_number: order.order_number
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingOrder({
            _id: "",
            selectedCategory: "",
            link: "",
            quantity: "",
            totalCost: "",
            status: "",
            username: "",
            serviceTitle: "",
            order_number: ""
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingOrder({ ...editingOrder, [name]: value });
    };

    const handleEditOrder = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/new-order/${editingOrder._id}`, {
                selectedCategory: editingOrder.selectedCategory,
                link: editingOrder.link,
                quantity: editingOrder.quantity,
                totalCost: editingOrder.totalCost,
                status: editingOrder.status,
                username: editingOrder.username,
                serviceTitle: editingOrder.serviceTitle
            });

            setOrders(orders.map(order =>
                order._id === editingOrder._id
                    ? {
                        ...order,
                        selectedCategory: editingOrder.selectedCategory,
                        link: editingOrder.link,
                        quantity: editingOrder.quantity,
                        totalCost: editingOrder.totalCost,
                        status: editingOrder.status,
                        username: editingOrder.username,
                        serviceTitle: editingOrder.serviceTitle
                    }
                    : order
            ));

            showNotification("تم تعديل الطلب بنجاح ✅");
            handleCloseEditModal();
        } catch (err) {
            console.error("Edit order error:", err);
            showNotification("حدث خطأ أثناء التعديل ❌");
        }
    };

    // تحميل الطلبات من الـ API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/new-order`);
                setOrders(res.data);
                setLastUpdate(new Date());
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleView = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/new-order/${id}`);
                setOrders(orders.filter((order) => order._id !== id));
                showNotification("تم حذف الطلب بنجاح ✅");
            } catch (err) {
                console.error("Delete error:", err);
                showNotification("حدث خطأ أثناء الحذف ❌");
            }
        }
    };

    // تحديث حالة طلب واحد
    const handleUpdateSingleStatus = async (orderId, providerOrderId) => {
        if (!providerOrderId) {
            showNotification("لا يوجد providerOrderId لهذا الطلب ❌");
            return;
        }

        setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order/status/${providerOrderId}`);
            const newStatus = response.data.status;

            // تحديث الطلب في قاعدة البيانات
            await axios.patch(`${import.meta.env.VITE_API_URL}/new-order/${orderId}`, {
                status: newStatus
            });

            // تحديث الواجهة فوراً
            setOrders(orders.map(order =>
                order._id === orderId
                    ? { ...order, status: newStatus }
                    : order
            ));

            setLastUpdate(new Date());
            showNotification(`تم تحديث حالة الطلب إلى: ${newStatus} ✅`);
        } catch (err) {
            console.error("Error updating single status:", err);
            showNotification(err.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب ❌");
        } finally {
            setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // تحديث جميع الحالات مرة واحدة
    const handleUpdateAllStatuses = async () => {
        setUpdatingAll(true);
        let updatedCount = 0;
        let errorCount = 0;

        try {
            // استخدم Promise.allSettled لمعالجة جميع الطلبات حتى لو فشل بعضها
            const results = await Promise.allSettled(
                orders.map(async (order) => {
                    if (!order.providerOrderId) return;

                    try {
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order/status/${order.providerOrderId}`);
                        const newStatus = response.data.status;

                        await axios.patch(`${import.meta.env.VITE_API_URL}/new-order/${order._id}`, {
                            status: newStatus
                        });

                        return { orderId: order._id, newStatus };
                    } catch (err) {
                        console.error(`Error updating order ${order._id}:`, err);
                        throw err;
                    }
                })
            );

            // تحديث الواجهة بناءً على النتائج
            const updatedOrders = [...orders];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const { orderId, newStatus } = result.value;
                    const orderIndex = updatedOrders.findIndex(order => order._id === orderId);
                    if (orderIndex !== -1) {
                        updatedOrders[orderIndex].status = newStatus;
                        updatedCount++;
                    }
                } else {
                    errorCount++;
                }
            });

            setOrders(updatedOrders);
            setLastUpdate(new Date());

            if (errorCount === 0) {
                showNotification(`تم تحديث جميع الطلبات بنجاح (${updatedCount} طلب) ✅`);
            } else {
                showNotification(`تم تحديث ${updatedCount} طلب، وفشل ${errorCount} طلب ⚠️`);
            }
        } catch (err) {
            console.error("Error updating all statuses:", err);
            showNotification("حدث خطأ أثناء تحديث الحالات ❌");
        } finally {
            setUpdatingAll(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === "completed") return "success";
        if (status === "in progress") return "warning";
        if (status === "pending") return "secondary";
        if (status === "cancelled") return "danger";
        if (status === "failed") return "danger";
        if (status === "processing") return "warning";
        return "secondary";
    };

    const getCategoryBadge = (category) => {
        const categoryColors = {
            "TikTok": "primary",
            "Instagram": "danger",
            "YouTube": "danger",
            "Facebook": "info",
            "Twitter": "info",
            "Telegram": "primary"
        };
        return categoryColors[category] || "secondary";
    };

    const getRowStyle = (orderId) => ({
        backgroundColor: hoveredRow === orderId ? "#2f3450" : "transparent",
        borderBottom: "1px solid #2f3450",
        transition: "background-color 0.3s"
    });

    const formatDate = (dateString) => {
        if (!dateString) return "لم يتم التحديث بعد";
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPlatformIcon = (category) => {
        const icons = {
            "TikTok": "fab fa-tiktok",
            "Instagram": "fab fa-instagram",
            "YouTube": "fab fa-youtube",
            "Facebook": "fab fa-facebook",
            "Twitter": "fab fa-twitter",
            "Telegram": "fab fa-telegram"
        };
        return icons[category] || "fas fa-link";
    };

    // فلترة الطلبات حسب البحث
    const filteredOrders = orders.filter(order =>
        order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.selectedCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number?.toString().includes(searchTerm) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // التحديث التلقائي كل 30 ثانية
    useEffect(() => {
        const interval = setInterval(() => {
            if (orders.length > 0) {
                handleUpdateAllStatuses();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [orders]);

    return (
        <div
            style={{
                backgroundColor: "#1e2235",
                minHeight: "100vh",
                padding: "20px",
                color: "#fff",
            }}
        >
            <Container fluid>
                {/* Toast للإشعارات */}
                <div
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        zIndex: 9999
                    }}
                >
                    <Toast show={showToast} onClose={() => setShowToast(false)} bg="dark">
                        <Toast.Header closeButton>
                            <strong className="me-auto">إشعار</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                    </Toast>
                </div>

                {/* العنوان الرئيسي */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0" style={{ color: "#ffffff" }}>إدارة الطلبات</h2>
                    <div className="d-flex gap-2 align-items-center">
                        {/* إشعار آخر تحديث */}
                        {lastUpdate && (
                            <small className="text-muted me-3 d-none d-md-block">
                                آخر تحديث: {formatDate(lastUpdate)}
                            </small>
                        )}

                        {/* زر تحديث الكل */}
                        <Button
                            variant="outline-success"
                            onClick={handleUpdateAllStatuses}
                            disabled={updatingAll || orders.length === 0}
                            style={{
                                border: "1px solid #28a745",
                                borderRadius: "8px",
                                padding: "10px 15px",
                                color: "#28a745"
                            }}
                        >
                            {updatingAll ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    <span className="d-none d-md-inline">جاري التحديث...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sync-alt me-2"></i>
                                    <span className="d-none d-md-inline">تحديث جميع الحالات</span>
                                    <span className="d-inline d-md-none">تحديث الكل</span>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline-primary"
                            onClick={() => window.location.reload()}
                            style={{
                                border: "1px solid #4a90e2",
                                borderRadius: "8px",
                                padding: "10px 15px",
                                color: "#4a90e2"
                            }}
                        >
                            <i className="fas fa-sync-alt me-2"></i>
                            <span className="d-none d-md-inline">تحديث الصفحة</span>
                            <span className="d-inline d-md-none">تحديث</span>
                        </Button>
                    </div>
                </div>

                {/* حقل البحث */}
                <Card className="mb-4" style={{ backgroundColor: "#252a41", border: "none", borderRadius: "15px" }}>
                    <Card.Body>
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Control
                                        type="text"
                                        placeholder="ابحث بالمستخدم، الخدمة، المنصة، رقم الطلب، أو الحالة..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            backgroundColor: "#f6f7ffff",
                                            border: "1px solid #4a90e2",
                                            color: "white",
                                            borderRadius: "8px",
                                            padding: "12px"
                                        }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 text-md-end text-center mt-2 mt-md-0">
                                <span className="text-muted">
                                    إجمالي الطلبات: {orders.length} | المعروض: {filteredOrders.length}
                                </span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* بطاقات الإحصائيات */}
                <div className="row justify-content-center mb-4 text-center">
                    <div className="col-6 col-md-3 mb-3">
                        <Card
                            className="h-100"
                            style={{
                                backgroundColor: "#4a90e2",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
                                minHeight: "120px",
                            }}
                        >
                            <Card.Body className="text-white d-flex flex-column justify-content-center align-items-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-shopping-cart fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>إجمالي الطلبات</p>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3 mb-3">
                        <Card
                            className="h-100"
                            style={{
                                backgroundColor: "#2ecc71",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: "0 4px 12px rgba(46, 204, 113, 0.3)",
                                minHeight: "120px",
                            }}
                        >
                            <Card.Body className="text-white d-flex flex-column justify-content-center align-items-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-check-circle fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.filter((order) => order.status === "completed").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>الطلبات المكتملة</p>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3 mb-3">
                        <Card
                            className="h-100"
                            style={{
                                backgroundColor: "#f39c12",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: "0 4px 12px rgba(243, 156, 18, 0.3)",
                                minHeight: "120px",
                            }}
                        >
                            <Card.Body className="text-white d-flex flex-column justify-content-center align-items-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-spinner fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.filter((order) => order.status === "in progress").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>قيد التنفيذ</p>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3 mb-3">
                        <Card
                            className="h-100"
                            style={{
                                backgroundColor: "#e74c3c",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                                minHeight: "120px"
                            }}
                        >
                            <Card.Body className="text-center text-white d-flex flex-column justify-content-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-clock fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.filter(order => order.status === "pending").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>الطلبات المعلقة</p>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* جدول الطلبات - للشاشات الكبيرة */}
                <div className="d-none d-md-block">
                    <Card style={{ backgroundColor: "#252a41", border: "none", borderRadius: "15px" }}>
                        <Card.Header style={{ backgroundColor: "#2f3450", border: "none", padding: "20px" }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0" style={{ color: "#ffffff" }}>قائمة الطلبات</h5>
                                {lastUpdate && (
                                    <small className="text-muted">
                                        آخر تحديث للحالات: {formatDate(lastUpdate)}
                                    </small>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="light" />
                                </div>
                            ) : (
                                <Table responsive hover className="mb-0" style={{ color: "#ffffff" }}>
                                    <thead style={{ backgroundColor: "#2f3450" }}>
                                        <tr>
                                            <th>#</th>
                                            <th>رقم الطلب</th>
                                            <th>المنصة</th>
                                            <th>الخدمة</th>
                                            <th>الرابط</th>
                                            <th>الكمية</th>
                                            <th>التكلفة</th>
                                            <th>المستخدم</th>
                                            <th>الحالة</th>
                                            <th>التاريخ</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length > 0 ? (
                                            filteredOrders.map((order, index) => (
                                                <tr
                                                    key={order._id}
                                                    style={getRowStyle(order._id)}
                                                    onMouseEnter={() => setHoveredRow(order._id)}
                                                    onMouseLeave={() => setHoveredRow(null)}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <Badge bg="light" text="dark">
                                                            #{order.order_number}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg={getCategoryBadge(order.selectedCategory)}>
                                                            <i className={`${getPlatformIcon(order.selectedCategory)} me-1`}></i>
                                                            {order.selectedCategory}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold" style={{ fontSize: "14px" }}>
                                                            {order.serviceTitle}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <a
                                                            href={order.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-info text-decoration-none"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            <i className="fas fa-external-link-alt me-1"></i>
                                                            رابط
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold">{order.quantity?.toLocaleString()}</span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold text-success">${order.totalCost}</span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                                style={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    backgroundColor: "#4a90e2",
                                                                    color: "white",
                                                                    fontSize: "12px",
                                                                    fontWeight: "bold"
                                                                }}
                                                            >
                                                                {order.username?.charAt(0) || "م"}
                                                            </div>
                                                            <span>{order.username}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={getStatusBadge(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <small>{formatDate(order.createdAt)}</small>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-info"
                                                                onClick={() => handleView(order)}
                                                            >
                                                                <i className="fas fa-eye me-1"></i>
                                                                عرض
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-warning"
                                                                onClick={() => handleShowEditModal(order)}
                                                            >
                                                                <i className="fas fa-edit me-1"></i>
                                                                تعديل
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-success"
                                                                onClick={() => handleUpdateSingleStatus(order._id, order.providerOrderId)}
                                                                disabled={updatingOrders[order._id] || !order.providerOrderId}
                                                            >
                                                                {updatingOrders[order._id] ? (
                                                                    <Spinner animation="border" size="sm" />
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-sync-alt me-1"></i>
                                                                        تحديث
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                onClick={() => handleDelete(order._id)}
                                                            >
                                                                <i className="fas fa-trash me-1"></i>
                                                                حذف
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="text-center text-muted py-4">
                                                    <i className="fas fa-shopping-cart fa-2x mb-3 d-block"></i>
                                                    {orders.length === 0 ? 'لا توجد طلبات' : 'لم يتم العثور على طلبات'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* تصميم البطاقات للهواتف */}
                <div className="d-block d-md-none">
                    <Card style={{ backgroundColor: "#252a41", border: "none", borderRadius: "15px" }}>
                        <Card.Header style={{ backgroundColor: "#2f3450", border: "none", padding: "15px" }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0" style={{ color: "#ffffff" }}>قائمة الطلبات</h5>
                                {lastUpdate && (
                                    <small className="text-white" style={{ fontSize: "0.7rem" }}>
                                        {formatDate(lastUpdate)}
                                    </small>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="light" />
                                </div>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order, index) => (
                                    <div
                                        key={order._id}
                                        className="border-bottom border-gray-600 p-3 hover-bg"
                                        style={{
                                            backgroundColor: hoveredRow === order._id ? "#2f3450" : "transparent",
                                            transition: "background-color 0.3s"
                                        }}
                                        onMouseEnter={() => setHoveredRow(order._id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        {/* رأس البطاقة */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        backgroundColor: "#4a90e2",
                                                        color: "white",
                                                        fontSize: "14px",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    <i className={getPlatformIcon(order.selectedCategory)}></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-white">{order.serviceTitle}</div>
                                                    <div className="text-muted small">#{order.order_number}</div>
                                                </div>
                                            </div>
                                            <Badge bg={getStatusBadge(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </div>

                                        {/* معلومات الطلب */}
                                        <div className="row mb-3">
                                            <div className="col-6">
                                                <div className="text-white small">المستخدم</div>
                                                <div className="text-white fw-bold">{order.username}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-white small">المنصة</div>
                                                <div>
                                                    <Badge bg={getCategoryBadge(order.selectedCategory)}>
                                                        {order.selectedCategory}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-6">
                                                <div className="text-white small">الكمية</div>
                                                <div className="text-white fw-bold">{order.quantity?.toLocaleString()}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-white small">التكلفة</div>
                                                <div className="text-success fw-bold">${order.totalCost}</div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="text-white small">الرابط</div>
                                            <a
                                                href={order.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-info text-decoration-none small"
                                            >
                                                <i className="fas fa-external-link-alt me-1"></i>
                                                عرض الرابط
                                            </a>
                                        </div>

                                        <div className="mb-3">
                                            <div className="text-white small">التاريخ</div>
                                            <div className="text-white small">{formatDate(order.createdAt)}</div>
                                        </div>

                                        {/* أزرار الإجراءات */}
                                        <div className="d-flex gap-2 flex-wrap">
                                            <Button
                                                size="sm"
                                                variant="outline-info"
                                                onClick={() => handleView(order)}
                                                className="flex-fill"
                                            >
                                                <i className="fas fa-eye me-1"></i>
                                                عرض
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-warning"
                                                onClick={() => handleShowEditModal(order)}
                                                className="flex-fill"
                                            >
                                                <i className="fas fa-edit me-1"></i>
                                                تعديل
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleUpdateSingleStatus(order._id, order.providerOrderId)}
                                                disabled={updatingOrders[order._id] || !order.providerOrderId}
                                                className="flex-fill"
                                            >
                                                {updatingOrders[order._id] ? (
                                                    <Spinner animation="border" size="sm" />
                                                ) : (
                                                    <>
                                                        <i className="fas fa-sync-alt me-1"></i>
                                                        تحديث
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDelete(order._id)}
                                                className="flex-fill"
                                            >
                                                <i className="fas fa-trash me-1"></i>
                                                حذف
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-shopping-cart fa-2x mb-3 d-block"></i>
                                    {orders.length === 0 ? 'لا توجد طلبات' : 'لم يتم العثور على طلبات'}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* باقي المودالات بدون تغيير */}
                {/* مودال عرض الطلب */}
                <Modal show={showModal} onHide={handleCloseModal} centered size="lg" style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{ backgroundColor: "#2f3450", color: "white" }}>
                        <Modal.Title>تفاصيل الطلب</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#96979dff", color: "white" }}>
                        {selectedOrder ? (
                            <div className="row">
                                <div className="col-12 text-center mb-4">
                                    <div
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            backgroundColor: "#4a90e2",
                                            color: "white",
                                            fontSize: "24px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        <i className={getPlatformIcon(selectedOrder.selectedCategory)}></i>
                                    </div>
                                    <h4 style={{ color: "#ffffff" }}>طلب #{selectedOrder.order_number}</h4>
                                    <p className="text-muted">{selectedOrder.serviceTitle}</p>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <strong>المنصة:</strong>
                                    <p>
                                        <Badge bg={getCategoryBadge(selectedOrder.selectedCategory)}>
                                            {selectedOrder.selectedCategory}
                                        </Badge>
                                    </p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>الحالة:</strong>
                                    <p>
                                        <Badge bg={getStatusBadge(selectedOrder.status)}>
                                            {selectedOrder.status}
                                        </Badge>
                                    </p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>المستخدم:</strong>
                                    <p>{selectedOrder.username}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>رقم الطلب:</strong>
                                    <p>#{selectedOrder.order_number}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>الرابط:</strong>
                                    <p>
                                        <a href={selectedOrder.link} target="_blank" rel="noopener noreferrer" className="text-info">
                                            {selectedOrder.link}
                                        </a>
                                    </p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>الكمية:</strong>
                                    <p>{selectedOrder.quantity?.toLocaleString()}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>التكلفة:</strong>
                                    <p className="text-success">${selectedOrder.totalCost}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>تاريخ الإنشاء:</strong>
                                    <p>{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <div className="col-12 mb-3">
                                    <strong>الخدمة:</strong>
                                    <p>{selectedOrder.serviceTitle}</p>
                                </div>
                            </div>
                        ) : (
                            <p>جاري التحميل...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "#252a41", border: "none" }}>
                        <Button variant="secondary" onClick={handleCloseModal}>إغلاق</Button>
                    </Modal.Footer>
                </Modal>

                {/* مودال تعديل الطلب */}
                <Modal show={showEditModal} onHide={handleCloseEditModal} centered style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{ backgroundColor: "#2f3450", color: "white" }}>
                        <Modal.Title>تعديل الطلب</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#96979dff", color: "white" }}>
                        <div className="mb-3">
                            <label className="form-label">المنصة</label>
                            <select
                                name="selectedCategory"
                                className="form-select"
                                value={editingOrder.selectedCategory}
                                onChange={handleEditInputChange}
                            >
                                <option value="TikTok">TikTok</option>
                                <option value="Instagram">Instagram</option>
                                <option value="YouTube">YouTube</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Twitter">Twitter</option>
                                <option value="Telegram">Telegram</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الرابط</label>
                            <input
                                type="text"
                                name="link"
                                className="form-control"
                                value={editingOrder.link}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الكمية</label>
                            <input
                                type="number"
                                name="quantity"
                                className="form-control"
                                value={editingOrder.quantity}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">التكلفة</label>
                            <input
                                type="number"
                                name="totalCost"
                                className="form-control"
                                value={editingOrder.totalCost}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الحالة</label>
                            <select
                                name="status"
                                className="form-select"
                                value={editingOrder.status}
                                onChange={handleEditInputChange}
                            >
                                <option value="pending">pending</option>
                                <option value="in progress">in progress</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                                <option value="failed">failed</option>
                                <option value="processing">processing</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">المستخدم</label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                value={editingOrder.username}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الخدمة</label>
                            <input
                                type="text"
                                name="serviceTitle"
                                className="form-control"
                                value={editingOrder.serviceTitle}
                                onChange={handleEditInputChange}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "#252a41", border: "none" }}>
                        <Button variant="secondary" onClick={handleCloseEditModal}>إلغاء</Button>
                        <Button
                            variant="primary"
                            onClick={handleEditOrder}
                            style={{ backgroundColor: "#4a90e2", border: "none" }}
                        >
                            حفظ التعديلات
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default OrdersManagement;
