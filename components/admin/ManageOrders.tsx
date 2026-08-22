import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner, Modal, Card, Badge, Form, Alert, Toast } from "react-bootstrap";
import axios from "axios";
import { useThemeStore } from "@/store/theme.store";
import { useCurrency } from "@/contexts/CurrencyContext";
const OrdersManagement = () => {
    const [orders, setOrders] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [lastUpdate, setLastUpdate] = useState<any>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const { formatPrice } = useCurrency();
    const workerPath = './orderStatusWorker.js';
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

    });

    const [updatingAll, setUpdatingAll] = useState(false);
    const [updatingOrders, setUpdatingOrders] = useState<any>({});

    const showNotification = (message: any) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleShowEditModal = (order: any) => {
        setEditingOrder({
            _id: order._id,
            selectedCategory: order.selectedCategory,
            link: order.link,
            quantity: order.quantity,
            totalCost: order.totalCost,
            status: order.status,
            username: order.username,
            serviceTitle: order.serviceTitle,
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
        });
    };

    const handleEditInputChange = (e: any) => {
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
            }, {
                withCredentials: true,
            });

            setOrders(orders.map((order: any) =>
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

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/new-order`, {
                    withCredentials: true
                });
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

    const handleView = (order: any) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    // const handleDelete = async (id: any) => {
    //     if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
    //         try {
    //             await axios.delete(`${import.meta.env.VITE_API_URL}/new-order/${id}`, {
    //                 withCredentials: true
    //             });
    //             setOrders(orders.filter((order: any) => order._id !== id));
    //             showNotification("تم حذف الطلب بنجاح ✅");
    //         } catch (err) {
    //             console.error("Delete error:", err);
    //             showNotification("حدث خطأ أثناء الحذف ❌");
    //         }
    //     }
    // };

    const handleUpdateSingleStatus = async (orderId: any, providerOrderId: any) => {
        if (!orderId) {
            showNotification("لا يوجد orderNumber لهذا الطلب ❌");
            return;
        }

        setUpdatingOrders((prev: any) => ({ ...prev, [orderId]: true }));

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order/status/${providerOrderId}`, {
                withCredentials: true
            });
            const newStatus = response.data.status;

            await axios.patch(`${import.meta.env.VITE_API_URL}/new-order/${orderId}`, {
                status: newStatus
            }, {
                withCredentials: true
            });

            setOrders(orders.map((order: any) =>
                order._id === orderId
                    ? { ...order, status: newStatus }
                    : order
            ));

            setLastUpdate(new Date());
            showNotification(` تم تحديث حالة الطلب بنجاح قم بعمل ريفريش للصفحه✅`);
        } catch (err: any) {
            console.error("Error updating single status:", err);
            showNotification(err.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب ❌");
        } finally {
            setUpdatingOrders((prev: any) => ({ ...prev, [orderId]: false }));
        }
    };
    const renderStatus = (status: any) => {
        const statusTexts: { [key: string]: string } = {
            'pending': 'قيد الانتظار',
            'Pending': 'قيد الانتظار',
            'completed': 'مكتمل',
            'Completed': 'مكتمل',
            'cancelled': 'ملغي',
            'Cancelled': 'ملغي',
            'failed': 'فاشل',
            'Failed': 'فاشل',
            'In Progress': 'جاري التنفيذ',
            'In progress': 'جاري التنفيذ',
        };

        const statusText = statusTexts[status] || status;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium `}>
                {statusText}
            </span>
        );
    }
    // تحديث جميع الحالات مرة واحدة
    const handleUpdateAllStatuses = async () => {
        setUpdatingAll(true);
        let updatedCount = 0;
        let errorCount = 0;

        try {
            const results = await Promise.allSettled(
                orders.map(async (order: any) => {
                    if (!order.providerOrderId) return;

                    try {
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order/status/${order.providerOrderId}`, {
                            withCredentials: true
                        });
                        const newStatus = response.data.status;

                        await axios.patch(`${import.meta.env.VITE_API_URL}/new-order/${order._id}`, {
                            status: newStatus
                        }, {
                            withCredentials: true
                        });

                        return { orderId: order._id, newStatus };
                    } catch (err) {
                        console.error(`Error updating order ${order._id}:`, err);
                        throw err;
                    }
                })
            );

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

    const getStatusBadge = (status: any) => {
        const stat = status;
        if (stat === "completed" || stat === "Completed") return "success";
        if (stat === "in progress" || stat === "In Progress") return "warning";
        if (stat === "pending" || stat === "Pending") return "secondary";
        if (stat === "cancelled" || stat === "Cancelled") return "danger";
        if (stat === "failed" || stat === "Failed") return "danger";
        if (stat === "processing" || stat === "Processing") return "warning";
        return "secondary";
    };

    const getCategoryBadge = (category: any) => {
        const categoryColors: any = {
            "TikTok": "primary",
            "Instagram": "danger",
            "YouTube": "danger",
            "Facebook": "info",
            "Twitter": "info",
            "Telegram": "primary"
        };
        return categoryColors[category] || "secondary";
    };

    const getRowStyle = (orderId: any) => ({
        backgroundColor: hoveredRow === orderId ? "#2f3450" : "transparent",
        borderBottom: "1px solid #2f3450",
        transition: "background-color 0.3s"
    });

    const formatDate = (dateString: any) => {
        if (!dateString) return "لم يتم التحديث بعد";
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPlatformIcon = (category: any) => {
        const icons: any = {
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
    const filteredOrders = orders.filter((order: any) =>
        order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.selectedCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.includes(Number(searchTerm)) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const { isDark } = useThemeStore();

    const getCardBackground = () => {
        return isDark ? '#252a41' : '#ffffff';
    };

    const getCardHeaderBackground = () => {
        return isDark ? '#2f3450' : '#f0ede4';
    };

    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getModalBackground = () => {
        return isDark ? '#2f3450' : '#ffffff';
    };

    const getModalBodyBackground = () => {
        return isDark ? '#1e2235' : '#f8f6f0';
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "20px",
                color: getTextColor(),
                transition: "all 0.3s ease"
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
                    <Toast show={showToast} onClose={() => setShowToast(false)} bg={isDark ? "dark" : "light"}>
                        <Toast.Header closeButton>
                            <strong className="me-auto" style={{ color: getTextColor() }}>إشعار</strong>
                        </Toast.Header>
                        <Toast.Body style={{ color: isDark ? 'white' : '#1e2235' }}>{toastMessage}</Toast.Body>
                    </Toast>
                </div>

                {/* العنوان الرئيسي */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <h2 className="fw-bold mb-0" style={{ color: getTextColor() }}>إدارة الطلبات</h2>
                    <div className="d-flex gap-2 align-items-center flex-wrap mt-2 mt-md-0">
                        {lastUpdate && (
                            <small style={{ color: getMutedTextColor() }} className="me-3 d-none d-md-block">
                                آخر تحديث: {formatDate(lastUpdate)}
                            </small>
                        )}

                        <Button
                            variant="outline-success"
                            onClick={handleUpdateAllStatuses}
                            disabled={updatingAll || orders.length === 0}
                            style={{
                                border: isDark ? "1px solid #28a745" : "1px solid #27ae60",
                                borderRadius: "8px",
                                padding: "10px 15px",
                                color: isDark ? "#28a745" : "#27ae60",
                                transition: "all 0.3s ease"
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
                                border: isDark ? "1px solid #4a90e2" : "1px solid #c9a84c",
                                borderRadius: "8px",
                                padding: "10px 15px",
                                color: isDark ? "#4a90e2" : "#c9a84c",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <i className="fas fa-sync-alt me-2"></i>
                            <span className="d-none d-md-inline">تحديث الصفحة</span>
                            <span className="d-inline d-md-none">تحديث</span>
                        </Button>
                    </div>
                </div>

                {/* حقل البحث */}
                <Card className="mb-4" style={{
                    backgroundColor: getCardBackground(),
                    border: isDark ? "none" : "1px solid #dfd7bb",
                    borderRadius: "15px",
                    transition: "all 0.3s ease"
                }}>
                    <Card.Body>
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Control
                                        type="text"
                                        placeholder="ابحث بالمستخدم، الخدمة، المنصة، رقم الطلب،  ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            backgroundColor: getInputBackground(),
                                            border: isDark ? "1px solid #4a90e2" : "1px solid #c9a84c",
                                            color: getInputTextColor(),
                                            borderRadius: "8px",
                                            padding: "12px"
                                        }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 text-md-end text-center mt-2 mt-md-0">
                                <span style={{ color: getMutedTextColor() }}>
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
                                backgroundColor: isDark ? "#4a90e2" : "#c9a84c",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: isDark ? "0 4px 12px rgba(74, 144, 226, 0.3)" : "0 4px 12px rgba(201, 168, 76, 0.3)",
                                minHeight: "120px",
                                transition: "all 0.3s ease"
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
                                backgroundColor: isDark ? "#2ecc71" : "#27ae60",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: isDark ? "0 4px 12px rgba(46, 204, 113, 0.3)" : "0 4px 12px rgba(39, 174, 96, 0.3)",
                                minHeight: "120px",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <Card.Body className="text-white d-flex flex-column justify-content-center align-items-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-check-circle fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.filter((order: any) => order.status === "completed" || order.status === "Completed").length}
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
                                backgroundColor: isDark ? "#f39c12" : "#e67e22",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: isDark ? "0 4px 12px rgba(243, 156, 18, 0.3)" : "0 4px 12px rgba(230, 126, 34, 0.3)",
                                minHeight: "120px",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <Card.Body className="text-white d-flex flex-column justify-content-center align-items-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-spinner fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.filter((order: any) => order.status === "in progress" || order.status === "In Progress").length}
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
                                backgroundColor: isDark ? "#e74c3c" : "#c0392b",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: isDark ? "0 4px 12px rgba(231, 76, 60, 0.3)" : "0 4px 12px rgba(192, 57, 43, 0.3)",
                                minHeight: "120px",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <Card.Body className="text-center text-white d-flex flex-column justify-content-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-clock fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {orders.filter((order: any) => order.status === "pending" || order.status === "Pending").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>الطلبات المعلقة</p>
                            </Card.Body>
                        </Card>
                    </div>
                </div>



                {/* تصميم البطاقات للهواتف */}
                <div className="block">
                    <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark ? ' border border-gray-700' : ' border border-[#dfd7bb] shadow-md'
                        }`}>
                        {/* Header */}
                        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                            }`} style={{
                                backgroundColor: getCardHeaderBackground()
                            }}>
                            <h5 className="mb-0 font-bold text-lg" style={{ color: getTextColor() }}>
                                قائمة الطلبات
                            </h5>
                            {lastUpdate && (
                                <small style={{ color: getMutedTextColor(), fontSize: "0.7rem" }}>
                                    {formatDate(lastUpdate)}
                                </small>
                            )}
                        </div>

                        {/* Body with Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {loading ? (
                                    <div className="col-span-full text-center py-8" style={{ color: getMutedTextColor() }}>
                                        <div className="flex justify-center items-center gap-2">
                                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-white' : 'border-[#c9a84c]'
                                                }`}></div>
                                            <span>جاري التحميل...</span>
                                        </div>
                                    </div>
                                ) : filteredOrders.length > 0 ? (

                                    filteredOrders.map((order: any, index: number) => (
                                        <div
                                            key={order._id}
                                            className={`rounded-lg border-2 p-4 transition-colors h-full min-h-[280px] flex flex-col ${isDark
                                                    ? 'border-gray-700 hover:bg-gray-700/50 bg-gray-800'
                                                    : 'border-[#dfd7bb] hover:bg-gray-50 bg-white'
                                                }`}
                                            onMouseEnter={() => setHoveredRow(order._id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            {/* رأس البطاقة */}
                                            <div className="flex justify-between items-start mb-3 gap-2">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div
                                                        className="rounded-full flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            backgroundColor: isDark ? "#4a90e2" : "#c9a84c",
                                                            color: "white",
                                                            fontSize: "18px",
                                                            fontWeight: "bold"
                                                        }}
                                                    >
                                                        <i className={getPlatformIcon(order.selectedCategory)}></i>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-sm truncate" style={{ color: getTextColor() }}>
                                                            {order.serviceTitle}
                                                        </div>
                                                        <div className="text-xs" style={{ color: getMutedTextColor() }}>
                                                            #{order.id}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${order.status === 'completed'
                                                        ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                                        : order.status === 'pending'
                                                            ? isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                                            : order.status === 'In Progress'
                                                                ? isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                                                : order.status === 'cancelled'
                                                                    ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                                                    : isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {renderStatus(order.status)}
                                                </span>
                                            </div>

                                            {/* معلومات الطلب */}
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div>
                                                    <div className="text-xs" style={{ color: getMutedTextColor() }}>المستخدم</div>
                                                    <div className="font-bold text-sm truncate" style={{ color: getTextColor() }}>
                                                        {order.username}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs" style={{ color: getMutedTextColor() }}>المنصة</div>
                                                    <div>
                                                        <span className={`px-2 py-0.5 text-xs rounded-full ${order.selectedCategory === 'instagram'
                                                                ? isDark ? 'bg-pink-900 text-pink-300' : 'bg-pink-100 text-pink-700'
                                                                : order.selectedCategory === 'youtube'
                                                                    ? isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'
                                                                    : order.selectedCategory === 'tiktok'
                                                                        ? isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                                                        : order.selectedCategory === 'telegram'
                                                                            ? isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                                                            : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                                            }`}>
                                                            {order.selectedCategory}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div>
                                                    <div className="text-xs" style={{ color: getMutedTextColor() }}>الكمية</div>
                                                    <div className="font-bold text-sm" style={{ color: getTextColor() }}>
                                                        {order.quantity?.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs" style={{ color: getMutedTextColor() }}>التكلفة</div>
                                                    <div className="font-bold text-sm text-green-400">
                                                        {formatPrice(order.totalCost)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="text-xs" style={{ color: getMutedTextColor() }}>الرابط</div>
                                                <a
                                                    href={order.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm hover:underline truncate block"
                                                    style={{ color: isDark ? '#60a5fa' : '#2563eb' }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    عرض الرابط
                                                </a>
                                            </div>

                                            <div className="mb-3">
                                                <div className="text-xs" style={{ color: getMutedTextColor() }}>التاريخ</div>
                                                <div className="text-sm" style={{ color: getMutedTextColor() }}>
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>

                                            {/* أزرار الإجراءات - mt-auto عشان تروح للأسفل */}
                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                <button
                                                    onClick={() => handleView(order)}
                                                    className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    عرض
                                                </button>
                                                <button
                                                    onClick={() => handleShowEditModal(order)}
                                                    className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateSingleStatus(order._id, order.providerOrderId)}
                                                    disabled={updatingOrders[order._id] || !order.providerOrderId}
                                                    className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${updatingOrders[order._id] || !order.providerOrderId
                                                            ? isDark ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                            : isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                                                        }`}
                                                >
                                                    {updatingOrders[order._id] ? (
                                                        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white`}></div>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            تحديث
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8" style={{ color: getMutedTextColor() }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        {orders.length === 0 ? 'لا توجد طلبات' : 'لم يتم العثور على طلبات'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* مودال عرض الطلب */}
                <Modal show={showModal} onHide={handleCloseModal} centered size="lg" style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{
                        backgroundColor: getCardHeaderBackground(),
                        color: getTextColor(),
                        borderBottom: isDark ? "1px solid #1e2235" : "1px solid #dfd7bb"
                    }}>
                        <Modal.Title>تفاصيل الطلب</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{
                        backgroundColor: getModalBodyBackground(),
                        color: getTextColor()
                    }}>
                        {selectedOrder ? (
                            <div className="row">
                                <div className="col-12 text-center mb-4">
                                    <div
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            backgroundColor: isDark ? "#4a90e2" : "#c9a84c",
                                            color: "white",
                                            fontSize: "24px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        <i className={getPlatformIcon(selectedOrder.selectedCategory)}></i>
                                    </div>
                                    <h4 style={{ color: getTextColor() }}>طلب #{selectedOrder.id}</h4>
                                    <p style={{ color: getMutedTextColor() }}>{selectedOrder.serviceTitle}</p>
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
                                    <p style={{ color: getTextColor() }}>{selectedOrder.username}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>رقم الطلب:</strong>
                                    <p style={{ color: getTextColor() }}>#{selectedOrder.id}</p>
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
                                    <p style={{ color: getTextColor() }}>{selectedOrder.quantity?.toLocaleString()}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>التكلفه:</strong>
                                    <p className="text-success">{formatPrice(selectedOrder.totalCost || 0)}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <strong>تاريخ الإنشاء:</strong>
                                    <p style={{ color: getTextColor() }}>{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <div className="col-12 mb-3">
                                    <strong>الخدمة:</strong>
                                    <p style={{ color: getTextColor() }}>{selectedOrder.serviceTitle}</p>
                                </div>
                            </div>
                        ) : (
                            <p>جاري التحميل...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{
                        backgroundColor: getCardBackground(),
                        border: "none",
                        borderTop: isDark ? "1px solid #1e2235" : "1px solid #dfd7bb"
                    }}>
                        <Button variant="secondary" onClick={handleCloseModal}>إغلاق</Button>
                    </Modal.Footer>
                </Modal>

                {/* مودال تعديل الطلب */}
                <Modal show={showEditModal} onHide={handleCloseEditModal} centered style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{
                        backgroundColor: getCardHeaderBackground(),
                        color: getTextColor(),
                        borderBottom: isDark ? "1px solid #1e2235" : "1px solid #dfd7bb"
                    }}>
                        <Modal.Title>تعديل الطلب</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{
                        backgroundColor: getModalBodyBackground(),
                        color: getTextColor()
                    }}>





                        <div className="mb-3">
                            <label className="form-label" style={{ color: getTextColor() }}>الحالة</label>
                            <select
                                name="status"
                                className="form-select"
                                value={editingOrder.status}
                                onChange={handleEditInputChange}
                                style={{
                                    backgroundColor: getInputBackground(),
                                    color: getInputTextColor(),
                                    border: isDark ? "1px solid #4a90e2" : "1px solid #c9a84c"
                                }}
                            >
                                <option value="pending">pending</option>
                                <option value="in progress">in progress</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                                <option value="failed">failed</option>
                                <option value="processing">processing</option>
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{
                        backgroundColor: getCardBackground(),
                        border: "none",
                        borderTop: isDark ? "1px solid #1e2235" : "1px solid #dfd7bb"
                    }}>
                        <Button variant="secondary" onClick={handleCloseEditModal}>إلغاء</Button>
                        <Button
                            variant="primary"
                            onClick={handleEditOrder}
                            style={{
                                backgroundColor: isDark ? "#4a90e2" : "#c9a84c",
                                border: "none"
                            }}
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