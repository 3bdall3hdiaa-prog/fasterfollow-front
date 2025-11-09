import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner, Modal, Card, Badge, Form } from "react-bootstrap";
import axios from "axios";

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [userBalance, setUserBalance] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // إضافة مستخدم جديد
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: "",
        role: "",
        email: "",
        password: "",
        status: "active"
    });

    // تعديل مستخدم
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState({
        _id: "",
        username: "",
        role: "",
        email: "",
        status: ""
    });

    // التحكم في الرصيد
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceData, setBalanceData] = useState({
        username: "",
        amount: ""
    });

    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleShowEditModal = (user) => {
        setEditingUser({
            _id: user._id,
            username: user.name,
            role: user.job,
            email: user.email,
            status: user.status
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingUser({
            _id: "",
            username: "",
            role: "",
            email: "",
            status: "active"
        });
    };

    // دوال التحكم في الرصيد
    const handleShowBalanceModal = () => {
        setBalanceData({
            username: "",
            amount: ""
        });
        setShowBalanceModal(true);
    };

    const handleCloseBalanceModal = () => {
        setShowBalanceModal(false);
        setBalanceData({
            username: "",
            amount: ""
        });
    };

    const handleBalanceInputChange = (e) => {
        const { name, value } = e.target;
        setBalanceData({ ...balanceData, [name]: value });
    };

    const handleBalanceSubmit = async () => {
        try {
            if (!balanceData.username || !balanceData.amount) {
                alert("يرجى ملء جميع الحقول");
                return;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/managecopons/editbalance`, {
                userName: balanceData.username,
                amount: balanceData.amount
            });

            alert("تم تحديث الرصيد بنجاح ✅");
            handleCloseBalanceModal();
        } catch (err) {
            console.error("Balance update error:", err);
            alert(err.response.data.message || "حدث خطأ أثناء تحديث الرصيد");
        }
    };

    // دالة لجلب الرصيد من endpoint البايبال
    const fetchUserBalance = async (userName) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/paypal`);
            const paypalData = response.data;

            // جمع الـ amount حيث userName يساوي الاسم المطلوب
            const totalBalance = paypalData
                .filter(transaction => transaction.userName === userName)
                .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);

            setUserBalance(totalBalance);
        } catch (err) {
            console.error("Error fetching balance:", err);
            setUserBalance(0);
        }
    };

    const handleView = async (user) => {
        setSelectedUser(user);
        setShowModal(true);
        // جلب الرصيد عند فتح نافذة العرض
        await fetchUserBalance(user.name);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setUserBalance(0); // إعادة تعيين الرصيد عند الإغلاق
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingUser({ ...editingUser, [name]: value });
    };

    const handleAddUser = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, newUser);
            alert("تم إضافة المستخدم بنجاح ✅");

            setUsers([...users, {
                _id: res.data._id || Date.now(),
                name: newUser.username,
                job: newUser.role,
                email: newUser.email,
                status: newUser.status,
                joinDate: new Date().toISOString().split("T")[0]
            }]);

            setNewUser({ username: "", role: "", email: "", password: "", status: "active" });
            setShowAddModal(false);
        } catch (err) {
            console.error("Add user error:", err);
            alert("حدث خطأ أثناء الإضافة ❌");
        }
    };

    const handleEditUser = async () => {
        try {
            // استدعاء endpoint التعديل مع ID في الباراميتر
            await axios.put(`${import.meta.env.VITE_API_URL}/getallusers/${editingUser._id}`, {
                username: editingUser.username,
                role: editingUser.role,
                email: editingUser.email,
                status: editingUser.status
            });

            // تحديث البيانات في الـ state
            setUsers(users.map(user =>
                user._id === editingUser._id
                    ? {
                        ...user,
                        name: editingUser.username,
                        job: editingUser.role,
                        email: editingUser.email,
                        status: editingUser.status
                    }
                    : user
            ));

            alert("تم تعديل المستخدم بنجاح ✅");
            handleCloseEditModal();
        } catch (err) {
            console.error("Edit user error:", err);
            alert("حدث خطأ أثناء التعديل ❌");
        }
    };

    // تحميل المستخدمين من الـ API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/getallusers`);
                const formattedUsers = res.data.map(user => ({
                    _id: user._id || user.id,
                    name: user.username || "بدون اسم",
                    job: user.role || "غير محدد",
                    email: user.email || "لا يوجد بريد إلكتروني",
                    status: user.status || "inactive",
                    joinDate: user.joinDate || new Date().toISOString().split('T')[0]
                }));
                setUsers(formattedUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/deleteuser/${id}`);
                setUsers(users.filter((u) => u._id !== id));
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    const handleBlock = async (id) => {
        if (window.confirm("هل تريد حظر هذا المستخدم؟")) {
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/blockuser/${id}`);
                setUsers(users.map(user =>
                    user._id === id
                        ? { ...user, status: user.status === "active" ? "inactive" : "active" }
                        : user
                ));
                alert("تم تغيير حالة المستخدم بنجاح");
            } catch (err) {
                console.error("Block error:", err);
            }
        }
    };

    const getStatusBadge = (status) => {
        if (status === "active") return "success";
        if (status === "banned") return "danger";
        return "secondary";
    };

    const getRowStyle = (userId) => ({
        backgroundColor: hoveredRow === userId ? "#2f3450" : "transparent",
        borderBottom: "1px solid #2f3450",
        transition: "background-color 0.3s"
    });

    const getInitials = (name) => {
        if (!name || name === "بدون اسم") return "م";
        const names = name.split(' ');
        const firstInitial = names[0]?.[0] || "م";
        const lastInitial = names[1]?.[0] || "";
        return firstInitial + lastInitial;
    };

    // فلترة المستخدمين حسب البحث
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.job?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                {/* العنوان الرئيسي */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0" style={{ color: "#ffffff" }}>إدارة المستخدمين</h2>
                    <div className="d-flex gap-2">
                        <Button
                            variant="primary"
                            onClick={handleShowBalanceModal}
                            style={{
                                backgroundColor: "#28a745",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 20px"
                            }}
                        >
                            التحكم في الرصيد
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleShowAddModal}
                            style={{
                                backgroundColor: "#4a90e2",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 20px"
                            }}
                        >
                            إضافة مستخدم جديد
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
                                        placeholder="ابحث بالاسم، البريد الإلكتروني، أو الوظيفة..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            backgroundColor: "#f8f8f9ff",
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
                                    إجمالي المستخدمين: {users.length} | المعروض: {filteredUsers.length}
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
                                    <i className="fas fa-users fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {users.length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>إجمالي المستخدمين</p>
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
                                        {users.filter((u) => u.status === "active").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>المستخدمين النشطين</p>
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
                                minHeight: "120px",
                            }}
                        >
                            <Card.Body className="text-white d-flex flex-column justify-content-center align-items-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-pause-circle fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {users.filter((u) => u.status === "inactive").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>المستخدمين غير النشطين</p>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-6 col-md-3 mb-3">
                        <Card
                            className="h-100"
                            style={{
                                backgroundColor: "#8e44ad",
                                border: "none",
                                borderRadius: "15px",
                                boxShadow: "0 4px 12px rgba(142, 68, 173, 0.3)",
                                minHeight: "120px"
                            }}
                        >
                            <Card.Body className="text-center text-white d-flex flex-column justify-content-center">
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                    <i className="fas fa-ban fa-lg me-2"></i>
                                    <h4 className="mb-0 fw-bold">
                                        {users.filter(u => u.status === "banned").length}
                                    </h4>
                                </div>
                                <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>المستخدمين المحظورين</p>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* جدول المستخدمين - للشاشات الكبيرة */}
                <div className="d-none d-md-block">
                    <Card style={{ backgroundColor: "#252a41", border: "none", borderRadius: "15px" }}>
                        <Card.Header style={{ backgroundColor: "#2f3450", border: "none", padding: "20px" }}>
                            <h5 className="mb-0" style={{ color: "#ffffff" }}>قائمة المستخدمين</h5>
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
                                            <th>الاسم</th>
                                            <th>الوظيفة</th>
                                            <th>البريد الإلكتروني</th>
                                            <th>الحالة</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr
                                                    key={user._id}
                                                    style={getRowStyle(user._id)}
                                                    onMouseEnter={() => setHoveredRow(user._id)}
                                                    onMouseLeave={() => setHoveredRow(null)}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>
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
                                                                {getInitials(user.name)}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold" style={{ color: "#000000ff", fontSize: "16px" }}>{user.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{user.job}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <Badge bg={getStatusBadge(user.status)}>
                                                            {user.status === "active"
                                                                ? "نشط"
                                                                : user.status === "banned"
                                                                    ? "محظور"
                                                                    : "غير نشط"}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-info"
                                                                onClick={() => handleView(user)}
                                                            >
                                                                عرض
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-warning"
                                                                onClick={() => handleShowEditModal(user)}
                                                            >
                                                                تعديل
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center text-muted py-4">
                                                    <i className="fas fa-users fa-2x mb-3 d-block"></i>
                                                    {users.length === 0 ? 'لا يوجد مستخدمين' : 'لم يتم العثور على مستخدمين'}
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
                            <h5 className="mb-0" style={{ color: "#ffffff" }}>قائمة المستخدمين</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="light" />
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <div
                                        key={user._id}
                                        className="border-bottom border-gray-600 p-3 hover-bg"
                                        style={{
                                            backgroundColor: hoveredRow === user._id ? "#2f3450" : "transparent",
                                            transition: "background-color 0.3s"
                                        }}
                                        onMouseEnter={() => setHoveredRow(user._id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{
                                                        width: "45px",
                                                        height: "45px",
                                                        backgroundColor: "#4a90e2",
                                                        color: "white",
                                                        fontSize: "16px",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    {getInitials(user.name)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-white">{user.name}</div>
                                                    <div className="text-muted small">{user.job}</div>
                                                </div>
                                            </div>
                                            <Badge bg={getStatusBadge(user.status)}>
                                                {user.status === "active" ? "نشط" : user.status === "banned" ? "محظور" : "غير نشط"}
                                            </Badge>
                                        </div>

                                        <div className="mb-3">
                                            <div className="text-muted small">البريد الإلكتروني</div>
                                            <div className="text-white">{user.email}</div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline-info"
                                                onClick={() => handleView(user)}
                                                className="flex-fill"
                                            >
                                                <i className="fas fa-eye me-1"></i>
                                                عرض
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-warning"
                                                onClick={() => handleShowEditModal(user)}
                                                className="flex-fill"
                                            >
                                                <i className="fas fa-edit me-1"></i>
                                                تعديل
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-users fa-2x mb-3 d-block"></i>
                                    {users.length === 0 ? 'لا يوجد مستخدمين' : 'لم يتم العثور على مستخدمين'}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* باقي المودالات بدون تغيير */}
                {/* مودال عرض المستخدم */}
                <Modal show={showModal} onHide={handleCloseModal} centered style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{ backgroundColor: "#2f3450", color: "white" }}>
                        <Modal.Title>تفاصيل المستخدم</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#96979dff", color: "white" }}>
                        {selectedUser ? (
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
                                        {getInitials(selectedUser.name)}
                                    </div>
                                    <h4 style={{ color: "#ffffff" }}>{selectedUser.name}</h4>
                                    <p className="text-muted">{selectedUser.email}</p>
                                </div>
                                <div className="col-6 mb-3">
                                    <strong>الوظيفة:</strong>
                                    <p>{selectedUser.job}</p>
                                </div>
                                <div className="col-6 mb-3">
                                    <strong>الحالة:</strong>
                                    <p>
                                        <Badge bg={getStatusBadge(selectedUser.status)}>
                                            {selectedUser.status === "active"
                                                ? "نشط"
                                                : selectedUser.status === "banned"
                                                    ? "محظور"
                                                    : "غير نشط"}
                                        </Badge>
                                    </p>
                                </div>
                                <div className="col-6 mb-3">
                                    <strong>تاريخ الانضمام:</strong>
                                    <p>{selectedUser.joinDate}</p>
                                </div>
                                <div className="col-6 mb-3">
                                    <strong>الرصيد:</strong>
                                    <p>
                                        <Badge bg="info" style={{ fontSize: "16px", padding: "8px 12px" }}>
                                            {userBalance.toFixed(2)} $
                                        </Badge>
                                    </p>
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

                {/* مودال إضافة مستخدم */}
                <Modal show={showAddModal} onHide={handleCloseAddModal} centered style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{ backgroundColor: "#2f3450", color: "white" }}>
                        <Modal.Title>إضافة مستخدم جديد</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#96979dff", color: "white" }}>
                        <div className="mb-3">
                            <label className="form-label">الاسم</label>
                            <input type="text" name="username" className="form-control" value={newUser.username} onChange={handleInputChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الوظيفة</label>
                            <input type="text" name="role" className="form-control" value={newUser.role} onChange={handleInputChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">البريد الإلكتروني</label>
                            <input type="email" name="email" className="form-control" value={newUser.email} onChange={handleInputChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">كلمة المرور</label>
                            <input type="password" name="password" className="form-control" value={newUser.password} onChange={handleInputChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الحالة</label>
                            <select name="status" className="form-select" value={newUser.status} onChange={handleInputChange}>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="banned">محظور</option>
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "#252a41", border: "none" }}>
                        <Button variant="secondary" onClick={handleCloseAddModal}>إلغاء</Button>
                        <Button variant="primary" onClick={handleAddUser} style={{ backgroundColor: "#4a90e2", border: "none" }}>
                            إضافة
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* مودال تعديل المستخدم */}
                <Modal show={showEditModal} onHide={handleCloseEditModal} centered style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{ backgroundColor: "#2f3450", color: "white" }}>
                        <Modal.Title>تعديل المستخدم</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#96979dff", color: "white" }}>
                        <div className="mb-3">
                            <label className="form-label">الاسم</label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                value={editingUser.username}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الوظيفة</label>
                            <input
                                type="text"
                                name="role"
                                className="form-control"
                                value={editingUser.role}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={editingUser.email}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الحالة</label>
                            <select
                                name="status"
                                className="form-select"
                                value={editingUser.status}
                                onChange={handleEditInputChange}
                            >
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="banned">محظور</option>
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "#252a41", border: "none" }}>
                        <Button variant="secondary" onClick={handleCloseEditModal}>إلغاء</Button>
                        <Button
                            variant="primary"
                            onClick={handleEditUser}
                            style={{ backgroundColor: "#4a90e2", border: "none" }}
                        >
                            حفظ التعديلات
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* مودال التحكم في الرصيد */}
                <Modal show={showBalanceModal} onHide={handleCloseBalanceModal} centered style={{ direction: "rtl" }}>
                    <Modal.Header closeButton style={{ backgroundColor: "#2f3450", color: "white" }}>
                        <Modal.Title>التحكم في الرصيد</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#96979dff", color: "white" }}>
                        <div className="mb-3">
                            <label className="form-label">اسم المستخدم</label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                value={balanceData.username}
                                onChange={handleBalanceInputChange}
                                placeholder="أدخل اسم المستخدم"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">الكمية</label>
                            <input
                                type="number"
                                name="amount"
                                className="form-control"
                                value={balanceData.amount}
                                onChange={handleBalanceInputChange}
                                placeholder="أدخل الكمية"
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: "#252a41", border: "none" }}>
                        <Button variant="secondary" onClick={handleCloseBalanceModal}>إلغاء</Button>
                        <Button
                            variant="success"
                            onClick={handleBalanceSubmit}
                            style={{ backgroundColor: "#28a745", border: "none" }}
                        >
                            تحديث الرصيد
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default UsersManagement;