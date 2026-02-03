import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, DatePicker, message, Modal, Form, Input, InputNumber, Popconfirm, Checkbox, Collapse, Spin, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useRestaurantContext } from '../contexts/RestaurantContext';
import {
    getReservationsByDate,
    createReservation,
    updateReservation,
    cancelReservation,
    deleteReservation,
    confirmReservation,
    checkAvailability,
    getAvailableTimeSlots,
} from '../api/reservations';
import type { Reservation, ReservationRequest, ReservationStatus, AvailableTable } from '../types/reservation';
import { ReservationStatusLabels } from '../types/reservation';
import dayjs, { Dayjs } from 'dayjs';

export default function ReservationManagement() {
    const { selectedRestaurant } = useRestaurantContext();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [form] = Form.useForm();

    // 桌號選擇相關狀態
    const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

    // 查詢訂位列表
    const fetchReservations = async () => {
        if (!selectedRestaurant) {
            message.warning('請先選擇餐廳');
            return;
        }

        setLoading(true);
        try {
            const data = await getReservationsByDate(
                selectedRestaurant.id,
                selectedDate.format('YYYY-MM-DD')
            );
            setReservations(data);
        } catch (error) {
            console.error('Failed to fetch reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRestaurant) {
            fetchReservations();
        }
    }, [selectedRestaurant, selectedDate]);

    // 查詢可用桌號
    const fetchAvailableTables = async (date: Dayjs, time: Dayjs, guests: number) => {
        console.log('=== fetchAvailableTables 開始 ===');
        console.log('參數:', { date, time, guests });

        if (!selectedRestaurant || !date || !time || !guests) {
            console.log('條件不滿足，清空桌號列表');
            setAvailableTables([]);
            setSelectedTableIds([]);
            return;
        }

        setLoadingTables(true);
        setAvailableTables([]); // 清空舊資料

        try {
            const params = {
                restaurantId: selectedRestaurant.id,
                date: date.format('YYYY-MM-DD'),
                guests,
                time: time.format('HH:mm'), // 傳遞時間參數
            };
            console.log('調用 checkAvailability，參數:', params);

            const response = await checkAvailability(params);
            console.log('API 響應:', response);
            console.log('返回的桌號數量:', response.tables.length);

            // 由於後端已經根據時間過濾了，不需要再過濾
            setAvailableTables(response.tables);

            // 自動推薦合適桌號
            if (response.tables.length > 0) {
                const recommended = response.tables.filter(
                    (table) => table.minGuests <= guests && table.maxGuests >= guests
                );
                if (recommended.length > 0) {
                    // 推薦第一個合適的桌號
                    setSelectedTableIds([recommended[0].tableId]);
                    message.success(`已為您推薦：${recommended[0].areaName}-${recommended[0].tableName}`);
                }
            } else {
                message.warning('該時段沒有可用桌號，系統將自動分配');
            }
        } catch (error: any) {
            console.error('Failed to fetch available tables:', error);
            const errorMsg = error?.response?.data?.message || error?.message || '查詢可用桌號失敗';
            message.error(`查詢桌號失敗：${errorMsg}`);
            setAvailableTables([]);
        } finally {
            setLoadingTables(false);
            console.log('=== fetchAvailableTables 結束 ===');
        }
    };



    // 開啟新增對話框
    const handleAdd = async () => {
        console.log('=== handleAdd 開始 ===');
        console.log('選擇的餐廳:', selectedRestaurant);

        setEditingReservation(null);
        form.resetFields();

        // 獲取可用時段資料，設定預設時間為第一個可用時段
        let defaultTime = undefined;
        if (selectedRestaurant && selectedDate) {
            try {
                console.log('開始獲取可用時段資料...');
                const response = await getAvailableTimeSlots({
                    restaurantId: selectedRestaurant.id,
                    date: selectedDate.format('YYYY-MM-DD'),
                });
                console.log('可用時段 API 響應:', response);

                if (response && response.length > 0) {
                    // 使用第一個可用時段（格式：HH:mm:ss）
                    const firstTimeSlot = response[0];
                    console.log('第一個可用時段:', firstTimeSlot);
                    defaultTime = dayjs(firstTimeSlot, 'HH:mm:ss');
                    console.log('解析後的時間:', defaultTime.format('HH:mm'));
                } else {
                    console.log('沒有找到可用時段');
                }
            } catch (error) {
                console.error('獲取可用時段失敗:', error);
                // 如果獲取失敗，不設定預設時間，讓後端處理
            }
        }

        // 設定表單預設值
        const formValues = {
            reservationDate: selectedDate,
            guestCount: 2, // 預設2人
            reservationTime: defaultTime,
        };
        console.log('設定表單值:', formValues);
        form.setFieldsValue(formValues);

        setSelectedTableIds([]);
        setAvailableTables([]);
        setLoadingTables(false);
        setIsModalOpen(true);

        // 如果有預設時間，自動查詢可用桌號
        if (defaultTime && selectedDate) {
            console.log('自動查詢可用桌號...');
            await fetchAvailableTables(selectedDate, defaultTime, 2);
        }
        console.log('=== handleAdd 結束 ===');
    };

    // 開啟編輯對話框
    const handleEdit = (record: Reservation) => {
        setEditingReservation(record);
        form.setFieldsValue({
            ...record,
            reservationDate: dayjs(record.reservationDate),
            reservationTime: dayjs(record.reservationTime, 'HH:mm'),
        });
        setSelectedTableIds(record.assignedTables?.map(t => t.tableId) || []);
        setAvailableTables([]);
        setLoadingTables(false);
        setIsModalOpen(true);
    };

    // 儲存訂位
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const requestData: ReservationRequest = {
                restaurantId: selectedRestaurant!.id,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                reservationDate: values.reservationDate.format('YYYY-MM-DD'),
                reservationTime: values.reservationTime ? values.reservationTime.format('HH:mm') : undefined,
                guestCount: values.guestCount,
                note: values.note,
                // 如果有選擇桌號，則傳入 tableIds
                ...(selectedTableIds.length > 0 ? { tableIds: selectedTableIds } : {}),
            };

            if (editingReservation) {
                await updateReservation(editingReservation.id, requestData);
                message.success('訂位更新成功');
            } else {
                await createReservation(requestData);
                message.success('訂位建立成功');
            }

            setIsModalOpen(false);
            fetchReservations();
        } catch (error) {
            console.error('Failed to save reservation:', error);
        }
    };

    // 取消訂位
    const handleCancel = async (id: string) => {
        try {
            await cancelReservation(id);
            message.success('訂位已取消');
            fetchReservations();
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
        }
    };

    // 刪除訂位
    const handleDelete = async (id: string) => {
        try {
            await deleteReservation(id);
            message.success('訂位已刪除');
            fetchReservations();
        } catch (error) {
            console.error('Failed to delete reservation:', error);
        }
    };

    // 確認訂位
    const handleConfirm = async (id: string) => {
        try {
            await confirmReservation(id);
            message.success('訂位已確認');
            fetchReservations();
        } catch (error) {
            console.error('Failed to confirm reservation:', error);
        }
    };

    // 訂位狀態顏色
    const getStatusColor = (status: ReservationStatus): string => {
        const colorMap: Record<ReservationStatus, string> = {
            PENDING: 'orange',
            CONFIRMED: 'blue',
            ARRIVED: 'cyan',
            SEATED: 'geekblue',
            COMPLETED: 'green',
            CANCELLED: 'red',
            NO_SHOW: 'volcano',
        };
        return colorMap[status] || 'default';
    };

    const columns = [
        {
            title: '訂位時間',
            dataIndex: 'reservationTime',
            key: 'reservationTime',
            width: 100,
        },
        {
            title: '客戶姓名',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 120,
        },
        {
            title: '電話',
            dataIndex: 'customerPhone',
            key: 'customerPhone',
            width: 130,
        },
        {
            title: '人數',
            dataIndex: 'guestCount',
            key: 'guestCount',
            width: 80,
            align: 'center' as const,
        },
        {
            title: '桌號',
            key: 'tables',
            width: 150,
            render: (_: unknown, record: Reservation) => {
                if (!record.assignedTables || record.assignedTables.length === 0) {
                    return <span style={{ color: '#999' }}>未分配</span>;
                }
                return record.assignedTables
                    .map((t) => `${t.areaName}-${t.tableName}`)
                    .join(', ');
            },
        },
        {
            title: '狀態',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: ReservationStatus) => (
                <Tag color={getStatusColor(status)}>
                    {ReservationStatusLabels[status]}
                </Tag>
            ),
        },
        {
            title: '備註',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'actions',
            width: 180,
            render: (_: unknown, record: Reservation) => (
                <Space size="small">
                    {record.status === 'PENDING' && (
                        <Button
                            type="link"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleConfirm(record.id)}
                        >
                            確認
                        </Button>
                    )}
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        編輯
                    </Button>
                    {record.status !== 'CANCELLED' && record.status !== 'COMPLETED' && (
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleCancel(record.id)}
                        >
                            取消
                        </Button>
                    )}
                    <Popconfirm
                        title="確定要刪除此訂位嗎？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="確定"
                        cancelText="取消"
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                            刪除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const { Title } = Typography;

    if (!selectedRestaurant) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Title level={4} type="secondary">請先選擇餐廳</Title>
            </div>
        );
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
                bordered={false}
                bodyStyle={{ padding: '24px' }}
                title={<Title level={4} style={{ margin: 0 }}>訂位管理</Title>}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
                        建立訂位
                    </Button>
                }
            >
                <div style={{ marginBottom: 24 }}>
                    <Space size="large">
                        <Space direction="vertical" size={4}>
                            <Typography.Text type="secondary">選擇日期</Typography.Text>
                            <DatePicker
                                value={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                format="YYYY-MM-DD"
                                size="large"
                                style={{ width: 200 }}
                            />
                        </Space>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={reservations}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 20 }}
                />
            </Card>

            <Modal
                title={editingReservation ? '編輯訂位' : '建立訂位'}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                width={600}
                okText="儲存"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        label="客戶姓名"
                        name="customerName"
                        rules={[{ required: true, message: '請輸入客戶姓名' }]}
                    >
                        <Input placeholder="請輸入客戶姓名" />
                    </Form.Item>

                    <Form.Item
                        label="客戶電話"
                        name="customerPhone"
                        rules={[{ required: true, message: '請輸入客戶電話' }]}
                    >
                        <Input placeholder="請輸入客戶電話" />
                    </Form.Item>

                    <Form.Item
                        label="訂位日期"
                        name="reservationDate"
                        rules={[{ required: true, message: '請選擇訂位日期' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                            onChange={(date) => {
                                const time = form.getFieldValue('reservationTime');
                                const guests = form.getFieldValue('guestCount');
                                if (date && time && guests) {
                                    fetchAvailableTables(date, time, guests);
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="訂位時間"
                        name="reservationTime"
                        rules={[{ required: true, message: '請選擇訂位時間' }]}
                    >
                        <DatePicker.TimePicker
                            style={{ width: '100%' }}
                            format="HH:mm"
                            minuteStep={15}
                            onChange={(time) => {
                                const date = form.getFieldValue('reservationDate');
                                const guests = form.getFieldValue('guestCount');
                                if (date && time && guests) {
                                    fetchAvailableTables(date, time, guests);
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="用餐人數"
                        name="guestCount"
                        initialValue={2}
                        rules={[{ required: true, message: '請輸入用餐人數' }]}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="請輸入用餐人數"
                            onChange={(value) => {
                                const date = form.getFieldValue('reservationDate');
                                const time = form.getFieldValue('reservationTime');
                                if (value && date && time) {
                                    fetchAvailableTables(date, time, value);
                                }
                            }}
                        />
                    </Form.Item>

                    {/* 桌號選擇器 */}
                    <Form.Item label="選擇桌號（選填，未選則自動分配）">
                        {loadingTables ? (
                            <Spin tip="查詢可用桌號中..." />
                        ) : availableTables.length > 0 ? (
                            (() => {
                                // 依區域分組
                                const groupedByArea = availableTables.reduce((acc, table) => {
                                    if (!acc[table.areaName]) {
                                        acc[table.areaName] = [];
                                    }
                                    acc[table.areaName].push(table);
                                    return acc;
                                }, {} as Record<string, AvailableTable[]>);

                                const currentTime = form.getFieldValue('reservationTime');
                                const timeStr = currentTime ? currentTime.format('HH:mm') : '';

                                return (
                                    <Collapse
                                        defaultActiveKey={Object.keys(groupedByArea)}
                                        size="small"
                                    >
                                        {Object.entries(groupedByArea).map(([areaName, tables]) => (
                                            <Collapse.Panel key={areaName} header={`${areaName} (${tables.length}桌)`}>
                                                <Checkbox.Group
                                                    value={selectedTableIds}
                                                    onChange={(checkedValues) => setSelectedTableIds(checkedValues as string[])}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Space direction="vertical" style={{ width: '100%' }}>
                                                        {tables.map((table) => {
                                                            const isAvailable = timeStr && table.availableTimes && table.availableTimes.includes(timeStr);
                                                            return (
                                                                <Checkbox
                                                                    key={table.tableId}
                                                                    value={table.tableId}
                                                                    disabled={!isAvailable}
                                                                >
                                                                    <Space>
                                                                        <span>{table.tableName} ({table.minGuests}-{table.maxGuests}人)</span>
                                                                        {!isAvailable && <Tag color="red">已佔用</Tag>}
                                                                        {isAvailable && selectedTableIds.includes(table.tableId) && <Tag color="green">推薦</Tag>}
                                                                    </Space>
                                                                </Checkbox>
                                                            );
                                                        })}
                                                    </Space>
                                                </Checkbox.Group>
                                            </Collapse.Panel>
                                        ))}
                                    </Collapse>
                                );
                            })()
                        ) : (
                            <div style={{ color: '#999', padding: '12px', background: '#fafafa', borderRadius: '4px' }}>
                                請先填寫日期、時間和人數以查詢可用桌號
                            </div>
                        )}
                        {selectedTableIds.length > 0 && (
                            <div style={{ marginTop: 8, color: '#1890ff' }}>
                                已選擇 {selectedTableIds.length} 個桌號
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item label="備註" name="note">
                        <Input.TextArea rows={4} placeholder="請輸入備註（選填）" />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
}
